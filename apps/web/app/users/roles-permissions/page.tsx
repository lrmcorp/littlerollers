import type { Metadata } from 'next';
import { RolePermissionsView } from './role-permissions-view';

export const metadata: Metadata = {
  title: 'Peran & Hak Akses',
};

export default function RolesPermissionsPage() {
  return <RolePermissionsView />;
}
