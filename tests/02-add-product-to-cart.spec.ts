import { test, expect } from '../fixtures/baseTest';
import { loadData } from '../utils/dataLoader';

const { singleProduct } = loadData<{
  singleProduct: { productIndex: number; expectedQuantity: number; expectedCartCount: number };
}>('cart.json');

test.describe('Scenario 2 - Add a single product to the cart @required', () => {
  // Start from a known state instead of assuming the cart is empty.
  test.beforeEach(async ({ cartApi }) => {
    await cartApi.clear();
  });

  // Whatever the test created, it also removes, so a failure never leaves
  // data behind that could change the outcome of another run.
  test.afterEach(async ({ cartApi }) => {
    await cartApi.clear().catch(() => {
      // Cleanup must not turn a passing test red.
    });
  });

  test('cart shows the product once with quantity one', async ({
    authenticatedPage,
    productsPage,
    cartPage,
    cartApi,
    header,
  }) => {
    void authenticatedPage;

    // Signing in already lands on the catalogue, so navigating again would
    // only add a reload that the scenario does not describe.
    await test.step('The catalogue is displayed after signing in', async () => {
      await productsPage.waitUntilLoaded();
    });

    await test.step('Add one product to the cart', async () => {
      await productsPage.addProductAt(singleProduct.productIndex);
    });

    await test.step('Header cart count reflects the added item', async () => {
      await expect
        .poll(() => header.cartCount())
        .toBe(singleProduct.expectedCartCount);
    });

    // Reading the cart back from the API establishes what the UI is supposed
    // to display, so the check below compares against real data rather than
    // a product name hard-coded in the test.
    const cartItems = await cartApi.getItems();

    await test.step('Cart is persisted with exactly one line item', async () => {
      expect(cartItems).toHaveLength(1);
      expect(cartItems[0].quantity).toBe(singleProduct.expectedQuantity);
    });

    await test.step('Cart page displays that product', async () => {
      await cartPage.open();
      await expect(cartPage.itemByText(cartItems[0].name)).toBeVisible();
      await expect(cartPage.checkoutButton).toBeVisible();
    });
  });
});
