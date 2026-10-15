/** Kota dan area publik tiap cabang. Satu sumber untuk semua halaman dan respons publik. */
const BRANCH_LOCATIONS: Record<string, { city: string; area: string }> = {
  'DD-GG': { city: 'Jakarta Barat', area: 'Kedoya Utara, Kebon Jeruk' },
  'DD-MK': { city: 'Jakarta Utara', area: 'Pluit, Penjaringan' },
  'DD-SBY': { city: 'Surabaya', area: 'Dukuhpakis, Surabaya Barat' },
  'DD-UNTAR': { city: 'Jakarta Barat', area: 'Tanjung Duren, Grogol Petamburan' },
  'DD-PIK2': { city: 'Tangerang', area: 'PIK 2, Kosambi' },
};

/** Cabang baru yang belum terdaftar: ambil kota dari alamat ("Kota X" / "Kabupaten X"), bukan menebak. */
function cityFromAddress(address: string | null | undefined): string {
  const match = address?.match(/\b(?:Kota|Kabupaten|Kab\.)\s+([A-Za-z]+(?: [A-Za-z]+)*?)(?:,|$)/);
  return match?.[1]?.trim() ?? '';
}

export function branchPublicLocation(
  code: string,
  name: string,
  address: string | null | undefined,
): { city: string; area: string } {
  const known = BRANCH_LOCATIONS[code];
  if (known) return known;
  return { city: cityFromAddress(address), area: name };
}
