import { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class CartPage extends BasePage {
  protected readonly path = '/cart';

  readonly checkoutButton: Locator;

  constructor(page: Page) {
    super(page);
    this.checkoutButton = page.getByRole('button', { name: /Thanh toán ngay/ });
  }

  /**
   * The row for one product, matched by the product name.
   *
   * Scoping to the row means a later assertion cannot accidentally read a
   * value that belongs to a different item in the basket.
   */
  itemRow(productName: string): Locator {
    return this.page
      .locator('[data-testid^="cart-item"]')
      .filter({ hasText: productName });
  }

  /** Falls back to a plain text match when the row markup is not test-tagged. */
  itemByText(productName: string): Locator {
    return this.page.getByText(productName, { exact: false }).first();
  }

  async proceedToCheckout(): Promise<void> {
    await this.checkoutButton.click();
  }
}
