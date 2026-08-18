import { APIRequestContext, APIResponse } from '@playwright/test';

/**
 * Raised when a request does not succeed. Carrying the status and body makes
 * setup failures readable instead of surfacing as a vague undefined later on.
 */
export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly body: string,
  ) {
    super(`${message} -> HTTP ${status}: ${body}`);
    this.name = 'ApiError';
  }
}

/**
 * Thin transport layer over Playwright's request context.
 *
 * This layer deliberately contains no assertions. It returns parsed data or
 * throws, which keeps every expect() in the tests where a reader looks for
 * them, and stops setup helpers from reporting themselves as test failures.
 */
export class ApiClient {
  constructor(
    private readonly request: APIRequestContext,
    private token?: string,
  ) {}

  setToken(token: string | undefined): void {
    this.token = token;
  }

  async get<T>(url: string): Promise<T> {
    return this.parse<T>(await this.request.get(url, { headers: this.headers() }), `GET ${url}`);
  }

  async postJson<T>(url: string, data: unknown): Promise<T> {
    return this.parse<T>(
      await this.request.post(url, { headers: this.headers(), data }),
      `POST ${url}`,
    );
  }

  async putJson<T>(url: string, data: unknown): Promise<T> {
    return this.parse<T>(
      await this.request.put(url, { headers: this.headers(), data }),
      `PUT ${url}`,
    );
  }

  /** Several endpoints accept multipart/form-data rather than JSON. */
  async postForm<T>(url: string, form: Record<string, string>): Promise<T> {
    return this.parse<T>(
      await this.request.post(url, { headers: this.authOnly(), multipart: form }),
      `POST ${url}`,
    );
  }

  async patchForm<T>(url: string, form: Record<string, string>): Promise<T> {
    return this.parse<T>(
      await this.request.patch(url, { headers: this.authOnly(), multipart: form }),
      `PATCH ${url}`,
    );
  }

  async delete(url: string): Promise<void> {
    const response = await this.request.delete(url, { headers: this.headers() });
    if (!response.ok()) {
      throw new ApiError(`DELETE ${url} failed`, response.status(), await response.text());
    }
  }

  /**
   * Delete that tolerates a missing resource, used by teardown so cleanup of
   * something already gone cannot turn a passing test red.
   */
  async deleteIfExists(url: string): Promise<void> {
    const response = await this.request.delete(url, { headers: this.headers() });
    if (!response.ok() && response.status() !== 404) {
      throw new ApiError(`DELETE ${url} failed`, response.status(), await response.text());
    }
  }

  private headers(): Record<string, string> {
    return { 'Content-Type': 'application/json', ...this.authOnly() };
  }

  /** Multipart requests must not set Content-Type; the boundary is generated. */
  private authOnly(): Record<string, string> {
    return this.token ? { Authorization: `Bearer ${this.token}` } : {};
  }

  private async parse<T>(response: APIResponse, label: string): Promise<T> {
    const body = await response.text();
    if (!response.ok()) {
      throw new ApiError(`${label} failed`, response.status(), body);
    }
    return body ? (JSON.parse(body) as T) : (undefined as T);
  }
}
