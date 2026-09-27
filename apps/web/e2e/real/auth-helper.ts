import type { Page } from '@playwright/test';

export const CUSTOMER_CREDENTIALS = {
  email: 'amanda.member@dailydose.test',
  password: 'Customer123!',
  displayName: 'Amanda Member',
};

export async function loginAsCustomer(page: Page) {
  await page.goto('/account');
  // If already logged in (redirected to /account and not /sign-in)
  if (!page.url().includes('/sign-in') && (await page.getByRole('heading', { level: 1 }).isVisible().catch(() => false))) {
    return;
  }

  await page.goto('/sign-in');
  await page.getByLabel('Email', { exact: true }).fill(CUSTOMER_CREDENTIALS.email);
  await page.getByLabel('Password').fill(CUSTOMER_CREDENTIALS.password);
  await page.getByRole('button', { name: /masuk dengan email/i }).click();
  await page.waitForURL((url) => !url.pathname.includes('/sign-in'), { timeout: 15_000 });
}
