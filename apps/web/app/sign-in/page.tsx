import type { Metadata } from 'next';
import { SignInView } from './sign-in-view';

export const metadata: Metadata = {
  title: 'Masuk',
};

export default function SignInPage() {
  return <SignInView />;
}
