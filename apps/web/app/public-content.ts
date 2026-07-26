export interface PublicStudioContent {
  code: 'DD-JKT' | 'DD-BSD';
  name: string;
  area: string;
  city: string;
  image: string;
  description: string;
}

export interface PublicClassContent {
  code: 'REFORMER' | 'MAT' | 'BARRE';
  name: string;
  description: string;
  level: string;
  image: string;
}

export const publicStudios: readonly PublicStudioContent[] = [
  {
    code: 'DD-JKT',
    name: 'Daily Dose Jakarta',
    area: 'Jakarta',
    city: 'Jakarta',
    image: 'studio-reception.png',
    description:
      'Studio utama dengan ruang latihan hangat untuk kelas personal dan kelompok kecil.',
  },
  {
    code: 'DD-BSD',
    name: 'Daily Dose BSD',
    area: 'BSD',
    city: 'Tangerang Selatan',
    image: 'studio-interior-reformer.png',
    description: 'Studio tenang dan modern yang melayani komunitas BSD dan sekitarnya.',
  },
] as const;

export const publicClasses: readonly PublicClassContent[] = [
  {
    code: 'REFORMER',
    name: 'Reformer Pilates',
    description: 'Latihan seluruh tubuh dengan resistance yang terukur dan dukungan reformer.',
    level: 'Semua level',
    image: 'reformer-pilates.png',
  },
  {
    code: 'MAT',
    name: 'Mat Pilates',
    description: 'Bangun kekuatan, kontrol, dan koneksi tubuh melalui gerak yang presisi.',
    level: 'Semua level',
    image: 'mat-pilates.png',
  },
  {
    code: 'BARRE',
    name: 'Barre',
    description: 'Perpaduan Pilates dan gerak fungsional untuk stabilitas serta daya tahan.',
    level: 'Pemula–menengah',
    image: 'mat-pilates.png',
  },
] as const;
