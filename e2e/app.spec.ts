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
    await expect(page.getByRole('button', { name: 'Safe exit' })).toBeVisible();
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
});

test.describe('Quick exit', () => {
  test('the safe exit button navigates away from the site', async ({
    page,
  }) => {
    await page.getByRole('button', { name: 'Safe exit' }).click();
    await page.waitForURL(/bbc\.com/);
  });

  test('the site is not left in back-button history after exiting', async ({
    page,
  }) => {
    await page.getByRole('button', { name: 'Safe exit' }).click();
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
