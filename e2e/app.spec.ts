import type { Page } from '@playwright/test';
import { expect, test } from '@playwright/test';

/**
 * A first-time visitor is shown a safety dialog (emergency contact info,
 * "safe browsing" guidance) that intercepts all clicks until dismissed.
 * Every test needs it closed before interacting with the rest of the page.
 */
async function dismissSafetyModal(page: Page) {
  const dialog = page.locator('#my_modal_3');
  await expect(dialog).toBeVisible();
  await dialog.locator('form button').click();
  // The dialog stays laid out (daisyUI keeps display: grid) after closing,
  // just non-interactive and transparent, so check the actual dialog state
  // and click-through rather than a plain visibility assertion.
  await expect(dialog).not.toHaveAttribute('open');
}

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await dismissSafetyModal(page);
});

test.describe('Homepage', () => {
  test('loads with the core layout: heading, search, filters, safe exit', async ({
    page,
  }) => {
    await expect(
      page.getByRole('heading', { name: 'Domestic Abuse Services Mapped' })
    ).toBeVisible();
    await expect(page.locator('#searchInput')).toBeVisible();
    await expect(page.locator('#serviceFilter')).toBeVisible();
    await expect(page.locator('#localAuthorityFilter')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Safe exit' })).toBeVisible();
  });

  test('shows a result count before any search or filter', async ({ page }) => {
    // The map's loading overlay is also a status region, so match on text.
    await expect(
      page.getByRole('status').filter({ hasText: /services?/ })
    ).toHaveText(/^(\d+ services?|No services match these filters\..*)$/);
  });
});

test.describe('Search by service name', () => {
  test('shows a "no results" message for a name that matches nothing', async ({
    page,
  }) => {
    await page
      .locator('#searchInput')
      .fill('a service name that will never exist zzzqqqxxx');
    await page.getByRole('button', { name: 'Search' }).first().click();

    await expect(
      page.getByText(/No services found matching ".*zzzqqqxxx"\./)
    ).toBeVisible();
  });

  test('shows a validation message when the search box is submitted empty', async ({
    page,
  }) => {
    await page.getByRole('button', { name: 'Search' }).first().click();
    await expect(page.getByText('Please enter a search query.')).toBeVisible();
  });

  test('clearing the search removes the results message', async ({ page }) => {
    const searchInput = page.locator('#searchInput');
    await searchInput.fill('zzzqqqxxx-does-not-exist');
    await page.getByRole('button', { name: 'Search' }).first().click();
    await expect(page.getByText(/No services found matching/)).toBeVisible();

    await page.getByRole('button', { name: 'Clear search' }).click();

    await expect(searchInput).toHaveValue('');
    await expect(
      page.getByText(/No services found matching/)
    ).not.toBeVisible();
  });
});

test.describe('Search by postcode', () => {
  // postcodes.io is mocked so these tests don't depend on a third party.
  const POSTCODES_API = /api\.postcodes\.io\/postcodes\//;

  async function search(page: Page, query: string): Promise<void> {
    await page.locator('#searchInput').fill(query);
    await page.locator('#searchInput').press('Enter');
  }

  test('asks for a full postcode when only the first half is entered', async ({
    page,
  }) => {
    await search(page, 'BD1');
    await expect(page.locator('#searchInput-error')).toHaveText(
      'Please enter a full postcode, for example BD1 4PS.'
    );
  });

  test('explains when a postcode does not exist', async ({ page }) => {
    await page.route(POSTCODES_API, (route) =>
      route.fulfill({
        status: 404,
        json: { status: 404, error: 'Postcode not found' },
      })
    );
    await search(page, 'ZZ99 9ZZ');
    await expect(page.locator('#searchInput-error')).toContainText(
      'We couldn\'t find the postcode "ZZ99 9ZZ"'
    );
  });

  test('explains when the postcode lookup fails', async ({ page }) => {
    await page.route(POSTCODES_API, (route) => route.abort());
    await search(page, 'BD1 4PS');
    await expect(page.locator('#searchInput-error')).toContainText(
      "We couldn't look up that postcode just now"
    );
  });

  test('shows progress while looking up, then results for the formatted postcode', async ({
    page,
  }) => {
    let release: (() => void) | undefined;
    const lookupStarted = new Promise<void>((resolve) => {
      page.route(POSTCODES_API, async (route) => {
        resolve();
        await new Promise<void>((r) => (release = r));
        await route.fulfill({
          json: {
            status: 200,
            result: {
              postcode: 'BD1 4PS',
              latitude: 53.797,
              longitude: -1.755,
            },
          },
        });
      });
    });

    await search(page, 'bd14ps');
    await lookupStarted;
    await expect(
      page.getByRole('button', { name: 'Search', exact: true })
    ).toBeDisabled();
    await expect(
      page.getByRole('status').filter({ hasText: 'Searching' })
    ).toHaveCount(1);

    release?.();
    await expect(
      page.getByRole('button', { name: 'Search', exact: true })
    ).toBeEnabled();
    await expect(
      page.getByRole('status').filter({ hasText: /miles of BD1 4PS/ })
    ).toBeVisible();
  });
});

test.describe('Filters', () => {
  test('selecting a service type reveals the Clear Filters button, and clearing resets it', async ({
    page,
  }) => {
    const serviceFilter = page.locator('#serviceFilter');
    const options = await serviceFilter.locator('option').allTextContents();
    const realOption = options.find((o) => o !== 'All service types');

    test.skip(!realOption, 'No service types returned by the API to filter on');

    await serviceFilter.selectOption({ label: realOption! });
    await expect(
      page.getByRole('button', { name: 'Clear Filters' })
    ).toBeVisible();

    await page.getByRole('button', { name: 'Clear Filters' }).click();
    await expect(serviceFilter).toHaveValue('');
    await expect(
      page.getByRole('button', { name: 'Clear Filters' })
    ).not.toBeVisible();
  });

  test('selecting a local authority updates the URL query params', async ({
    page,
  }) => {
    const laFilter = page.locator('#localAuthorityFilter');
    const options = await laFilter.locator('option').allTextContents();
    const realOption = options.find((o) => o !== 'All local authorities');

    test.skip(
      !realOption,
      'No local authorities returned by the API to filter on'
    );

    await laFilter.selectOption({ label: realOption! });
    await expect
      .poll(() => {
        const url = new URL(page.url());
        return url.searchParams.get('localAuthority');
      })
      .toBe(realOption!);
  });

  test('changing a filter keeps keyboard focus on that filter', async ({
    page,
  }) => {
    const serviceFilter = page.locator('#serviceFilter');
    await serviceFilter.focus();
    await serviceFilter.selectOption({ index: 1 });
    await expect
      .poll(() => new URL(page.url()).searchParams.get('serviceType'))
      .not.toBeNull();
    await expect(serviceFilter).toBeFocused();
  });

  test('selecting specialisms from the dropdown filters results and shows chips', async ({
    page,
  }) => {
    const toggle = page.getByRole('button', { name: /Filter by specialism/ });
    await toggle.click();
    const options = page
      .getByRole('group', { name: 'Specialisms' })
      .getByRole('checkbox');
    test.skip((await options.count()) === 0, 'No specialisms to filter on');

    await options.first().check();
    await expect(
      page.getByRole('status').filter({ hasText: /match your filters/ })
    ).toBeVisible();

    await page.getByRole('button', { name: 'Done' }).click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');

    const chips = page.getByRole('list', { name: 'Selected specialisms' });
    await expect(chips.getByRole('button')).toHaveCount(1);
    await chips.getByRole('button').click();
    await expect(chips).toHaveCount(0);
  });

  test('Esc closes the specialism dropdown without exiting the site', async ({
    page,
  }) => {
    const toggle = page.getByRole('button', { name: /Filter by specialism/ });
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');

    await page.keyboard.press('Escape');
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(toggle).toBeFocused();
    expect(page.url()).toContain('localhost:3000');
  });
});

test.describe('Pagination', () => {
  test('changing page moves focus to the results heading', async ({ page }) => {
    const next = page.getByRole('button', { name: 'Next' });
    test.skip(!(await next.isVisible()), 'Only one page of results');

    await next.click();
    await expect(page.getByText(/^Page 2 of \d+$/)).toBeVisible();
    await expect(
      page.getByRole('status').filter({ hasText: /services?/ })
    ).toBeFocused();
  });
});

test.describe('Quick exit', () => {
  test('the safe exit button navigates away from the site', async ({
    page,
  }) => {
    await page.getByRole('link', { name: 'Safe exit' }).click();
    await page.waitForURL(/bbc\.com/);
  });

  test('the site is not left in back-button history after exiting', async ({
    page,
  }) => {
    await page.getByRole('link', { name: 'Safe exit' }).click();
    await page.waitForURL(/bbc\.com/);
    await page.goBack();
    expect(page.url()).not.toContain('localhost:3000');
  });

  test('pressing Esc exits the site', async ({ page }) => {
    await page.keyboard.press('Escape');
    await page.waitForURL(/bbc\.com/);
  });

  test('Esc closes the safety notice without exiting', async ({ page }) => {
    await page.evaluate(() => sessionStorage.clear());
    await page.reload();
    const dialog = page.locator('#my_modal_3');
    await expect(dialog).toHaveAttribute('open');

    await page.keyboard.press('Escape');
    await expect(dialog).not.toHaveAttribute('open');
    expect(page.url()).toContain('localhost:3000');
  });

  test('the safety notice has its own safe exit button', async ({ page }) => {
    await page.evaluate(() => sessionStorage.clear());
    await page.reload();
    await page
      .locator('#my_modal_3')
      .getByRole('button', { name: 'Safe exit' })
      .click();
    await page.waitForURL(/bbc\.com/);
  });
});
