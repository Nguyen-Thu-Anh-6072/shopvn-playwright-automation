import { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { Recipient } from '../api/types';

export class CheckoutPage extends BasePage {
  protected readonly path = '/checkout';

  readonly nameInput: Locator;
  readonly phoneInput: Locator;
  readonly addressInput: Locator;
  readonly codOption: Locator;
  readonly submitButton: Locator;
  readonly continueButton: Locator;

  constructor(page: Page) {
    super(page);
    this.nameInput = page.getByTestId('checkout-name');
    this.phoneInput = page.getByTestId('checkout-phone');
    this.addressInput = page.getByTestId('checkout-address');
    this.codOption = page.getByText(/Thanh toán khi nhận hàng \(COD\)/);
    this.submitButton = page.getByTestId('checkout-submit');
    // Only rendered once the order has been accepted, so it doubles as the
    // success marker for the scenario.
    this.continueButton = page.getByTestId('checkout-continue');
  }

  async fillRecipient(recipient: Recipient): Promise<void> {
    await this.nameInput.fill(recipient.recipientName);
    await this.phoneInput.fill(recipient.recipientPhone);
    await this.addressInput.fill(recipient.address);
  }

  async selectCashOnDelivery(): Promise<void> {
    await this.codOption.click();
  }

  /**
   * Places the order and waits for the create call to return, so the test
   * asserts on a persisted order rather than an optimistic UI update.
   */
  async placeOrder(): Promise<void> {
    await Promise.all([
      this.page.waitForResponse(
        (response) =>
          response.url().includes('/api/orders') && response.request().method() === 'POST',
      ),
      this.submitButton.click(),
    ]);
  }
}
