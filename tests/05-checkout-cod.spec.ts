import { test, expect } from '../fixtures/baseTest';
import { loadData } from '../utils/dataLoader';
import { Recipient } from '../api/types';

interface RecipientCase extends Recipient {
  caseName: string;
}

const checkoutData = loadData<{
  validRecipients: RecipientCase[];
  paymentMethod: string;
  expectedOrderStatus: string;
}>('checkout.json');

test.describe('Scenario 5 - Checkout succeeds with valid recipient info (COD) @required', () => {
  test.afterEach(async ({ orderApi, cartApi }) => {
    // Remove the order and empty the basket so the account is left as found.
    await orderApi.deleteAllOrders().catch(() => undefined);
    await cartApi.clear().catch(() => undefined);
  });

  // Data-driven: every recipient in checkout.json becomes its own test, so
  // covering another case is a data change rather than a copy of this block.
  for (const recipient of checkoutData.validRecipients) {
    test(`order is placed successfully - ${recipient.caseName}`, async ({
      authenticatedPage,
      productApi,
      cartApi,
      cartPage,
      checkoutPage,
      orderApi,
    }) => {
      void authenticatedPage;

      const product = await test.step('Seed the cart through the API', async () => {
        const first = await productApi.getFirstProduct();
        await cartApi.setItems([
          {
            productId: first.id ?? first._id!,
            name: first.name,
            price: first.price,
            quantity: 1,
            emoji: first.emoji,
          },
        ]);
        return first;
      });

      await test.step('Go from the cart to the checkout form', async () => {
        await cartPage.open();
        await cartPage.proceedToCheckout();
        await expect(checkoutPage.nameInput).toBeVisible();
      });

      await test.step('Fill in valid recipient details', async () => {
        await checkoutPage.fillRecipient(recipient);
      });

      await test.step('Choose cash on delivery', async () => {
        await checkoutPage.selectCashOnDelivery();
      });

      await test.step('Place the order', async () => {
        await checkoutPage.placeOrder();
      });

      await test.step('The confirmation screen is shown', async () => {
        await expect(checkoutPage.continueButton).toBeVisible();
      });

      await test.step('The order is stored with the details that were entered', async () => {
        const orders = await orderApi.listOrders();
        expect(orders).toHaveLength(1);

        const order = orders[0];
        expect(order.recipientName).toBe(recipient.recipientName);
        expect(order.recipientPhone).toBe(recipient.recipientPhone);
        expect(order.address).toBe(recipient.address);
        expect(order.paymentMethod).toBe(checkoutData.paymentMethod);
        expect(order.status).toBe(checkoutData.expectedOrderStatus);
        expect(order.items[0].name).toBe(product.name);
      });
    });
  }
});
