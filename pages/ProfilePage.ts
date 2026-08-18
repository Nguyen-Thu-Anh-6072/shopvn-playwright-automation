import { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class ProfilePage extends BasePage {
  protected readonly path = '/profile';

  readonly nameInput: Locator;
  readonly saveButton: Locator;

  constructor(page: Page) {
    super(page);
    this.nameInput = page.getByTestId('profile-name');
    this.saveButton = page.getByTestId('profile-save');
  }

  async waitUntilLoaded(): Promise<void> {
    await this.nameInput.waitFor({ state: 'visible' });
  }

  /**
   * Saves a new display name and waits for the update call to return, so the
   * assertion that follows reads persisted state.
   */
  async updateName(name: string): Promise<void> {
    await this.nameInput.fill(name);
    await Promise.all([
      this.page.waitForResponse(
        (response) =>
          response.url().includes('/api/profile') && response.request().method() === 'PATCH',
      ),
      this.saveButton.click(),
    ]);
  }

  async currentName(): Promise<string> {
    return this.nameInput.inputValue();
  }
}
