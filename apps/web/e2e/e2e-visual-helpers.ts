import type { Page } from '@playwright/test';

export async function hideNextDevelopmentAffordances(page: Page) {
  await page.addInitScript(() => {
    const hide = () => {
      if (!document.head || document.querySelector('[data-e2e-hide-next-devtools]')) return;
      const style = document.createElement('style');
      style.dataset.e2eHideNextDevtools = 'true';
      style.textContent = 'nextjs-portal { display: none !important; }';
      document.head.append(style);
    };
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', hide, { once: true });
    } else {
      hide();
    }
  });
}
