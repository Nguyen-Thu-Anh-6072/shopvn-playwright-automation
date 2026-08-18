import { Page } from '@playwright/test';

/**
 * Shared navigation for every page object.
 *
 * There are no fixed sleeps anywhere in this framework. Waiting is always
 * expressed as a condition, so tests run as fast as the app allows and do
 * not flake when a response is slower than usual.
 */
export abstract class BasePage {
  constructor(protected readonly page: Page) {}

  protected abstract readonly path: string;

  async open(): Promise<void> {
    await this.page.goto(this.path, { waitUntil: 'domcontentloaded' });
  }
}
