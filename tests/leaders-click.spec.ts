import { expect, test } from '@playwright/test';

test('shows the fixed officer poster stage with oversized background type', async ({ page }) => {
  await page.goto('http://localhost:3000/leaders');

  const main = page.getByRole('main');
  await expect(main).toHaveAttribute('data-page-style', 'facil-officers');
  await expect(page.getByLabel('Infinite officer portrait stream')).toBeVisible();
  await expect(page.getByTestId('leaders-background-type')).toContainText('OFFICERS');

  const mainBox = await main.boundingBox();
  expect(mainBox).not.toBeNull();
  expect(Math.round(mainBox!.height)).toBe(await page.evaluate(() => window.innerHeight));
});

test('attaches role and church-title name labels to every officer card', async ({ page }) => {
  await page.goto('http://localhost:3000/leaders');
  await expect(page.getByLabel('Infinite officer portrait stream')).toBeVisible();

  const cards = page.getByTestId('officer-card');
  await expect(cards.first()).toBeVisible();

  const labelData = await cards.evaluateAll((elements) =>
    elements.slice(0, 5).map((card) => {
      const element = card as HTMLElement;
      return {
        role: element.querySelector('[data-testid="officer-role-label"]')?.textContent?.trim() ?? '',
        name: element.querySelector('[data-testid="officer-name-label"]')?.textContent?.trim() ?? '',
      };
    }),
  );

  expect(labelData.length).toBeGreaterThan(0);
  for (const labels of labelData) {
    expect(labels.role.length).toBeGreaterThan(0);
    expect(labels.name.length).toBeGreaterThan(0);
  }
});

test('moves officer cards upward on wheel input and keeps them recyclable', async ({ page }) => {
  await page.goto('http://localhost:3000/leaders');
  const stream = page.getByLabel('Infinite officer portrait stream');
  await expect(stream).toBeVisible();

  const movingCardIndex = await page.getByTestId('officer-card').evaluateAll((elements) =>
    elements.findIndex((element) => {
      const top = element.getBoundingClientRect().top;
      return top > 340 && top < 880;
    }),
  );
  expect(movingCardIndex).toBeGreaterThanOrEqual(0);

  const movingCard = page.getByTestId('officer-card').nth(movingCardIndex);
  const beforeTop = await movingCard.evaluate((element) => element.getBoundingClientRect().top);

  await stream.hover();
  await page.mouse.wheel(0, 120);
  await page.waitForTimeout(260);

  const afterTop = await movingCard.evaluate((element) => element.getBoundingClientRect().top);
  expect(afterTop).toBeLessThan(beforeTop);

  const beforeCycle = await page.getByTestId('officer-card').first().getAttribute('data-cycle');
  for (let i = 0; i < 4; i++) {
    await page.mouse.wheel(0, 800);
    await page.waitForTimeout(60);
  }
  await page.waitForTimeout(260);
  const afterCycle = await page.getByTestId('officer-card').first().getAttribute('data-cycle');

  expect(afterCycle).not.toBe(beforeCycle);
});

test('keeps visible officer cards from overlapping after repeated scrolling', async ({ page }) => {
  await page.goto('http://localhost:3000/leaders');
  const stream = page.getByLabel('Infinite officer portrait stream');
  await expect(stream).toBeVisible();

  await stream.hover();
  for (let index = 0; index < 14; index += 1) {
    await page.mouse.wheel(0, 780);
    await page.waitForTimeout(60);
  }
  await page.waitForTimeout(360);

  const visibleCards = await page.getByTestId('officer-card').evaluateAll((elements) =>
    elements
      .map((element) => {
        const rect = element.getBoundingClientRect();
        return {
          left: rect.left,
          right: rect.right,
          top: rect.top,
          bottom: rect.bottom,
          width: rect.width,
          height: rect.height,
          opacity: Number(getComputedStyle(element).opacity),
        };
      })
      .filter((rect) => rect.opacity > 0.1 && rect.bottom > 0 && rect.top < window.innerHeight),
  );

  for (let first = 0; first < visibleCards.length; first += 1) {
    for (let second = first + 1; second < visibleCards.length; second += 1) {
      const a = visibleCards[first];
      const b = visibleCards[second];
      const overlapX = Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left));
      const overlapY = Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));
      const overlapArea = overlapX * overlapY;
      const smallerArea = Math.min(a.width * a.height, b.width * b.height);

      expect(overlapArea / smallerArea).toBeLessThan(0.08);
    }
  }
});

test('keeps the conductor and treasurer cards comfortably separated', async ({ page }) => {
  await page.goto('http://localhost:3000/leaders');
  const stream = page.getByLabel('Infinite officer portrait stream');
  await expect(stream).toBeVisible();

  const tightPairs: Array<{
    conductor: { centerX: number; top: number; bottom: number };
    treasurer: { centerX: number; top: number; bottom: number };
    horizontalGap: number;
  }> = [];

  await stream.hover();
  for (let index = 0; index < 42; index += 1) {
    await page.mouse.wheel(0, 620);
    await page.waitForTimeout(45);

    const roleCards = await page.getByTestId('officer-card').evaluateAll((elements) =>
      elements
        .map((element) => {
          const rect = element.getBoundingClientRect();
          return {
            role: element.querySelector('[data-testid="officer-role-label"]')?.textContent?.trim() ?? '',
            centerX: rect.left + rect.width / 2,
            top: rect.top,
            bottom: rect.bottom,
            opacity: Number(getComputedStyle(element).opacity),
          };
        })
        .filter((card) => card.opacity > 0.1 && card.bottom > 0 && card.top < window.innerHeight),
    );

    const conductors = roleCards.filter((card) => card.role.includes('\uB300\uC7A5'));
    const treasurers = roleCards.filter((card) => card.role.includes('\uCD1D\uBB34'));

    for (const conductor of conductors) {
      for (const treasurer of treasurers) {
        const verticalOverlap = Math.max(0, Math.min(conductor.bottom, treasurer.bottom) - Math.max(conductor.top, treasurer.top));
        if (verticalOverlap <= 0) continue;

        const horizontalGap = Math.abs(conductor.centerX - treasurer.centerX);
        if (horizontalGap < 430) {
          tightPairs.push({ conductor, treasurer, horizontalGap });
        }
      }
    }
  }

  expect(tightPairs).toEqual([]);
});

test('uses portrait frames for selected officer photos', async ({ page }) => {
  await page.goto('http://localhost:3000/leaders');
  await expect(page.getByLabel('Infinite officer portrait stream')).toBeVisible();

  const portraitCards = page.locator('[data-testid="officer-card"][data-frame="portrait"]');
  await expect(portraitCards.first()).toBeVisible();

  const targetCard = page
    .getByTestId('officer-card')
    .filter({ has: page.getByTestId('officer-name-label').filter({ hasText: '\uC9C4\uC21C\uC5F0' }) })
    .first();

  if ((await targetCard.count()) > 0) {
    await expect(targetCard).toHaveAttribute('data-frame', 'portrait');
  }

  const portraitBox = await portraitCards.first().boundingBox();
  expect(portraitBox).not.toBeNull();
  expect(portraitBox!.height).toBeGreaterThan(portraitBox!.width);
});

test('changes card placement when photos re-enter the infinite stream', async ({ page }) => {
  await page.goto('http://localhost:3000/leaders');
  const stream = page.getByLabel('Infinite officer portrait stream');
  await expect(stream).toBeVisible();

  const firstCard = page.getByTestId('officer-card').first();
  const beforeLayout = await firstCard.getAttribute('data-layout');

  await stream.hover();
  for (let index = 0; index < 28; index += 1) {
    await page.mouse.wheel(0, 820);
    await page.waitForTimeout(30);
  }
  await page.waitForTimeout(520);

  const afterLayout = await firstCard.getAttribute('data-layout');
  expect(afterLayout).not.toBe(beforeLayout);
});

test('keeps a card layout stable until the photo fully exits above the viewport', async ({ page }) => {
  await page.goto('http://localhost:3000/leaders');
  const stream = page.getByLabel('Infinite officer portrait stream');
  await expect(stream).toBeVisible();

  const viewportHeight = await page.evaluate(() => window.innerHeight);
  const firstCard = page.getByTestId('officer-card').first();
  let previous = await firstCard.evaluate((element) => {
    const rect = element.getBoundingClientRect();
    return {
      layout: (element as HTMLElement).dataset.layout ?? '',
      top: rect.top,
      bottom: rect.bottom,
      opacity: Number(getComputedStyle(element).opacity),
    };
  });
  const layoutChanges: Array<{ previous: typeof previous; current: typeof previous }> = [];

  await stream.hover();
  for (let index = 0; index < 34; index += 1) {
    await page.mouse.wheel(0, 820);
    await page.waitForTimeout(45);

    const current = await firstCard.evaluate((element) => {
      const rect = element.getBoundingClientRect();
      return {
        layout: (element as HTMLElement).dataset.layout ?? '',
        top: rect.top,
        bottom: rect.bottom,
        opacity: Number(getComputedStyle(element).opacity),
      };
    });

    if (current.layout !== previous.layout) {
      layoutChanges.push({ previous, current });
    }

    previous = current;
  }

  expect(layoutChanges.length).toBeGreaterThan(0);
  for (const change of layoutChanges) {
    const wasVisible = change.previous.opacity > 0.1 && change.previous.bottom > 0 && change.previous.top < viewportHeight;
    const isVisible = change.current.opacity > 0.1 && change.current.bottom > 0 && change.current.top < viewportHeight;

    expect(wasVisible || isVisible, JSON.stringify(change)).toBe(false);
  }
});

test('keeps portrait and landscape frames close to a half-and-half mix', async ({ page }) => {
  await page.goto('http://localhost:3000/leaders');
  await expect(page.getByLabel('Infinite officer portrait stream')).toBeVisible();

  const frameMix = await page.getByTestId('officer-card').evaluateAll((elements) => {
    const frames = elements.map((element) => (element as HTMLElement).dataset.frame);
    const portraitCount = frames.filter((frame) => frame === 'portrait').length;

    return {
      total: frames.length,
      portraitCount,
      portraitRatio: portraitCount / frames.length,
    };
  });

  expect(frameMix.total).toBeGreaterThan(0);
  expect(frameMix.portraitRatio).toBeGreaterThan(0.4);
  expect(frameMix.portraitRatio).toBeLessThan(0.65);
});
