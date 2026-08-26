'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import type { HeroCarouselPayload, HeroSlideItem } from '@/api-clients/account-client';
import {
  publicContainer as container,
  publicPrimaryButton as primaryButton,
  publicSecondaryButton as secondaryButton,
} from './public-styles';

const DEFAULT_SLIDES: HeroSlideItem[] = [
  {
    id: 'default-1',
    badge: 'Move better, live better',
    title: 'Stronger Body.',
    highlightTitle: 'Calmer Mind.',
    description:
      'Daily Dose Pilates adalah studio modern yang membantu Anda merasa lebih kuat, bergerak lebih baik, dan menjalani hari dengan lebih seimbang.',
    imageSrc: '/images/public/landing/hero-pilates.png',
    primaryCta: {
      label: 'Lihat Jadwal',
      href: '/classes#schedule',
    },
    secondaryCta: {
      label: 'Lihat Paket',
      href: '/packages',
    },
    active: true,
    order: 1,
  },
  {
    id: 'default-2',
    badge: 'Promo Member Baru · Hemat hingga 20%',
    title: 'Mulai Langkah Pilates Anda',
    highlightTitle: 'Dengan Paket Spesial',
    description:
      'Dapatkan sesi pengenalan privat dan pendampingan instruktur bersertifikasi internasional untuk hasil optimal.',
    imageSrc: '/images/public/classes/reformer-pilates.png',
    primaryCta: {
      label: 'Pilih Paket Promo',
      href: '/packages',
    },
    secondaryCta: {
      label: 'Jelajahi Studio',
      href: '/locations',
    },
    active: true,
    order: 2,
  },
  {
    id: 'default-3',
    badge: 'Private & Semi-Private Group',
    title: 'Suasana Tenang & Personal',
    highlightTitle: 'Di Setiap Gerakan',
    description:
      'Kapasitas kelas kecil maksimal 4 peserta memastikan postur dan teknik latihan Anda selalu terjaga dengan aman.',
    imageSrc: '/images/public/classes/cadillac-pilates.png',
    primaryCta: {
      label: 'Daftar Kelas Hari Ini',
      href: '/classes',
    },
    secondaryCta: {
      label: 'Konsultasi WhatsApp',
      href: '/contact',
    },
    active: true,
    order: 3,
  },
];

export function HeroCarousel({ config }: { config?: HeroCarouselPayload | null }) {
  const slides = useMemo(() => {
    if (!config?.slides || config.slides.length === 0) return DEFAULT_SLIDES;
    const activeSlides = config.slides
      .filter((s) => s.active !== false)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    return activeSlides.length > 0 ? activeSlides : DEFAULT_SLIDES;
  }, [config]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const total = slides.length;
  const autoplay = config?.autoplay ?? true;
  const intervalMs = config?.intervalMs && config.intervalMs >= 2000 ? config.intervalMs : 6000;

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % total);
  }, [total]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  // Autoplay Timer
  useEffect(() => {
    if (!autoplay || total <= 1 || isHovered) return;
    const timer = setInterval(() => {
      nextSlide();
    }, intervalMs);
    return () => clearInterval(timer);
  }, [autoplay, total, isHovered, intervalMs, nextSlide]);

  // Touch Swipe Handlers for Mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0]?.clientX ?? null;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0]?.clientX ?? null;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current === null || touchEndX.current === null) return;
    const distance = touchStartX.current - touchEndX.current;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;
    if (isLeftSwipe) {
      nextSlide();
    } else if (isRightSwipe) {
      prevSlide();
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  return (
    <section
      className="relative isolate min-h-[580px] sm:min-h-[620px] lg:min-h-[660px] overflow-hidden select-none"
      aria-roledescription="carousel"
      aria-label="Sorotan Kelas dan Penawaran Daily Dose"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Background Images with Cross-Fade */}
      {slides.map((slide, index) => {
        const isActive = index === currentIndex;
        return (
          <div
            key={slide.id || index}
            className={`absolute inset-0 z-0 transition-opacity duration-1000 ease-in-out ${
              isActive ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
            aria-hidden={!isActive}
          >
            <Image
              className="object-cover object-[65%_center] lg:object-[60%_center]"
              src={slide.imageSrc || '/images/public/landing/hero-pilates.png'}
              fill
              priority={index === 0}
              sizes="100vw"
              alt={slide.title}
            />
          </div>
        );
      })}

      {/* Gradients */}
      <div className="absolute inset-0 z-10 bg-gradient-to-r from-dd-cream/98 via-dd-cream/92 to-transparent lg:via-dd-cream/80 pointer-events-none" />
      <div className="absolute inset-0 z-10 bg-gradient-to-t from-dd-cream via-transparent to-transparent lg:hidden pointer-events-none" />

      {/* Slide Content */}
      <div className={`${container} relative z-20 flex min-h-[580px] sm:min-h-[620px] lg:min-h-[660px] items-center py-16 sm:py-20`}>
        <div className="max-w-[560px] space-y-6">
          {slides.map((slide, index) => {
            const isActive = index === currentIndex;
            if (!isActive) return null;

            return (
              <div key={slide.id || index} className="space-y-6 transition-all duration-300">
                {/* Badge */}
                {slide.badge && (
                  <div className="inline-flex items-center gap-2 rounded-full border border-dd-forest/20 bg-white/85 px-3.5 py-1 text-xs font-bold text-dd-forest uppercase shadow-dd-soft backdrop-blur-sm">
                    <Sparkles className="size-3.5 text-dd-brass" />
                    <span>{slide.badge}</span>
                  </div>
                )}

                {/* Title */}
                <h1
                  id="marketing-hero-title"
                  className="m-0 font-sans text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.04] tracking-tight text-dd-ink text-balance"
                >
                  {slide.title}{' '}
                  {slide.highlightTitle && (
                    <span className="text-dd-forest block sm:inline">{slide.highlightTitle}</span>
                  )}
                </h1>

                {/* Description */}
                <p className="max-w-[500px] text-base sm:text-lg leading-relaxed text-dd-muted">
                  {slide.description}
                </p>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  {slide.primaryCta?.href && (
                    <Link className={primaryButton} href={slide.primaryCta.href}>
                      {slide.primaryCta.label || 'Lihat Jadwal'}{' '}
                      <span aria-hidden="true">›</span>
                    </Link>
                  )}
                  {slide.secondaryCta?.href && (
                    <Link className={secondaryButton} href={slide.secondaryCta.href}>
                      {slide.secondaryCta.label || 'Lihat Paket'}{' '}
                      <span aria-hidden="true">›</span>
                    </Link>
                  )}
                  <Link
                    className="inline-flex min-h-11 items-center justify-center gap-1.5 px-3 text-xs sm:text-sm font-bold text-dd-forest no-underline transition hover:underline"
                    href="/locations"
                  >
                    Jelajahi Studio <span aria-hidden="true">›</span>
                  </Link>
                </div>
              </div>
            );
          })}

          {/* Trust Badge */}
          <div className="flex flex-wrap items-center gap-3 pt-4 text-xs font-medium text-dd-muted border-t border-dd-line/60">
            <span>Latihan personal dan kelompok kecil</span>
            <span className="text-dd-line">•</span>
            <strong className="tracking-wider text-dd-brass font-bold" aria-label="Lima bintang">
              ★★★★★
            </strong>
            <span className="text-dd-line">•</span>
            <span>Move with intention</span>
          </div>
        </div>
      </div>

      {/* Navigation Chevrons (Desktop & Tablet) */}
      {total > 1 && (
        <>
          <button
            type="button"
            onClick={prevSlide}
            aria-label="Slide sebelumnya"
            className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 z-30 size-11 rounded-full border border-dd-line/70 bg-white/80 hover:bg-white text-dd-forest shadow-dd-card backdrop-blur-md flex items-center justify-center transition-all hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-dd-forest/40"
          >
            <ChevronLeft className="size-6" />
          </button>
          <button
            type="button"
            onClick={nextSlide}
            aria-label="Slide berikutnya"
            className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 z-30 size-11 rounded-full border border-dd-line/70 bg-white/80 hover:bg-white text-dd-forest shadow-dd-card backdrop-blur-md flex items-center justify-center transition-all hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-dd-forest/40"
          >
            <ChevronRight className="size-6" />
          </button>
        </>
      )}

      {/* Dot Indicators */}
      {total > 1 && (
        <nav
          className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/70 backdrop-blur-md border border-dd-line/60 shadow-dd-soft"
          aria-label="Pilih slide"
        >
          {slides.map((_, index) => {
            const isActive = index === currentIndex;
            return (
              <button
                key={index}
                type="button"
                onClick={() => goToSlide(index)}
                aria-label={`Buka slide ${index + 1} dari ${total}`}
                aria-current={isActive}
                className={`transition-all duration-300 rounded-full ${
                  isActive ? 'w-6 h-2.5 bg-dd-forest' : 'w-2.5 h-2.5 bg-dd-line hover:bg-dd-forest/50'
                }`}
              />
            );
          })}
        </nav>
      )}
    </section>
  );
}
