import { expect, test } from '@playwright/test';

test('shows the Voku-style officer reel and opens details', async ({ page }) => {
  await page.goto('http://localhost:3000/leaders');

  await expect(page.getByRole('main')).toHaveAttribute('data-page-style', 'voku-officers');
  await expect(page.getByRole('heading', { name: 'Officers' })).toBeVisible();
  await expect(page.getByText('Serving, Now.')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Pause reel' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Sound off' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Fullscreen' })).toBeVisible();
  await expect(page.getByLabel('Officer photo reel')).toBeVisible();

  const activeName = page.getByTestId('active-officer-name');
  const firstName = await activeName.innerText();

  await page.getByRole('button', { name: 'Next officer' }).click();
  await expect(activeName).not.toHaveText(firstName);

  await page.getByRole('button', { name: 'Open details' }).click();
  await expect(page.getByRole('dialog', { name: 'Officer details' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Close details' })).toBeVisible();
});

test('changes the active officer with wheel navigation', async ({ page }) => {
  await page.goto('http://localhost:3000/leaders');
  await expect(page.getByLabel('Officer photo reel')).toBeVisible();

  const activeName = page.getByTestId('active-officer-name');
  const firstName = await activeName.innerText();

  await page.locator('[data-testid="officer-stage"]').hover();
  await page.mouse.wheel(0, 700);

  await expect(activeName).not.toHaveText(firstName);
});

test('arranges the reel as a centered mountain arc', async ({ page }) => {
  await page.goto('http://localhost:3000/leaders');
  await expect(page.getByLabel('Officer photo reel')).toBeVisible();

  const cardPositions = await page.getByTestId('officer-card').evaluateAll((cards) =>
    cards
      .map((card) => {
        const element = card as HTMLElement;
        const rect = element.getBoundingClientRect();
        return {
          offset: Math.abs(Number(element.dataset.reelOffset ?? '0')),
          top: rect.top,
        };
      })
      .filter((card) => card.offset <= 3)
      .sort((a, b) => a.offset - b.offset),
  );

  expect(cardPositions.length).toBeGreaterThanOrEqual(4);
  for (let index = 1; index < cardPositions.length; index += 1) {
    expect(cardPositions[index].top).toBeGreaterThanOrEqual(cardPositions[index - 1].top - 1);
  }
});

test('moves the reel continuously for partial wheel input', async ({ page }) => {
  await page.goto('http://localhost:3000/leaders');
  await expect(page.getByLabel('Officer photo reel')).toBeVisible();

  const firstCard = page.getByTestId('officer-card').first();
  const before = await firstCard.evaluate((element) => getComputedStyle(element).transform);

  await page.locator('[data-testid="officer-stage"]').hover();
  await page.mouse.wheel(0, 120);
  await page.waitForTimeout(220);

  const after = await firstCard.evaluate((element) => getComputedStyle(element).transform);
  expect(after).not.toBe(before);
});

test('keeps the photo reel dominant on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('http://localhost:3000/leaders');

  const stage = page.getByTestId('officer-stage');
  await expect(stage).toBeVisible();

  const box = await stage.boundingBox();
  expect(box).not.toBeNull();
  expect(box!.height).toBeGreaterThan(300);
  await expect(page.getByRole('button', { name: 'Next officer' })).toBeVisible();
});
