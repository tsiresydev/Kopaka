import { test, expect } from './fixtures/environment.js';

test('simulated invalid JSON and 429 show recovery without internal detail', async ({
  page,
  environment,
}) => {
  let attempt = 0;
  await page.route(environment.apiURL + '/health/ready', (route) => {
    attempt++;
    return route.fulfill({
      status: attempt === 2 ? 429 : 200,
      contentType: 'application/json',
      headers: { 'Access-Control-Allow-Origin': environment.baseURL },
      body:
        attempt === 1
          ? 'private-invalid-json'
          : attempt === 2
            ? '{"code":"RATE_LIMITED"}'
            : '{"status":"ready"}',
    });
  });
  await page.goto('/');
  await expect(page.getByRole('status')).toContainText('Indisponible');
  await expect(page.getByRole('status')).not.toContainText(
    'private-invalid-json',
  );
  await page.getByRole('button', { name: 'Réessayer', exact: true }).click();
  await expect(page.getByRole('status')).toContainText('Indisponible');
  await page.getByRole('button', { name: 'Réessayer', exact: true }).click();
  await expect(page.getByRole('status')).toContainText('Disponible');
});
test('simulated slow and obsolete response cannot replace a newer success', async ({
  page,
  environment,
}) => {
  let attempt = 0;
  let oldFinished = false;
  await page.route(environment.apiURL + '/health/ready', async (route) => {
    attempt++;
    if (attempt === 1) {
      await new Promise((resolve) => setTimeout(resolve, 3500));
      try {
        await route.fulfill({
          status: 503,
          contentType: 'application/json',
          headers: { 'Access-Control-Allow-Origin': environment.baseURL },
          body: '{"status":"not_ready"}',
        });
      } catch {
        /* The timed-out browser request may already be aborted. */
      } finally {
        oldFinished = true;
      }
    } else
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        headers: { 'Access-Control-Allow-Origin': environment.baseURL },
        body: '{"status":"ready"}',
      });
  });
  await page.goto('/');
  await expect(page.getByRole('status')).toContainText('Indisponible', {
    timeout: 5000,
  });
  await page.getByRole('button', { name: 'Réessayer', exact: true }).click();
  await expect(page.getByRole('status')).toContainText('Disponible');
  await expect.poll(() => oldFinished).toBe(true);
  await expect(page.getByRole('status')).toContainText('Disponible');
});
test('retry clears the old success, stays focused and starts only one active request', async ({
  page,
  environment,
}) => {
  let attempt = 0;
  let release!: () => void;
  const held = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route(environment.apiURL + '/health/ready', async (route) => {
    attempt++;
    if (attempt === 2) await held;
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      headers: { 'Access-Control-Allow-Origin': environment.baseURL },
      body: '{"status":"ready"}',
    });
  });
  await page.goto('/');
  await expect(page.getByRole('status')).toContainText('Disponible');
  const button = page.getByRole('button', { name: 'Réessayer', exact: true });
  await button.focus();
  await button.press('Enter');
  await expect(page.getByRole('status')).not.toContainText('Disponible');
  await expect(button).toHaveAttribute('aria-disabled', 'true');
  await expect(button).toBeFocused();
  await button.evaluate((node) => (node as HTMLButtonElement).click());
  expect(attempt).toBe(2);
  release();
  await expect(page.getByRole('status')).toContainText('Disponible');
  await expect(button).toBeFocused();
});
test('simulated offline after loading keeps content and permits retry after recovery', async ({
  page,
  context,
}) => {
  await page.goto('/');
  await expect(page.getByRole('status')).toContainText('Disponible');
  const input = page.getByLabel('Champ de démonstration', { exact: true });
  await input.fill('Contenu conservé');
  await context.setOffline(true);
  await page.getByRole('button', { name: 'Réessayer', exact: true }).click();
  await expect(page.getByRole('status')).toContainText('Indisponible');
  await expect(input).toHaveValue('Contenu conservé');
  await context.setOffline(false);
  await page.getByRole('button', { name: 'Réessayer', exact: true }).click();
  await expect(page.getByRole('status')).toContainText('Disponible');
});
