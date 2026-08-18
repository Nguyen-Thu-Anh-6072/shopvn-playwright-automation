import { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class ProductsPage extends BasePage {
  protected readonly path = '/home';

  readonly addToCartButtons: Locator;

  constructor(page: Page) {
    super(page);
    this.addToCartButtons = page.getByRole('button', { name: /Thêm vào giỏ/ });
  }

  /**
   * Waits for the catalogue to render before any interaction.
   *
   * Used instead of navigating, because the app already shows the catalogue
   * once a session exists and a fresh page load would drop it.
   */
  async waitUntilLoaded(): Promise<void> {
    await this.addToCartButtons.first().waitFor({ state: 'visible' });
  }

  /**
   * Adds a product by position and waits for the cart write to complete, so
   * the following assertion runs against saved state rather than a stale page.
   */
  async addProductAt(index: number): Promise<void> {
    await Promise.all([
      this.page.waitForResponse(
        (response) =>
          response.url().includes('/api/cart') && response.request().method() === 'PUT',
      ),
      this.addToCartButtons.nth(index).click(),
    ]);
  }

  async productCount(): Promise<number> {
    return this.addToCartButtons.count();
  }
}
