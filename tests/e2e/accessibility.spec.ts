import AxeBuilder from '@axe-core/playwright';
import type { Page } from '@playwright/test';
import { test, expect } from './fixtures/environment.js';
const fr = {
  skip: 'Aller au contenu',
  theme: { label: 'Apparence' },
  service: {
    available: 'Disponible',
    unavailable: 'Indisponible',
    loading: 'Vérification en cours…',
    retry: 'Réessayer',
    recovery: 'Le service ne répond pas correctement. Vous pouvez réessayer.',
  },
  demos: {
    errorLabel: 'Champ avec erreur',
    error: 'Exemple d’erreur : vérifiez cette valeur.',
    disabled: 'Action indisponible',
  },
};
const mg = {
  skip: 'Hankany amin’ny votoaty',
  theme: { label: 'Endrika' },
  service: {
    available: 'Azo ampiasaina',
    unavailable: 'Tsy azo ampiasaina',
    loading: 'Eo am-panamarinana…',
    retry: 'Andramo indray',
    recovery:
      'Tsy mamaly araka ny tokony ho izy ny tolotra. Azonao andramana indray.',
  },
  demos: {
    errorLabel: 'Saha misy hadisoana',
    error: 'Ohatra amin’ny hadisoana: hamarino ity sanda ity.',
    disabled: 'Hetsika tsy azo ampiasaina',
  },
};

async function expandText(page: Page) {
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
          text + ' ' + text.repeat(2).slice(0, Math.ceil(text.length * 0.4));
      }
    }
  });
}

for (const [locale, messages] of Object.entries({ fr, mg })) {
  for (const theme of ['light', 'dark']) {
    test(`axe, keyboard and expansion: ${locale}/${theme} at five widths`, async ({
      page,
    }, testInfo) => {
      test.setTimeout(180000);
      await page.emulateMedia({ reducedMotion: 'reduce' });
      for (const width of [320, 375, 768, 1024, 1440]) {
        await page.setViewportSize({ width, height: 900 });
        await page.goto('/');
        await page
          .getByRole('combobox', { name: /^(Langue|Fiteny)$/ })
          .selectOption(locale);
        await page
          .getByRole('combobox', { name: messages.theme.label })
          .selectOption(theme);
        await expect(page.getByRole('status')).toContainText(
          messages.service.available,
        );
        await expect(page.locator('html')).toHaveAttribute('lang', locale);
        await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
        const audit = await new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
          .analyze();
        await testInfo.attach(`axe-${width}`, {
          body: JSON.stringify(audit),
          contentType: 'application/json',
        });
        expect(audit.violations).toEqual([]);

        const skip = page.getByRole('link', { name: messages.skip });
        await page.getByRole('combobox', { name: /^(Langue|Fiteny)$/ }).focus();
        await page.keyboard.press('Shift+Tab');
        await expect(skip).toBeFocused();
        const controls = page.locator(
          'button:not(:disabled),input,select:not(:disabled)',
        );
        for (const control of await controls.all()) {
          await page.keyboard.press('Tab');
          await expect(control).toBeFocused();
          const metrics = await control.evaluate((node) => {
            const style = getComputedStyle(node),
              rect = node.getBoundingClientRect();
            return {
              width: rect.width,
              height: rect.height,
              outline: style.outlineWidth,
              offset: style.outlineOffset,
              transition: style.transitionDuration,
            };
          });
          expect(metrics.width).toBeGreaterThanOrEqual(48);
          expect(metrics.height).toBeGreaterThanOrEqual(48);
          expect(metrics.outline).toBe('3px');
          expect(metrics.offset).toBe('3px');
          expect(
            metrics.transition
              .split(',')
              .every((value) => value.trim() === '0s'),
          ).toBe(true);
        }
        await skip.focus();
        await skip.press('Enter');
        await expect(page.locator('main')).toBeFocused();
        const field = page.getByLabel(messages.demos.errorLabel, {
          exact: true,
        });
        await expect(field).toHaveAttribute('aria-invalid', 'true');
        await expect(field).toHaveAccessibleDescription(messages.demos.error);
        await expect(
          page.getByRole('button', {
            name: messages.demos.disabled,
            exact: true,
          }),
        ).toBeDisabled();
        await expandText(page);
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
        ).toBe(true);
        await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
      }
    });
  }
}

test('simulated loading and failure retain one polite region and keyboard retry in both languages', async ({
  page,
  environment,
}) => {
  for (const [locale, messages] of Object.entries({ fr, mg })) {
    let release!: () => void;
    const held = new Promise<void>((resolve) => {
      release = resolve;
    });
    await page.route(environment.apiURL + '/health/ready', async (route) => {
      await held;
      await route.fulfill({
        status: 503,
        contentType: 'application/json',
        headers: { 'Access-Control-Allow-Origin': environment.baseURL },
        body: '{"status":"not_ready"}',
      });
    });
    await page.goto('/');
    await page
      .getByRole('combobox', { name: /^(Langue|Fiteny)$/ })
      .selectOption(locale);
    const retry = page.getByRole('button', {
      name: messages.service.retry,
      exact: true,
    });
    await expect(page.getByRole('status')).toHaveCount(1);
    await expect(page.getByRole('status')).toContainText(
      messages.service.loading,
    );
    await expect(retry).toHaveAttribute('aria-disabled', 'true');
    release();
    await expect(page.getByRole('status')).toContainText(
      messages.service.unavailable,
    );
    await expect(page.getByRole('status')).toHaveAttribute(
      'aria-live',
      'polite',
    );
    await expect(page.getByRole('status')).toHaveAttribute(
      'aria-atomic',
      'true',
    );
    await expect(retry).toHaveAttribute('aria-disabled', 'false');
    await retry.focus();
    await retry.press('Enter');
    await expect(retry).toBeFocused();
    await expect(page.getByRole('status')).toContainText(
      messages.service.recovery,
    );
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
    await page.unroute(environment.apiURL + '/health/ready');
  }
});
