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

test('Create page annotation', async ({ page }) => {
    await page.getByRole('link').first().click(); //navigate to image page
    await page.locator('#createPageAnnoButton').click();

    const templateSelect = page.getByLabel('Choose your template');
    await expect(templateSelect).toBeEnabled();
    await templateSelect.selectOption('EXAMPLE');

    await page.getByRole('textbox', { name: 'free text input' }).click();
    await page.getByRole('textbox', { name: 'free text input' }).fill('Das ist ein Testwert');
    await page.getByRole('button', { name: 'Create + Save' }).click();
    await page.getByLabel('Expand').click();
    await expect(page.getByLabel('commenting:')).toBeVisible();
    await expect(page.getByLabel('commenting:')).toHaveValue("Das ist ein Testwert")
    await page.screenshot({ path: './screenshots/page_anno.png', fullPage: true});
    page.on('dialog', dialog => {
        console.log(`Dialog message: ${dialog.message()}`);
        dialog.accept();
    });
    await page.locator('#deleteAnnotation').click();
    await expect(page.getByLabel('commenting:')).not.toBeVisible();
});

test('Create image annotation (rect)', async ({ page }) => {
    await page.getByRole('link').first().click(); //navigate to image page
    await page.locator('#createRectangleButton').click();

    const svg = page.locator('#canvas svg');
    await expect(svg).toBeVisible();

    const box = await svg.boundingBox();
    if (!box) throw new Error('SVG not found');

    await page.mouse.move(box.x + 100, box.y + 100);
    await page.mouse.down();
    await page.mouse.move(box.x + 400, box.y + 300);
    await page.mouse.up();

    const rects = svg.locator('rect');
    await expect(rects).toHaveCount(1);

    const rect = rects.first();

    const attrs = await rect.evaluate(el => ({
        x: Number(el.getAttribute('x')),
        y: Number(el.getAttribute('y')),
        width: Number(el.getAttribute('width')),
        height: Number(el.getAttribute('height')),
    }));

    expect(attrs.width).toBeGreaterThan(0);
    expect(attrs.height).toBeGreaterThan(0);

    const templateSelect = page.getByLabel('Choose your template');
    await expect(templateSelect).toBeEnabled();
    await templateSelect.selectOption('NOTEMPLATE');

    await page.getByRole('button', { name: 'Create + Save' }).click();
    await expect(page.getByLabel('creators')).toBeVisible();
    await expect(page.getByLabel('creators')).toHaveValue("Max Mustermann")
    await page.screenshot({ path: './screenshots/image_anno.png', fullPage: true});
    page.on('dialog', dialog => {
        console.log(`Dialog message: ${dialog.message()}`);
        dialog.accept();
    });
    await page.locator('#deleteAnnotation').click();
    await expect(page.getByLabel('commenting:')).not.toBeVisible();
});

test('Create text annotation', async ({ page }) => {
    await page.getByRole('link').nth(1).click(); //navigate to text page
    await page.getByText('standeth').dblclick();
    await page.locator('#selectTextButton').click();

    const templateSelect = page.getByLabel('Choose your template');
    await expect(templateSelect).toBeEnabled();
    await templateSelect.selectOption('NOTEMPLATE');

    await page.getByRole('button', { name: 'Create + Save' }).click();
    await expect(page.getByLabel('creators')).toBeVisible();
    await expect(page.getByLabel('creators')).toHaveValue("Max Mustermann")
    await page.screenshot({ path: './screenshots/text_anno.png', fullPage: true});
    await page.getByLabel('Add another body to the').click();
    await page
        .locator('.form-group.jsonform-error-template:visible')
        .getByLabel('Choose your template')
        .selectOption('TAG');
    await page.getByRole('textbox', { name: 'value' }).click();
    await page.getByRole('textbox', { name: 'value' }).fill('Testtag');
    await page.getByRole('button', { name: 'Create + Save' }).click();
    await expect(page.getByRole('textbox', { name: 'Tag:' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Tag:' })).toHaveValue('Testtag')
    await page.screenshot({ path: './screenshots/text_anno_with_body.png', fullPage: true});
    page.on('dialog', dialog => {
        console.log(`Dialog message: ${dialog.message()}`);
        dialog.accept();
    });
    await page.locator('#deleteAnnotation').click();
    await expect(page.getByRole('textbox', { name: 'Tag:' })).not.toBeVisible();
});