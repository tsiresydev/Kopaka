import { test, expect } from './fixtures/environment.js';

test('language and theme persist, stay usable offline and hydrate without errors', async ({
  page,
  context,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error' && /hydrat/i.test(message.text()))
      errors.push(message.text());
  });
  await page.goto('/');
  await expect(page.getByRole('status')).toContainText('Disponible');
  const language = page.locator('.preferences select').first();
  await expect(language.locator('option')).toHaveText(['Français', 'Malagasy']);
  await page
    .getByLabel('Champ de démonstration', { exact: true })
    .fill('Texte conservé');
  await language.focus();
  await language.selectOption('mg');
  await expect(language).toBeFocused();
  await expect(page.locator('html')).toHaveAttribute('lang', 'mg');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'Pejy fototra',
  );
  await expect(
    page.getByLabel('Saha fanandramana', { exact: true }),
  ).toHaveValue('Texte conservé');
  const theme = page.getByRole('combobox', { name: 'Endrika' });
  for (const choice of ['dark', 'light', 'system']) {
    await theme.selectOption(choice);
    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('lang', 'mg');
    await expect(theme).toHaveValue(choice);
    await expect(page.locator('html')).toHaveAttribute(
      'data-theme',
      choice === 'dark' ? 'dark' : 'light',
    );
  }
  await context.setOffline(true);
  await language.selectOption('fr');
  await page.getByRole('button', { name: 'Réessayer', exact: true }).click();
  await expect(page.getByRole('status')).toContainText('Indisponible');
  await language.selectOption('mg');
  await expect(page.getByRole('status')).toContainText('Tsy azo ampiasaina');
  await context.setOffline(false);
  expect(errors).toEqual([]);
});

test('blocked and corrupt storage preserve usable language and independent theme', async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, 'localStorage', {
      get() {
        throw new Error('denied');
      },
    });
  });
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'fr');
  await page.getByRole('combobox', { name: 'Langue' }).selectOption('mg');
  await page.getByRole('combobox', { name: 'Endrika' }).selectOption('dark');
  await expect(page.locator('html')).toHaveAttribute('lang', 'mg');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('lang', 'fr');
});

test('corrupt locale alone falls back and keeps the saved theme', async ({
  page,
}) => {
  await page.addInitScript(() => {
    localStorage.setItem('kopaka.locale.v1', 'corrupt');
    localStorage.setItem('kopaka.theme.v1', 'dark');
    localStorage.setItem('unrelated', 'keep');
  });
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'fr');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  expect(await page.evaluate(() => localStorage.getItem('unrelated'))).toBe(
    'keep',
  );
});

test('both languages allow 40 percent text expansion at all five widths', async ({
  page,
}) => {
  for (const locale of ['fr', 'mg']) {
    for (const width of [320, 375, 768, 1024, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/');
      await page.locator('.preferences select').first().selectOption(locale);
      await expect(page.getByRole('status')).toContainText(
        locale === 'fr' ? 'Disponible' : 'Azo ampiasaina',
      );
      await page.evaluate(() => {
        const walker = document.createTreeWalker(
          document.body,
          NodeFilter.SHOW_TEXT,
        );
        while (walker.nextNode()) {
          const node = walker.currentNode;
          if (
            node.textContent?.trim() &&
            !['SCRIPT', 'STYLE', 'OPTION'].includes(
              node.parentElement?.tagName ?? '',
            )
          ) {
            const text = node.textContent;
            node.textContent =
              text + ' ' + text.slice(0, Math.ceil(text.length * 0.4));
          }
        }
      });
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      const controls = await page
        .locator('button,input,select')
        .evaluateAll((nodes) =>
          nodes.map((node) => {
            const rect = node.getBoundingClientRect();
            return {
              width: rect.width,
              height: rect.height,
              label:
                node.getAttribute('aria-label') ??
                (node as HTMLInputElement).labels?.[0]?.textContent ??
                node.textContent,
            };
          }),
        );
      expect(
        controls.every(
          (control) =>
            control.width >= 48 &&
            control.height >= 48 &&
            control.label?.trim(),
        ),
      ).toBe(true);
    }
  }
});
