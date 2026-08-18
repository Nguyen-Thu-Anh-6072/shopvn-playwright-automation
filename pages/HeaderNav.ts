import { Locator, Page } from '@playwright/test';

/**
 * Site-wide header. Modelled as a component rather than a page because it is
 * present on every screen.
 */
export class HeaderNav {
  readonly cartButton: Locator;
  readonly profileLink: Locator;

  constructor(private readonly page: Page) {
    // Anchored so it matches only the header button and not the
    // "Them vao gio" buttons, whose labels end with the same emoji.
    // The label carries the item count, e.g. "🛒 1".
    this.cartButton = page.getByRole('button', { name: /^\s*🛒/ });
    this.profileLink = page.getByTestId('header-profile-link');
  }

  /** Number shown on the cart button; zero when the label has no digits. */
  async cartCount(): Promise<number> {
    const label = (await this.cartButton.innerText()).trim();
    const digits = label.replace(/\D/g, '');
    return digits === '' ? 0 : Number(digits);
  }

  async openCart(): Promise<void> {
    await this.cartButton.click();
  }

  async openProfile(): Promise<void> {
    await this.profileLink.click();
  }
}
