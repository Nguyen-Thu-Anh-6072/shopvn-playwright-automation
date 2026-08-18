import { ApiClient } from './ApiClient';
import { endpoints } from './endpoints';
import { AuthResult, Credentials, TestAccount } from './types';

/**
 * Account creation and sign-in.
 *
 * Every test gets its own account from here, which is what allows the suite
 * to run in parallel: no two tests share state that one of them can mutate.
 */
export class AuthApi {
  constructor(private readonly client: ApiClient) {}

  /** Unique credentials so parallel workers never collide on username. */
  static buildCredentials(prefix = 'qa'): Credentials & { name: string } {
    const unique = `${Date.now()}${Math.floor(Math.random() * 1000)}`;
    return {
      username: `${prefix}_${unique}`,
      password: 'Qa@12345678',
      name: 'QA Automation',
    };
  }

  /** Registration accepts multipart/form-data, not JSON. */
  async register(account: Credentials & { name: string }): Promise<TestAccount> {
    const result = await this.client.postForm<AuthResult>(endpoints.auth.register, {
      username: account.username,
      password: account.password,
      name: account.name,
    });

    return {
      username: account.username,
      password: account.password,
      name: result.user.name,
      id: result.user.id,
      token: result.token,
    };
  }

  async login(credentials: Credentials): Promise<AuthResult> {
    return this.client.postJson<AuthResult>(endpoints.auth.login, credentials);
  }

  async currentUser(): Promise<AuthResult['user']> {
    return this.client.get<AuthResult['user']>(endpoints.auth.me);
  }
}
