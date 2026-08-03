import { expect, test } from '@playwright/test';
import { hideNextDevelopmentAffordances } from './e2e-visual-helpers';

const breakpoints = [
  { name: 'desktop-1280', width: 1280, height: 900 },
  { name: 'tablet-768', width: 768, height: 900 },
  { name: 'mobile-360', width: 360, height: 800 },
];

test.beforeEach(async ({ page }) => {
  await hideNextDevelopmentAffordances(page);
  await page.route('**/api/v1/me', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: 'visual-super-owner',
        displayName: 'Visual Super Owner',
        roles: ['SUPER_OWNER'],
        branchIds: ['branch-1'],
        sessionExpiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
        capabilities: ['user:read', 'user:admin', 'audit:read', 'branch:all'],
        branches: [{ id: 'branch-1', code: 'GG', name: 'Green Garden', timezone: 'Asia/Jakarta' }],
      }),
    }),
  );
  await page.route('**/api/v1/users/role-catalog', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        items: [
          {
            role: 'ADMIN',
            capabilities: ['user:read'],
            assignable: true,
            readOnly: false,
            scope: 'BRANCH',
          },
        ],
      }),
    }),
  );
  await page.route('**/api/v1/users?**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ items: [], page: { nextCursor: null, hasMore: false } }),
    }),
  );
  await page.route('**/api/v1/users', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ items: [], page: { nextCursor: null, hasMore: false } }),
    }),
  );
});

for (const breakpoint of breakpoints) {
  test(`Tailwind Studios ${breakpoint.name}`, async ({ page }) => {
    await page.setViewportSize(breakpoint);
    await page.goto('/locations');
    await expect(page.getByRole('heading', { name: 'Studio Kami', exact: true })).toBeVisible();
    await expect(page.locator('body')).toHaveJSProperty('scrollWidth', breakpoint.width);
    await expect(page).toHaveScreenshot(`studios-${breakpoint.name}.png`, {
      animations: 'disabled',
      fullPage: true,
      maxDiffPixelRatio: 0.02,
    });
  });

  test(`premium sign-in ${breakpoint.name}`, async ({ page }) => {
    await page.setViewportSize(breakpoint);
    await page.goto('/sign-in?returnTo=%2Fclasses%23schedule');
    await expect(page.getByRole('heading', { name: 'Masuk ke Daily Dose' })).toBeVisible();
    await expect(page.getByLabel('Email', { exact: true })).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();
    await expect(page.locator('body')).toHaveJSProperty('scrollWidth', breakpoint.width);
    await expect(page).toHaveScreenshot(`sign-in-${breakpoint.name}.png`, {
      animations: 'disabled',
      fullPage: true,
      maxDiffPixelRatio: 0.02,
    });
  });

  test(`accessible registration ${breakpoint.name}`, async ({ page }) => {
    await page.setViewportSize(breakpoint);
    await page.goto('/register');
    await expect(page.getByRole('heading', { name: 'Buat akun Daily Dose' })).toBeVisible();
    await expect(page.locator('body')).toHaveJSProperty('scrollWidth', breakpoint.width);

    const form = page.getByRole('form', { name: 'Registrasi customer' });
    await expect(form).toHaveAttribute('method', 'post');
    await expect(form).not.toHaveAttribute('action');

    const loginTarget = await page
      .getByRole('link', { name: 'Masuk', exact: true })
      .evaluate((element) => element.getBoundingClientRect().height);
    expect(loginTarget).toBeGreaterThanOrEqual(44);

    const heroHeight = await page
      .locator('.auth-visual-panel')
      .evaluate((element) => element.getBoundingClientRect().height);
    if (breakpoint.width <= 800) expect(heroHeight).toBe(140);

    const registerAction = page.getByRole('button', { name: 'Daftar dan masuk' });
    const registerActionStyle = await registerAction.evaluate((element) => {
      const style = getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      return {
        backgroundColor: style.backgroundColor,
        color: style.color,
        height: rect.height,
      };
    });
    expect(registerActionStyle).toEqual({
      backgroundColor: 'rgb(40, 87, 64)',
      color: 'rgb(255, 255, 255)',
      height: 52,
    });
    await registerAction.focus();
    expect(
      await registerAction.evaluate((element) => getComputedStyle(element).outlineStyle),
    ).not.toBe('none');

    await registerAction.click();
    await expect(page.getByLabel('Nama lengkap')).toBeFocused();
    await expect(page.getByLabel('Nama lengkap')).toHaveAttribute('aria-invalid', 'true');
    await expect(page.getByText('Nama lengkap wajib diisi.')).toBeVisible();
    await expect(page).toHaveURL('/register');
  });

  test(`check-in pass action ${breakpoint.name}`, async ({ page }) => {
    await page.setViewportSize(breakpoint);
    await page.goto('/check-in-pass#token=dd-checkin%3Av1%3Avisual-test');
    const download = page.getByRole('button', { name: 'Download QR' });
    await expect(download).toBeVisible();
    const style = await download.evaluate((element) => {
      const computed = getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      return {
        backgroundColor: computed.backgroundColor,
        color: computed.color,
        minHeight: rect.height,
      };
    });
    expect(style.backgroundColor).toBe('rgb(40, 87, 64)');
    expect(style.color).toBe('rgb(255, 255, 255)');
    expect(style.minHeight).toBeGreaterThanOrEqual(44);
    await expect(page.locator('body')).toHaveJSProperty('scrollWidth', breakpoint.width);
  });

  test(`activation and reset ${breakpoint.name}`, async ({ page }) => {
    await page.setViewportSize(breakpoint);
    await page.goto('/activate-account?token=visual-token');
    await expect(page.getByRole('heading', { name: 'Buat password' })).toBeVisible();
    await expect(page).toHaveScreenshot(`activation-${breakpoint.name}.png`, {
      animations: 'disabled',
      fullPage: true,
      maxDiffPixelRatio: 0.02,
    });

    await page.goto('/reset-password?token=visual-token');
    await expect(page.getByRole('heading', { name: 'Reset password' })).toBeVisible();
    await expect(page.locator('body')).toHaveJSProperty('scrollWidth', breakpoint.width);
    await expect(page).toHaveScreenshot(`reset-${breakpoint.name}.png`, {
      animations: 'disabled',
      fullPage: true,
      maxDiffPixelRatio: 0.02,
    });
  });

  test(`permission-based user management ${breakpoint.name}`, async ({ page }) => {
    await page.setViewportSize(breakpoint);
    await page.goto('/users');
    await expect(page.getByRole('heading', { name: 'Pengguna', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Buat pengguna internal' })).toBeVisible();
    await expect(page.locator('body')).toHaveJSProperty('scrollWidth', breakpoint.width);
  });
}

test('CTA kritis customer pada mobile 390', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/register');
  const register = page.getByRole('button', { name: 'Daftar dan masuk' });
  await expect(register).toHaveCSS('background-color', 'rgb(40, 87, 64)');
  await expect(register).toHaveCSS('color', 'rgb(255, 255, 255)');
  expect((await register.boundingBox())?.height).toBeGreaterThanOrEqual(44);
  await expect(page.locator('body')).toHaveJSProperty('scrollWidth', 390);

  await page.goto('/check-in-pass#token=dd-checkin%3Av1%3Avisual-test');
  const download = page.getByRole('button', { name: 'Download QR' });
  await expect(download).toHaveCSS('background-color', 'rgb(40, 87, 64)');
  await expect(download).toHaveCSS('color', 'rgb(255, 255, 255)');
  expect((await download.boundingBox())?.height).toBeGreaterThanOrEqual(44);
  await expect(page.locator('body')).toHaveJSProperty('scrollWidth', 390);
});
