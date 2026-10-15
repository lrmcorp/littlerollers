import { branchPublicLocation } from './branch-location';

describe('lokasi publik cabang', () => {
  it.each([
    ['DD-SBY', 'Daily Dose Graha Family Surabaya', 'Surabaya', 'Dukuhpakis, Surabaya Barat'],
    ['DD-MK', 'Daily Dose Muara Karang', 'Jakarta Utara', 'Pluit, Penjaringan'],
    ['DD-PIK2', 'Daily Dose Orange Groves PIK 2', 'Tangerang', 'PIK 2, Kosambi'],
    ['DD-GG', 'Daily Dose Green Garden', 'Jakarta Barat', 'Kedoya Utara, Kebon Jeruk'],
    ['DD-UNTAR', 'Daily Dose Untar Kampus 2', 'Jakarta Barat', 'Tanjung Duren, Grogol Petamburan'],
  ])('%s memakai kota dan area cabang itu sendiri', (code, name, city, area) => {
    expect(branchPublicLocation(code, name, null)).toEqual({ city, area });
  });

  it('tidak pernah mengarang Jakarta untuk cabang yang belum terdaftar', () => {
    const location = branchPublicLocation(
      'DD-BARU',
      'Daily Dose Bandung',
      'Jl. Asia Afrika No. 1, Sumur Bandung, Kota Bandung, Jawa Barat 40111',
    );
    expect(location.city).toBe('Bandung');
    expect(location.area).toBe('Daily Dose Bandung');
    expect(branchPublicLocation('DD-BARU', 'Daily Dose Bandung', null).city).toBe('');
  });
});
