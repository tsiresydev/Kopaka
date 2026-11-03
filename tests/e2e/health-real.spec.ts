import { test, expect } from './fixtures/environment.js';

test('foundation connects to real data and recovers after each real outage', async ({
  page,
  environment,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  await expect(
    page.getByRole('heading', { name: 'Page de fondation', exact: true }),
  ).toBeVisible();
  await expect(page.getByRole('status')).toContainText('Disponible');
  const input = page.getByLabel('Champ de démonstration', { exact: true });
  await input.fill('Texte conservé');
  for (const dependency of ['redis', 'postgres'] as const) {
    environment.stopDependency(dependency);
    await page.getByRole('button', { name: 'Réessayer', exact: true }).click();
    await expect(page.getByRole('status')).toContainText('Indisponible');
    await expect(input).toHaveValue('Texte conservé');
    await environment.startDependency(dependency);
    await expect(page.getByRole('status')).toContainText('Indisponible');
    await page.getByRole('button', { name: 'Réessayer', exact: true }).click();
    await expect(page.getByRole('status')).toContainText('Disponible');
  }
  await environment.stopApi();
  await page.getByRole('button', { name: 'Réessayer', exact: true }).click();
  await expect(page.getByRole('status')).toContainText('Indisponible');
  await expect(input).toHaveValue('Texte conservé');
  await environment.startApi();
  await page.getByRole('button', { name: 'Réessayer', exact: true }).click();
  await expect(page.getByRole('status')).toContainText('Disponible');
  expect(
    errors.filter((error) => /hydration|mismatch|uncaught/i.test(error)),
  ).toEqual([]);
});
