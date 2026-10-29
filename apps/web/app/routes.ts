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
  { href: routes.classes, label: 'Classes' },
  { href: '/classes#schedule', label: 'Timetable' },
  { href: routes.packages, label: 'Packages' },
  { href: routes.locations, label: 'Clubs' },
  { href: routes.contact, label: 'Contact' },
] as const;

export function signInReturnTo(returnTo: string): string {
  return `${routes.signIn}?returnTo=${encodeURIComponent(returnTo)}`;
}
