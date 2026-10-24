import Image from 'next/image';
import Link from 'next/link';

type BrandMarkProps = {
  /**
   * Tujuan ketika logo diklik.
   * Gunakan "/" agar tetap aman ketika komponen tampil di halaman selain landing.
   */
  href?: string;

  /**
   * Memprioritaskan loading gambar.
   * Aktifkan pada logo di header, tetapi tidak perlu pada footer.
   */
  priority?: boolean;
  className?: string;
  ariaLabel?: string;
  /**
   * `light` memakai logo putih untuk latar berwarna primer/gelap (hijau footer, sidebar).
   * `default` memakai logo hijau untuk latar terang.
   */
  tone?: 'default' | 'light';
};

export function BrandMark({
  href = '/',
  priority = false,
  className = '',
  ariaLabel = 'Daily Dose Pilates — kembali ke halaman utama',
  tone = 'default',
}: BrandMarkProps) {
  return (
    <Link className={`inline-flex items-center ${className}`} href={href} aria-label={ariaLabel}>
      <Image
        className="block h-auto w-full object-contain"
        src={tone === 'light' ? '/images/logo-white.png' : '/images/logo.png'}
        width={500}
        height={138}
        alt="Daily Dose Pilates"
        priority={priority}
        sizes="(max-width: 640px) 170px, 240px"
      />
    </Link>
  );
}
