import { expect, test } from '@playwright/test';

test('opens officer details when a leader photo is clicked', async ({ page }) => {
  await page.goto('http://localhost:3000/leaders');
  await page.waitForSelector('.officer-card-3d');
  await page.waitForTimeout(500);

  const firstCardBox = await page.locator('.officer-card-3d').first().boundingBox();
  expect(firstCardBox).not.toBeNull();

  await page.mouse.click(
    firstCardBox!.x + firstCardBox!.width / 2,
    firstCardBox!.y + firstCardBox!.height / 2,
  );

  await expect(page.getByLabel('Close Details')).toBeVisible();
});

test('applies photo hover styling when the pointer is over a leader photo', async ({ page }) => {
  await page.goto('http://localhost:3000/leaders');
  await page.waitForSelector('.officer-card-3d');
  await page.waitForTimeout(500);

  const firstCardBox = await page.locator('.officer-card-3d').first().boundingBox();
  expect(firstCardBox).not.toBeNull();

  await page.mouse.move(
    firstCardBox!.x + firstCardBox!.width / 2,
    firstCardBox!.y + firstCardBox!.height / 2,
  );
  await page.waitForTimeout(100);

  const isHovered = await page.locator('.officer-card-3d').first().getAttribute('data-hovered');
  expect(isHovered).toBe('true');

  const cursor = await page.evaluate(() => {
    const element = document.elementFromPoint(window.innerWidth / 2, window.innerHeight / 2);
    return element ? window.getComputedStyle(element).cursor : null;
  });
  expect(cursor).toBe('pointer');
});
