import { test, expect } from '../fixtures/baseTest';
import { loadData } from '../utils/dataLoader';

interface NameCase {
  caseName: string;
  newName: string;
}

const { nameUpdates } = loadData<{ nameUpdates: NameCase[] }>('profile.json');

test.describe('Scenario 6 - Update full name, then clean up via the API @required', () => {
  for (const nameCase of nameUpdates) {
    test(`full name is updated - ${nameCase.caseName}`, async ({
      authenticatedPage,
      testAccount,
      profilePage,
      profileApi,
      header,
    }) => {
      void authenticatedPage;
      const originalName = testAccount.name;

      // Restoring the original name through the API keeps the account in the
      // state the test found it, independent of whether the test passed.
      test.info().attach('original-name', { body: originalName });

      try {
        await test.step('Open the profile page from the header', async () => {
          await header.openProfile();
          await profilePage.waitUntilLoaded();
        });

        await test.step('The form starts with the registered name', async () => {
          expect(await profilePage.currentName()).toBe(originalName);
        });

        await test.step('Save a new full name', async () => {
          await profilePage.updateName(nameCase.newName);
        });

        await test.step('The form shows the new name', async () => {
          await expect(profilePage.nameInput).toHaveValue(nameCase.newName);
        });

        await test.step('The new name is persisted, not only rendered', async () => {
          const profile = await profileApi.getProfile();
          expect(profile.name).toBe(nameCase.newName);
        });
      } finally {
        await test.step('Clean up: restore the original name via the API', async () => {
          await profileApi.updateName(originalName);
          const restored = await profileApi.getProfile();
          expect(restored.name).toBe(originalName);
        });
      }
    });
  }
});
