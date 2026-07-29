import { render } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { describe, expect, it } from 'vitest';
import { DataRegion, EmptyState, Feedback, PageHeader, Skeleton, StatusBadge } from './ui';

describe('frontend design primitives', () => {
  it('render semantic states without accessibility violations', async () => {
    const { container, getByRole } = render(
      <main>
        <PageHeader
          eyebrow="Cabang Jakarta"
          title="Antrean operasional"
          description="Tinjau perubahan sebelum mengonfirmasi."
          context={<StatusBadge tone="warning">Akses terbatas</StatusBadge>}
        />
        <Feedback kind="error">Sesi berakhir. Silakan masuk kembali.</Feedback>
        <EmptyState title="Belum ada data" description="Ubah filter atau buat data baru." />
        <Skeleton />
        <DataRegion label="Daftar contoh">
          <table>
            <tbody>
              <tr>
                <th scope="row">Status</th>
                <td>Aktif</td>
              </tr>
            </tbody>
          </table>
        </DataRegion>
      </main>,
    );
    expect(getByRole('heading', { name: 'Antrean operasional' })).toBeTruthy();
    expect(getByRole('alert')).toHaveTextContent('Sesi berakhir');
    expect(getByRole('region', { name: 'Daftar contoh' })).toBeTruthy();
    expect((await axe(container)).violations).toHaveLength(0);
  });
});
