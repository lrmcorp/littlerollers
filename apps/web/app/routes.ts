export const routes = {
  home: '/',
  classes: '/classes',
  packages: '/packages',
  locations: '/locations',
  contact: '/contact',
  signIn: '/sign-in',
  register: '/register',
  account: '/account',
  workspace: '/workspace',
  security: '/account/security',
  activateAccount: '/activate-account',
  forgotPassword: '/forgot-password',
  resetPassword: '/reset-password',
} as const;

export const publicNavigation = [
  { href: '/#about', label: 'Tentang' },
  { href: routes.classes, label: 'Kelas' },
  { href: '/classes#schedule', label: 'Jadwal' },
  { href: routes.packages, label: 'Paket' },
  { href: routes.locations, label: 'Studio' },
  { href: routes.contact, label: 'Kontak' },
] as const;

export function signInReturnTo(returnTo: string): string {
  return `${routes.signIn}?returnTo=${encodeURIComponent(returnTo)}`;
}
