import { test, expect } from '@playwright/test';

/**
 * Navigate to manuscript overview to select where you want to go
 */
test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(
        page.getByRole('textbox', { name: 'Please enter your pseudonym' })
    ).toBeVisible();
    await page.getByRole('textbox', { name: 'Please enter your pseudonym' }).fill('Max Mustermann');
    await page.getByRole('button', { name: 'Submit' }).click();
    const expandAll = page.getByRole('checkbox', { name: 'Expand all rows' });
    await expect(expandAll).toBeVisible();
    await expect(expandAll).toBeEnabled();
    await expandAll.check();
});

/**
 * Enter search terms in the search bar on the document table dashboard
 * Independent of the data, the search terms should return results as table rows or "No Search Results"
 */
test('manuscript search returns results or shows empty state', async ({ page }) => {

    // Enter search term
    //Test search contains
    //positive Number
    //Text
    //Empty Terms (due to multiple spaces)
    //Number that will result in an overflow for Integer
    await page.getByRole('textbox', { name: 'Search term' }).fill('1234 something   999999999999999999');
    await page.getByRole('button', { name: 'Search' }).click();

    // Locate common elements
    const table = page.locator('.tabulator');
    const rows = table.locator('.tabulator-row');
    const emptyPlaceholder = table.locator(
        '.tabulator-placeholder-contents',
        { hasText: 'No search results' }
    );

    // Wait until either rows OR placeholder appears
    await Promise.race([
        rows.first().waitFor({ state: 'visible' }),
        emptyPlaceholder.waitFor({ state: 'visible' }),
    ]);

    // Count rows
    const rowCount = await rows.count();

    if (rowCount === 0) {
        await expect(emptyPlaceholder).toBeVisible();
    } else {
        expect(rowCount).toBeGreaterThan(0);
    }
});