import { test as base, APIRequestContext, Page } from '@playwright/test';
import { env } from '../config/env';
import { ApiClient } from '../api/ApiClient';
import { AuthApi } from '../api/AuthApi';
import { CartApi } from '../api/CartApi';
import { OrderApi } from '../api/OrderApi';
import { ProductApi } from '../api/ProductApi';
import { ProfileApi } from '../api/ProfileApi';
import { TestAccount } from '../api/types';
import { CartPage } from '../pages/CartPage';
import { CheckoutPage } from '../pages/CheckoutPage';
import { HeaderNav } from '../pages/HeaderNav';
import { LoginPage } from '../pages/LoginPage';
import { ProductsPage } from '../pages/ProductsPage';
import { ProfilePage } from '../pages/ProfilePage';

type Fixtures = {
  apiContext: APIRequestContext;
  authApi: AuthApi;

  /** A freshly registered account, unique per test. */
  testAccount: TestAccount;

  /** API client already carrying the test account's token. */
  apiClient: ApiClient;
  cartApi: CartApi;
  orderApi: OrderApi;
  productApi: ProductApi;
  profileApi: ProfileApi;

  /** Browser page already signed in as the test account. */
  authenticatedPage: Page;

  loginPage: LoginPage;
  productsPage: ProductsPage;
  cartPage: CartPage;
  checkoutPage: CheckoutPage;
  profilePage: ProfilePage;
  header: HeaderNav;
};

export const test = base.extend<Fixtures>({
  apiContext: async ({ playwright }, use) => {
    const context = await playwright.request.newContext({ baseURL: env.baseURL });
    await use(context);
    await context.dispose();
  },

  authApi: async ({ apiContext }, use) => {
    await use(new AuthApi(new ApiClient(apiContext)));
  },

  /**
   * Each test registers its own account. Sharing the demo account would make
   * the suite order-dependent: two tests editing the same profile or cart
   * would overwrite each other as soon as they run in parallel.
   */
  testAccount: async ({ authApi }, use) => {
    const account = await authApi.register(AuthApi.buildCredentials());
    await use(account);
  },

  apiClient: async ({ apiContext, testAccount }, use) => {
    await use(new ApiClient(apiContext, testAccount.token));
  },

  cartApi: async ({ apiClient }, use) => {
    await use(new CartApi(apiClient));
  },

  orderApi: async ({ apiClient }, use) => {
    await use(new OrderApi(apiClient));
  },

  productApi: async ({ apiClient }, use) => {
    await use(new ProductApi(apiClient));
  },

  profileApi: async ({ apiClient }, use) => {
    await use(new ProfileApi(apiClient));
  },

  /**
   * Signs in through the UI once for the tests that need a session. Doing it
   * here keeps each spec focused on its own scenario.
   */
  authenticatedPage: async ({ page, testAccount }, use) => {
    const loginPage = new LoginPage(page);
    await loginPage.open();
    await loginPage.login(testAccount.username, testAccount.password);
    await use(page);
  },

  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },

  productsPage: async ({ page }, use) => {
    await use(new ProductsPage(page));
  },

  cartPage: async ({ page }, use) => {
    await use(new CartPage(page));
  },

  checkoutPage: async ({ page }, use) => {
    await use(new CheckoutPage(page));
  },

  profilePage: async ({ page }, use) => {
    await use(new ProfilePage(page));
  },

  header: async ({ page }, use) => {
    await use(new HeaderNav(page));
  },
});

export { expect } from '@playwright/test';
