# ShopVN — Playwright E2E Automation (Final Test)

End-to-end automation for [ShopVN](https://testing.platformforge.dev) built with
**Playwright + TypeScript**, using the Page Object Model, custom fixtures,
JSON-driven test data, and API-based setup and cleanup.

## Scenarios covered

| # | Scenario | Spec |
|---|----------|------|
| 2 | Add a single product to cart — verify quantity & cart page | `tests/02-add-product-to-cart.spec.ts` |
| 5 | Checkout succeeds with valid receiver info (COD) | `tests/05-checkout-cod.spec.ts` |
| 6 | Update Full Name, then clean up via the API | `tests/06-update-profile-name.spec.ts` |

Scenarios 5 and 6 are data-driven, so the five executable tests come from
three spec files.

## Project structure

```
.
├── api/                 API layer (transport + one class per resource)
│   ├── ApiClient.ts     Request wrapper; throws ApiError, never asserts
│   ├── AuthApi.ts       Register / login
│   ├── CartApi.ts       Cart read, overwrite, clear
│   ├── OrderApi.ts      Place, list and delete orders
│   ├── ProductApi.ts    Catalogue reads
│   ├── ProfileApi.ts    Profile read and update
│   └── endpoints.ts     Every path in one place
├── config/env.ts        Base URL, overridable via BASE_URL
├── data/                JSON test data
├── fixtures/baseTest.ts Custom fixtures: page objects, API clients, account
├── pages/               Page Object Model
├── tests/               Specs
└── .github/workflows/   CI pipeline
```

## Running

```bash
npm install
npx playwright install chromium

npm test              # headless
npm run test:ui       # interactive UI mode
npm run test:required # only the required scenarios (@required tag)
```

### Allure report

```bash
npm run report        # generate and open
npm run allure:serve  # serve without writing a report folder
```

Allure requires a Java runtime. Without Java, `npx playwright show-report`
opens the built-in HTML report instead.

## Design notes

**Page Object Model.** Locators and interactions live in `pages/`; specs read
as a description of the scenario. A UI change is fixed in one file.

**Fixtures.** `fixtures/baseTest.ts` injects page objects and API clients, and
registers a fresh account per test. Tests declare what they need and receive
it ready to use.

**Hooks.** `beforeEach` puts the app into the scenario's precondition;
`afterEach` removes anything the test created.

**Setup and cleanup through the API.** Building state through the UI is slow
and makes a test fail for reasons unrelated to what it covers. The checkout
test seeds its basket with one API call; the profile test restores the
original name through the API in a `finally` block so cleanup runs even when
an assertion fails.

**Independent tests.** Each test registers its own account, so no test can
observe or overwrite another's data. This is what makes `fullyParallel` safe.

**Stable locators.** The application exposes `data-testid` attributes, which
are used wherever available; otherwise locators are resolved by role and
accessible name. No locator depends on styling classes or DOM position.

**No fixed sleeps.** Waiting is expressed as a condition — an element becoming
visible, or the relevant network response arriving. Actions that write state
(add to cart, place order, save profile) wait for their request to return, so
assertions read persisted data rather than an optimistic UI update.

**Assertions stay in the tests.** The API layer throws `ApiError` on failure
instead of asserting, so a broken precondition reports itself as a setup
error rather than a misleading assertion failure.
