import { expect, test } from '@playwright/test';

test('shows the Voku-style officer reel and opens details', async ({ page }) => {
  await page.goto('http://localhost:3000/leaders');

  await expect(page.getByRole('main')).toHaveAttribute('data-page-style', 'voku-officers');
  await expect(page.getByLabel('Officer photo reel')).toBeVisible();
  await expect(page.getByText('섬김의 손길들')).toBeVisible();

  await page.locator('[data-testid="officer-card"][aria-current="true"]').first().evaluate(node => (node as HTMLButtonElement).click());
  await expect(page.getByRole('dialog', { name: 'Officer details' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Close details' })).toBeVisible();
});

test('changes the active officer with wheel navigation', async ({ page }) => {
  await page.goto('http://localhost:3000/leaders');
  await expect(page.getByLabel('Officer photo reel')).toBeVisible();

  const firstCard = page.getByTestId('officer-card').first();
  const beforeOffset = await firstCard.getAttribute('data-reel-offset');

  await page.locator('[data-testid="officer-stage"]').hover();
  await page.mouse.wheel(0, 700);
  await page.waitForTimeout(300);

  const afterOffset = await firstCard.getAttribute('data-reel-offset');
  expect(afterOffset).not.toBe(beforeOffset);
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

test('responds visibly to slow wheel input', async ({ page }) => {
  await page.goto('http://localhost:3000/leaders');
  await expect(page.getByLabel('Officer photo reel')).toBeVisible();

  const firstCard = page.getByTestId('officer-card').first();
  const before = await firstCard.evaluate((element) => getComputedStyle(element).transform);

  await page.locator('[data-testid="officer-stage"]').hover();
  await page.mouse.wheel(0, 1);
  await page.waitForTimeout(220);

  const after = await firstCard.evaluate((element) => getComputedStyle(element).transform);
  expect(after).not.toBe(before);
});

test('keeps officer photos in color', async ({ page }) => {
  await page.goto('http://localhost:3000/leaders');
  await expect(page.getByLabel('Officer photo reel')).toBeVisible();

  const photoFilters = await page.locator('[data-testid="officer-card"] img').evaluateAll((images) =>
    images.map((image) => getComputedStyle(image).filter),
  );

  expect(photoFilters.length).toBeGreaterThan(0);
  for (const filter of photoFilters) {
    expect(filter).not.toContain('grayscale');
  }
});

test('keeps cards spaced with gradual scale and center priority', async ({ page }) => {
  await page.goto('http://localhost:3000/leaders');
  await expect(page.getByLabel('Officer photo reel')).toBeVisible();

  const cards = await page.getByTestId('officer-card').evaluateAll((elements) =>
    elements
      .map((card) => {
        const element = card as HTMLElement;
        const rect = element.getBoundingClientRect();
        return {
          offset: Math.abs(Number(element.dataset.reelOffset ?? '0')),
          left: rect.left,
          right: rect.right,
          width: rect.width,
          zIndex: Number(getComputedStyle(element).zIndex),
          scale: Number(element.dataset.reelScale ?? '0'),
          opacity: Number(getComputedStyle(element).opacity),
        };
      })
      .filter((card) => card.opacity > 0.2)
      .sort((a, b) => a.left - b.left),
  );

  for (let index = 1; index < cards.length; index += 1) {
    const previous = cards[index - 1];
    const current = cards[index];
    const overlap = Math.max(0, previous.right - current.left);
    expect(overlap / Math.min(previous.width, current.width)).toBeLessThan(0.24);
  }

  const byOffset = [...cards].sort((a, b) => a.offset - b.offset);
  expect(byOffset[0].zIndex).toBeGreaterThan(byOffset[1].zIndex);
  expect(Math.abs(byOffset[0].scale - byOffset[1].scale)).toBeLessThan(0.12);
});

test('hides wraparound cards at the reel seam while scrolling', async ({ page }) => {
  await page.goto('http://localhost:3000/leaders');
  await expect(page.getByLabel('Officer photo reel')).toBeVisible();

  await page.locator('[data-testid="officer-stage"]').hover();
  for (let index = 0; index < 12; index += 1) {
    await page.mouse.wheel(0, 900);
    await page.waitForTimeout(80);
  }

  const seamCards = await page.getByTestId('officer-card').evaluateAll((elements) =>
    elements
      .map((card) => {
        const element = card as HTMLElement;
        return {
          offset: Number(element.dataset.reelOffset ?? '0'),
          opacity: Number(getComputedStyle(element).opacity),
        };
      })
      .filter((card) => card.offset > 4.4),
  );

  for (const card of seamCards) {
    expect(card.opacity).toBeLessThan(0.06);
  }
});

test('keeps the mountain form stable during fast wheel input', async ({ page }) => {
  await page.goto('http://localhost:3000/leaders');
  await expect(page.getByLabel('Officer photo reel')).toBeVisible();

  await page.locator('[data-testid="officer-stage"]').hover();
  for (let index = 0; index < 8; index += 1) {
    await page.mouse.wheel(0, 1800);
  }
  await page.waitForTimeout(260);

  const visibleCards = await page.getByTestId('officer-card').evaluateAll((elements) =>
    elements
      .map((card) => {
        const element = card as HTMLElement;
        const rect = element.getBoundingClientRect();
        return {
          offset: Math.abs(Number(element.dataset.reelOffset ?? '0')),
          top: rect.top,
          opacity: Number(getComputedStyle(element).opacity),
          transitionProperty: getComputedStyle(element).transitionProperty,
        };
      })
      .filter((card) => card.opacity > 0.12)
      .sort((a, b) => a.offset - b.offset),
  );

  expect(visibleCards.length).toBeLessThanOrEqual(7);
  for (const card of visibleCards) {
    expect(card.offset).toBeLessThan(3.5);
    expect(card.transitionProperty).not.toContain('transform');
  }
  for (let index = 1; index < visibleCards.length; index += 1) {
    expect(visibleCards[index].top).toBeGreaterThanOrEqual(visibleCards[index - 1].top - 1);
  }
});

test('keeps seven reel cards visible around the center while scrolling', async ({ page }) => {
  await page.goto('http://localhost:3000/leaders');
  await expect(page.getByLabel('Officer photo reel')).toBeVisible();

  await page.locator('[data-testid="officer-stage"]').hover();
  await page.mouse.wheel(0, 12);
  await page.waitForTimeout(260);

  const visibleSlots = await page.getByTestId('officer-card').evaluateAll((elements) =>
    elements
      .map((card) => {
        const element = card as HTMLElement;
        return {
          signedOffset: Number(element.dataset.reelSignedOffset ?? '0'),
          offset: Math.abs(Number(element.dataset.reelOffset ?? '0')),
          opacity: Number(getComputedStyle(element).opacity),
        };
      })
      .filter((card) => card.opacity > 0.12)
      .map((card) => Math.round(card.signedOffset))
      .sort((a, b) => a - b),
  );

  expect(visibleSlots).toEqual([-3, -2, -1, 0, 1, 2, 3]);
});

test('keeps a compact five-card reel on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('http://localhost:3000/leaders');
  await expect(page.getByLabel('Officer photo reel')).toBeVisible();

  const visibleCards = await page.getByTestId('officer-card').evaluateAll((elements) =>
    elements
      .map((card) => {
        const element = card as HTMLElement;
        const rect = element.getBoundingClientRect();
        return {
          offset: Math.abs(Number(element.dataset.reelOffset ?? '0')),
          opacity: Number(getComputedStyle(element).opacity),
          width: rect.width,
          inViewport: rect.left >= 0 && rect.right <= window.innerWidth,
        };
      })
      .filter((card) => card.opacity > 0.12 && card.inViewport),
  );

  expect(visibleCards).toHaveLength(5);
  expect(Math.max(...visibleCards.map((card) => card.width))).toBeLessThan(185);
});

test('keeps the photo reel dominant on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('http://localhost:3000/leaders');

  const stage = page.getByTestId('officer-stage');
  await expect(stage).toBeVisible();

  const box = await stage.boundingBox();
  expect(box).not.toBeNull();
  expect(box!.height).toBeGreaterThan(300);
});
