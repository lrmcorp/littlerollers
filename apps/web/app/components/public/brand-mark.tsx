import Image from 'next/image';
import Link from 'next/link';

type BrandMarkProps = {
  /** Where the logo links to. Defaults to the home page so it is safe on any page. */
  href?: string;
  /** Load the badge eagerly. Use for the header logo, not the footer. */
  priority?: boolean;
  /** `light` sets the wordmark in white for use over the hillside scene. */
  tone?: 'dark' | 'light';
  /** Hide the wordmark and show only the badge. */
  badgeOnly?: boolean;
  className?: string;
  ariaLabel?: string;
};

export function BrandMark({
  href = '/',
  priority = false,
  tone = 'dark',
  badgeOnly = false,
  className = '',
  ariaLabel = 'Little Rollers, back to the home page',
}: BrandMarkProps) {
  return (
    <Link
      className={`inline-flex min-h-11 items-center gap-2.5 no-underline ${className}`}
      href={href}
      aria-label={ariaLabel}
    >
      <Image
        className="block size-10 shrink-0 rounded-full"
        src="/images/logo.png"
        width={80}
        height={80}
        alt=""
        priority={priority}
      />
      {!badgeOnly && (
        <span
          className={`font-display text-[22px] leading-none whitespace-nowrap ${
            tone === 'light' ? 'text-white' : 'text-dd-forest'
          }`}
        >
          Little Rollers
        </span>
      )}
    </Link>
  );
}
