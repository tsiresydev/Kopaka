import AxeBuilder from '@axe-core/playwright';
import { test, expect } from './fixtures/environment.js';

test('responsive shell, keyboard targets, reduced motion and text expansion', async ({
  page,
}, testInfo) => {
  await page.emulateMedia({ reducedMotion: 'reduce', colorScheme: 'dark' });
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await expect(page.getByRole('status')).toContainText('Disponible');
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  for (const width of [320, 375, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    const targets = await page
      .locator('button:not(:disabled),input,select:not(:disabled),a')
      .evaluateAll((nodes) =>
        nodes.map((node) => {
          const r = node.getBoundingClientRect();
          return { width: r.width, height: r.height };
        }),
      );
    expect(
      targets.every((target) => target.width >= 48 && target.height >= 48),
    ).toBe(true);
  }
  await page.screenshot({
    path: testInfo.outputPath('foundation-light.png'),
    fullPage: true,
  });
  await page.keyboard.press('Tab');
  await expect(
    page.getByRole('link', { name: 'Aller au contenu' }),
  ).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('main')).toBeFocused();
  const theme = page.getByRole('combobox', { name: 'Apparence' });
  await theme.focus();
  expect(
    await theme.evaluate((node) => getComputedStyle(node).outlineWidth),
  ).toBe('3px');
  await page.setViewportSize({ width: 320, height: 900 });
  await page.evaluate(() => {
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
    );
    const nodes: Text[] = [];
    while (walker.nextNode()) {
      const node = walker.currentNode as Text;
      if (
        node.textContent?.trim() &&
        !['SCRIPT', 'STYLE', 'OPTION'].includes(
          node.parentElement?.tagName ?? '',
        )
      )
        nodes.push(node);
    }
    nodes.forEach((node) => {
      const text = node.textContent ?? '';
      node.textContent =
        text + ' ' + text.repeat(2).slice(0, Math.ceil(text.length * 0.4));
    });
  });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.setViewportSize({ width: 1024, height: 768 });
  await page.evaluate(() => {
    document.documentElement.style.zoom = '2';
  });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.evaluate(() => {
    document.documentElement.style.zoom = '1';
  });
  await page.setViewportSize({ width: 812, height: 375 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});

test('rendered control boundaries and useful icons retain contrast in both themes', async ({
  page,
}) => {
  await page.goto('/');
  for (const theme of ['light', 'dark']) {
    await page.getByRole('combobox', { name: 'Apparence' }).selectOption(theme);
    await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
    const ratios = await page
      .locator(
        '.k-control:not(:disabled), .k-button--secondary:not(:disabled), .k-status-icon',
      )
      .evaluateAll((nodes) => {
        const rgb = (value: string) =>
          (value.match(/[\d.]+/g) ?? []).slice(0, 3).map(Number);
        const luminance = (value: string) =>
          rgb(value).reduce((sum, channel, index) => {
            const s = channel / 255;
            return (
              sum +
              (s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4) *
                [0.2126, 0.7152, 0.0722][index]!
            );
          }, 0);
        const background = (element: Element): string => {
          const color = getComputedStyle(element).backgroundColor;
          return color === 'rgba(0, 0, 0, 0)' && element.parentElement
            ? background(element.parentElement)
            : color;
        };
        return nodes.map((node) => {
          const style = getComputedStyle(node);
          const foreground = luminance(
            node.matches('svg') ? style.color : style.borderTopColor,
          );
          const surface = luminance(background(node));
          return (
            (Math.max(foreground, surface) + 0.05) /
            (Math.min(foreground, surface) + 0.05)
          );
        });
      });
    expect(ratios.every((ratio) => ratio >= 3)).toBe(true);
    await page.keyboard.press('Tab');
    const controls = page.locator(
      'button:not(:disabled),input,select:not(:disabled)',
    );
    for (const control of await controls.all()) {
      await control.focus();
      expect(
        await control.evaluate((node) => getComputedStyle(node).outlineWidth),
      ).toBe('3px');
    }
  }
});

test('blocked storage keeps an explicit theme for the visit without promising persistence', async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, 'localStorage', {
      get() {
        throw new Error('storage denied');
      },
    });
  });
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await page.getByRole('combobox', { name: 'Apparence' }).selectOption('dark');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
});
test('explicit themes survive reload without hydration errors and CSP is enforced', async ({
  page,
  browserName,
  browser,
}, testInfo) => {
  const errors: string[] = [];
  const nativeSelectWarning =
    "Refused to apply a stylesheet because its hash, its nonce, or 'unsafe-inline' does not appear in the style-src directive of the Content Security Policy.";
  const affectedEngine =
    browserName === 'webkit' && browser.version() === '27.2';
  let nativeSelectWarnings = 0;
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    // Reproduced with a single native select and no application code; no CSP relaxation.
    if (
      affectedEngine &&
      message.type() === 'error' &&
      message.text() === nativeSelectWarning
    ) {
      nativeSelectWarnings++;
      return;
    }
    if (
      message.type() === 'error' &&
      /hydration|mismatch|content security|refused/i.test(message.text())
    )
      errors.push(message.text());
  });
  const response = await page.goto('/');
  const csp = response!.headers()['content-security-policy']!;
  expect(csp).toContain("frame-ancestors 'none'");
  expect(csp).not.toContain("'unsafe-inline'");
  expect(csp).not.toContain("'unsafe-eval'");
  const theme = page.getByRole('combobox', { name: 'Apparence' });
  await theme.selectOption('dark');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.reload();
  await expect(theme).toHaveValue('dark');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.screenshot({
    path: testInfo.outputPath('foundation-dark.png'),
    fullPage: true,
  });
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await page.emulateMedia({ colorScheme: 'dark' });
  await theme.selectOption('system');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.emulateMedia({ colorScheme: 'light' });
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  expect(errors).toEqual([]);
  if (nativeSelectWarnings) {
    testInfo.annotations.push({
      type: 'known-engine-warning',
      description:
        'WebKit 27.2 native selects: https://github.com/microsoft/playwright/issues/43497',
    });
    await testInfo.attach('webkit-native-select-csp-warning', {
      body: JSON.stringify({
        version: browser.version(),
        count: nativeSelectWarnings,
        message: nativeSelectWarning,
      }),
      contentType: 'application/json',
    });
  }
  await page.evaluate(() => {
    const button = document.createElement('button');
    button.setAttribute('onclick', 'window.__untrusted_script_executed = true');
    document.body.append(button);
    button.click();
    button.remove();
  });
  expect(
    await page.evaluate(
      () =>
        (window as Window & { __untrusted_script_executed?: boolean })
          .__untrusted_script_executed,
    ),
  ).toBeUndefined();
});
