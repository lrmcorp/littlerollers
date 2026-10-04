'use client';

import Image from 'next/image';
import { FormEvent, useCallback, useEffect, useRef, useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  ExternalLink,
  Eye,
  FileImage,
  HelpCircle,
  ImageIcon,
  Layers,
  LayoutTemplate,
  Plus,
  Radio,
  Sliders,
  Sparkles,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { Button, ButtonLink } from '../components/actions';
import { SearchSelect } from '../components/forms';
import { Feedback, Skeleton, StatusBadge } from '../ui';
import { AdminPageHeader } from '../components/admin/admin-page-header';
import { useSessionContext } from '../session-context';
import type { HeroCarouselPayload, HeroSlideItem } from '@/api-clients/account-client';
import { contentFailure, request } from './content-api';
import { FaqEditor } from './faq-editor';

const field =
  'min-h-11 w-full rounded-dd-md border border-dd-line bg-white px-3.5 py-2 text-sm text-dd-ink focus:border-dd-forest focus:outline-none focus:ring-1 focus:ring-dd-forest transition';

const PRESET_IMAGES = [
  { label: 'Reformer Hero (Default)', value: '/images/public/landing/hero-pilates.png' },
  { label: 'Reformer Group Class', value: '/images/public/classes/reformer-pilates.png' },
  { label: 'Cadillac & Tower Pilates', value: '/images/public/classes/cadillac-pilates.png' },
  { label: 'Studio Showcase Reception', value: '/images/public/landing/studio-showcase.png' },
  { label: 'Mat Pilates Studio', value: '/images/public/classes/mat-pilates.png' },
  { label: 'Chair Pilates Equipment', value: '/images/public/classes/chair-pilates.png' },
];

export { contentFailure };

export function PublicContentManagementView() {
  const session = useSessionContext()?.session;
  const [activeTab, setActiveTab] = useState<'slider' | 'faq' | 'all'>('slider');
  const [items, setItems] = useState<any[]>();
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [busy, setBusy] = useState(false);

  // Slider State
  const [sliderConfig, setSliderConfig] = useState<HeroCarouselPayload>({
    autoplay: true,
    intervalMs: 6000,
    slides: [],
  });
  const [editingSlide, setEditingSlide] = useState<HeroSlideItem | null>(null);
  const [showSlideForm, setShowSlideForm] = useState(false);

  // Image Upload State
  const [uploadingImage, setUploadingImage] = useState(false);
  const [draftId, setDraftId] = useState<string | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string>('');
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(() => {
    return request('/public-content-management')
      .then((data: any[]) => {
        setItems(data);
        // Editor memuat draf terbaru bila ada, kalau tidak versi yang sedang terbit.
        const heroItems = data.filter((item) => item.contentKey === 'HOME_HERO_CAROUSEL');
        const draftHero = heroItems.find((item) => item.status === 'DRAFT');
        const latestHero =
          draftHero || heroItems.find((item) => item.status === 'PUBLISHED') || heroItems[0];
        setDraftId(draftHero?.id ?? null);

        if (latestHero && latestHero.payload?.slides) {
          setSliderConfig({
            autoplay: latestHero.payload.autoplay ?? true,
            intervalMs: latestHero.payload.intervalMs ?? 6000,
            slides: latestHero.payload.slides ?? [],
          });
        }
      })
      .catch(() => setError('Konten publik belum dapat dimuat.'));
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  // Handle Image File Upload (Manual / Custom)
  async function handleFileUpload(file: File) {
    if (!file) return;

    // Validate type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError('Format file tidak didukung. Harap pilih gambar bertipe JPG, PNG, atau WEBP.');
      return;
    }

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Ukuran file terlalu besar. Maksimal ukuran gambar adalah 5 MB.');
      return;
    }

    setUploadingImage(true);
    setError('');

    try {
      // Read file as Base64
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64Data = reader.result as string;
          const uploadRes = await request('/public-content-management/media-uploads', {
            method: 'POST',
            body: JSON.stringify({
              filename: file.name,
              mimeType: file.type,
              contentBase64: base64Data,
            }),
          });

          if (uploadRes?.url) {
            setImagePreviewUrl(uploadRes.url);
            const input = document.getElementById('slideImageSrcInput') as HTMLInputElement;
            if (input) input.value = uploadRes.url;
            setSuccessMessage('Gambar custom berhasil diunggah!');
          }
        } catch {
          setError('Gagal mengunggah file gambar ke server.');
        } finally {
          setUploadingImage(false);
        }
      };
      reader.onerror = () => {
        setError('Gagal membaca file gambar lokal.');
        setUploadingImage(false);
      };
      reader.readAsDataURL(file);
    } catch {
      setError('Terjadi kesalahan saat memproses gambar.');
      setUploadingImage(false);
    }
  }

  // Save / Publish Slider
  async function saveSlider(shouldPublish = true) {
    setBusy(true);
    setError('');
    setSuccessMessage('');
    try {
      // Draf yang sudah ada diperbarui; bila belum ada (atau sudah terbit) dibuat draf versi baru.
      const saved = draftId
        ? await request(`/public-content-management/${draftId}`, {
            method: 'PATCH',
            body: JSON.stringify({ payload: sliderConfig }),
          })
        : await request('/public-content-management', {
            method: 'POST',
            body: JSON.stringify({
              contentKey: 'HOME_HERO_CAROUSEL',
              kind: 'HERO_CAROUSEL',
              payload: sliderConfig,
            }),
          });

      if (shouldPublish && saved?.id) {
        await request(`/public-content-management/${saved.id}/PUBLISHED`, { method: 'POST' });
        setSuccessMessage(
          'Slider beranda berhasil dipublikasikan. Halaman utama memperbarui tampilannya dalam beberapa menit (cache situs).',
        );
      } else {
        setSuccessMessage('Draft slider berhasil disimpan.');
      }

      await load();
    } catch (cause) {
      setError(contentFailure(cause, 'Gagal menyimpan konfigurasi slider.'));
    } finally {
      setBusy(false);
    }
  }

  // Slide CRUD helpers
  function moveSlide(index: number, direction: 'up' | 'down') {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sliderConfig.slides.length) return;

    const newSlides = [...sliderConfig.slides];
    const temp = newSlides[index]!;
    newSlides[index] = newSlides[targetIndex]!;
    newSlides[targetIndex] = temp;

    // re-assign orders
    const updated = newSlides.map((s, i) => ({ ...s, order: i + 1 }));
    setSliderConfig((prev) => ({ ...prev, slides: updated }));
  }

  function toggleSlideActive(index: number) {
    const updated = sliderConfig.slides.map((s, i) =>
      i === index ? { ...s, active: !s.active } : s,
    );
    setSliderConfig((prev) => ({ ...prev, slides: updated }));
  }

  function deleteSlide(index: number) {
    if (!confirm('Hapus slide ini dari slider?')) return;
    const updated = sliderConfig.slides
      .filter((_, i) => i !== index)
      .map((s, i) => ({ ...s, order: i + 1 }));
    setSliderConfig((prev) => ({ ...prev, slides: updated }));
  }

  function openCreateForm() {
    setEditingSlide(null);
    setImagePreviewUrl('/images/public/landing/hero-pilates.png');
    setShowSlideForm(true);
  }

  function openEditForm(slide: HeroSlideItem) {
    setEditingSlide(slide);
    setImagePreviewUrl(slide.imageSrc || '/images/public/landing/hero-pilates.png');
    setShowSlideForm(true);
  }

  function saveSlideEdit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const d = new FormData(e.currentTarget);
    const id = editingSlide?.id || `slide-${Date.now()}`;
    const newSlide: HeroSlideItem = {
      id,
      badge: String(d.get('badge') || '').trim() || undefined,
      title: String(d.get('title') || '').trim(),
      highlightTitle: String(d.get('highlightTitle') || '').trim() || undefined,
      description: String(d.get('description') || '').trim(),
      imageSrc: String(d.get('imageSrc') || '').trim() || '/images/public/landing/hero-pilates.png',
      primaryCta: d.get('primaryCtaLabel')
        ? {
            label: String(d.get('primaryCtaLabel')),
            href: String(d.get('primaryCtaHref') || '/classes#schedule'),
          }
        : undefined,
      secondaryCta: d.get('secondaryCtaLabel')
        ? {
            label: String(d.get('secondaryCtaLabel')),
            href: String(d.get('secondaryCtaHref') || '/packages'),
          }
        : undefined,
      active: editingSlide ? editingSlide.active : true,
      order: editingSlide ? editingSlide.order : sliderConfig.slides.length + 1,
    };

    if (editingSlide) {
      setSliderConfig((prev) => ({
        ...prev,
        slides: prev.slides.map((s) => (s.id === id ? newSlide : s)),
      }));
    } else {
      setSliderConfig((prev) => ({
        ...prev,
        slides: [...prev.slides, newSlide],
      }));
    }

    setEditingSlide(null);
    setShowSlideForm(false);
  }

  // Salin versi mana pun menjadi draf baru, lalu muat ke editor.
  async function duplicate(id: string, contentKey?: string) {
    setBusy(true);
    setError('');
    try {
      await request(`/public-content-management/${id}/duplicate`, { method: 'POST' });
      await load();
      setActiveTab(contentKey === 'CLASS_DETAIL_FAQ' ? 'faq' : 'slider');
      setSuccessMessage('Draf baru dibuat dari versi tersebut dan dimuat ke editor.');
    } catch (cause) {
      setError(contentFailure(cause, 'Draf belum dapat dibuat.'));
    } finally {
      setBusy(false);
    }
  }

  async function transition(id: string, status: 'PUBLISHED' | 'ARCHIVED') {
    setBusy(true);
    setError('');
    try {
      await request(`/public-content-management/${id}/${status}`, { method: 'POST' });
      await load();
      setSuccessMessage(
        status === 'PUBLISHED' ? 'Versi konten dipublikasikan.' : 'Versi konten diarsipkan.',
      );
    } catch (cause) {
      setError(contentFailure(cause, 'Status konten belum dapat diubah.'));
    } finally {
      setBusy(false);
    }
  }

  if (!items) {
    return error ? (
      <Feedback kind="error">{error}</Feedback>
    ) : (
      <Skeleton label="Memuat Manajemen Konten Publik" />
    );
  }

  return (
    <main className="space-y-6" aria-labelledby="content-mgmt-title">
      <div className="space-y-4">
        <AdminPageHeader
          title="Manajemen Konten Publik"
          description="Kelola banner carousel beranda dan gambar promosi Daily Dose Pilates. Setiap perubahan disimpan sebagai versi dan tampil di situs setelah dipublikasikan."
          titleId="content-mgmt-title"
          actions={
            <ButtonLink href="/" target="_blank" variant="secondary" className="inline-flex items-center gap-1.5">
              <span>Lihat Halaman Utama</span>
              <ExternalLink className="size-3.5" />
            </ButtonLink>
          }
        />

        {/* Tab Switcher */}
        <div className="flex flex-wrap gap-2 border-b border-dd-line/70 pb-3">
          <button
            type="button"
            onClick={() => setActiveTab('slider')}
            className={`flex items-center gap-2 rounded-dd-md px-4 py-2 text-xs font-bold transition ${
              activeTab === 'slider'
                ? 'bg-dd-forest text-white shadow-sm'
                : 'bg-dd-surface-muted text-dd-ink hover:bg-dd-line/50'
            }`}
          >
            <Sliders className="size-4" />
            Hero Carousel Beranda ({sliderConfig.slides.length} Slide)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('faq')}
            className={`flex items-center gap-2 rounded-dd-md px-4 py-2 text-xs font-bold transition ${
              activeTab === 'faq'
                ? 'bg-dd-forest text-white shadow-sm'
                : 'bg-dd-surface-muted text-dd-ink hover:bg-dd-line/50'
            }`}
          >
            <HelpCircle className="size-4" />
            FAQ Halaman Kelas
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`flex items-center gap-2 rounded-dd-md px-4 py-2 text-xs font-bold transition ${
              activeTab === 'all'
                ? 'bg-dd-forest text-white shadow-sm'
                : 'bg-dd-surface-muted text-dd-ink hover:bg-dd-line/50'
            }`}
          >
            <Layers className="size-4" />
            Riwayat Versi Konten ({items.length})
          </button>
        </div>
      </div>

      {error && <Feedback kind="error">{error}</Feedback>}
      {successMessage && <Feedback kind="status">{successMessage}</Feedback>}

      {/* TAB 1: HERO CAROUSEL VISUAL BUILDER */}
      {activeTab === 'slider' && (
        <section className="space-y-6">
          {/* Slider Global Settings Card */}
          <div className="rounded-dd-xl border border-dd-line bg-white p-6 shadow-dd-card">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-dd-line/60 pb-4">
              <div>
                <h2 className="text-lg font-bold text-dd-ink">Pengaturan Slider Beranda</h2>
                <p className="mt-0.5 text-xs text-dd-muted">
                  Atur waktu rotasi banner otomatis dan kelola slide yang aktif di halaman depan.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="secondary"
                  disabled={busy}
                  onClick={() => void saveSlider(false)}
                >
                  Simpan Draft
                </Button>
                <Button disabled={busy} loading={busy} onClick={() => void saveSlider(true)}>
                  Publikasikan ke Website
                </Button>
              </div>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <label className="flex items-center gap-3 rounded-dd-lg border border-dd-line bg-dd-surface-muted p-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={sliderConfig.autoplay}
                  onChange={(e) =>
                    setSliderConfig((prev) => ({ ...prev, autoplay: e.target.checked }))
                  }
                  className="size-4 rounded text-dd-forest focus:ring-dd-forest"
                />
                <div>
                  <span className="block text-xs font-bold text-dd-ink">Auto-play Aktif</span>
                  <span className="text-[11px] text-dd-muted">Slide berganti otomatis</span>
                </div>
              </label>

              <div>
                <label className="block text-xs font-semibold text-dd-forest uppercase tracking-wider mb-1">
                  Durasi Tiap Slide (Detik)
                </label>
                <select
                  value={sliderConfig.intervalMs / 1000}
                  onChange={(e) =>
                    setSliderConfig((prev) => ({
                      ...prev,
                      intervalMs: Number(e.target.value) * 1000,
                    }))
                  }
                  className={field}
                >
                  <option value={3}>3 Detik (Cepat)</option>
                  <option value={4}>4 Detik</option>
                  <option value={5}>5 Detik (Ideal)</option>
                  <option value={6}>6 Detik (Standar)</option>
                  <option value={8}>8 Detik (Santai)</option>
                  <option value={10}>10 Detik</option>
                </select>
              </div>

              <div className="flex items-center justify-between rounded-dd-lg border border-dd-line bg-dd-surface-muted p-3">
                <span className="text-xs text-dd-muted">Slide Aktif Ditampilkan:</span>
                <span className="text-sm font-bold text-dd-forest">
                  {sliderConfig.slides.filter((s) => s.active).length} dari{' '}
                  {sliderConfig.slides.length} Slide
                </span>
              </div>
            </div>
          </div>

          {/* Slide List & Management */}
          <div className="rounded-dd-xl border border-dd-line bg-white p-6 shadow-dd-card">
            <div className="flex items-center justify-between border-b border-dd-line/60 pb-4">
              <div>
                <h3 className="text-base font-bold text-dd-ink">Daftar Slide Banner</h3>
                <p className="mt-0.5 text-xs text-dd-muted">
                  Gunakan tombol panah untuk mengatur urutan tampilan di beranda.
                </p>
              </div>
              {!showSlideForm && (
                <Button size="sm" onClick={openCreateForm} leadingIcon={<Plus className="size-4" />}>
                  Tambah Slide Baru
                </Button>
              )}
            </div>

            {/* Slide Editor Form */}
            {showSlideForm && (
              <form
                onSubmit={saveSlideEdit}
                className="mt-6 space-y-5 rounded-dd-xl border-2 border-dd-forest/30 bg-dd-cream/30 p-6 animate-fade-in"
              >
                <div className="flex items-center justify-between border-b border-dd-line/60 pb-3">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="size-5 text-dd-forest" />
                    <strong className="text-base font-bold text-dd-forest">
                      {editingSlide ? 'Edit Slide Banner' : 'Tambah Slide Baru'}
                    </strong>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setShowSlideForm(false);
                      setEditingSlide(null);
                    }}
                    className="rounded p-1 text-dd-muted hover:bg-dd-line/50 hover:text-dd-ink transition"
                  >
                    <X className="size-5" />
                  </button>
                </div>

                {/* 1. UPLOAD IMAGE MANUAL / CUSTOM DROPZONE */}
                <div className="rounded-dd-lg border border-dashed border-dd-forest/40 bg-white p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-dd-forest uppercase tracking-wider flex items-center gap-1.5">
                      <Upload className="size-3.5 text-dd-forest" />
                      Unggah Gambar Kustom / Manual (Dari Laptop/HP)
                    </span>
                    <span className="text-[11px] text-dd-muted">Format: JPG, PNG, WEBP · Maks: 5 MB</span>
                  </div>

                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragOver(true);
                    }}
                    onDragLeave={() => setIsDragOver(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDragOver(false);
                      const file = e.dataTransfer.files?.[0];
                      if (file) void handleFileUpload(file);
                    }}
                    className={`flex flex-col sm:flex-row items-center justify-between gap-4 rounded-dd-md border p-4 transition ${
                      isDragOver
                        ? 'border-dd-forest bg-dd-forest/10 scale-[0.99]'
                        : 'border-dd-line bg-dd-surface-muted/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative size-16 shrink-0 overflow-hidden rounded-dd-md border border-dd-line bg-stone-200 shadow-sm">
                        {imagePreviewUrl ? (
                          <Image
                            src={imagePreviewUrl}
                            fill
                            sizes="64px"
                            alt="Preview banner"
                            className="object-cover"
                          />
                        ) : (
                          <div className="grid size-full place-items-center text-stone-400">
                            <FileImage className="size-6" />
                          </div>
                        )}
                      </div>
                      <div>
                        <strong className="block text-xs font-bold text-dd-ink">
                          {uploadingImage
                            ? 'Sedang mengunggah gambar...'
                            : imagePreviewUrl
                              ? 'Foto banner siap digunakan'
                              : 'Tarik & lepas file gambar ke sini'}
                        </strong>
                        <p className="text-[11px] text-dd-muted">
                          Rekomendasi rasio horizontal 16:9 atau foto studio resolusi tajam
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) void handleFileUpload(file);
                        }}
                      />
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        disabled={uploadingImage}
                        loading={uploadingImage}
                        leadingIcon={<Upload className="size-3.5" />}
                        onClick={() => fileInputRef.current?.click()}
                      >
                        {uploadingImage ? 'Mengunggah...' : 'Pilih File dari Komputer'}
                      </Button>
                    </div>
                  </div>
                </div>

                {/* 2. PRESET IMAGE SELECTOR & PATH INPUT */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold text-dd-forest uppercase tracking-wider mb-1">
                      Atau Pilih Preset Gambar Studio
                    </label>
                    <select
                      name="imagePreset"
                      className={field}
                      onChange={(e) => {
                        if (e.target.value) {
                          const input = document.getElementById(
                            'slideImageSrcInput',
                          ) as HTMLInputElement;
                          if (input) input.value = e.target.value;
                          setImagePreviewUrl(e.target.value);
                        }
                      }}
                    >
                      <option value="">-- Pilih dari Preset Studio --</option>
                      {PRESET_IMAGES.map((p) => (
                        <option key={p.value} value={p.value}>
                          {p.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-dd-forest uppercase tracking-wider mb-1">
                      Badge / Tag Promosi (Opsional)
                    </label>
                    <input
                      name="badge"
                      defaultValue={editingSlide?.badge ?? ''}
                      placeholder="Contoh: Promo Spesial Member Baru"
                      className={field}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-dd-forest uppercase tracking-wider mb-1">
                    Path / URL Gambar Terpilih *
                  </label>
                  <input
                    id="slideImageSrcInput"
                    name="imageSrc"
                    required
                    value={imagePreviewUrl}
                    onChange={(e) => setImagePreviewUrl(e.target.value)}
                    placeholder="/images/public/... atau URL gambar"
                    className={field}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold text-dd-forest uppercase tracking-wider mb-1">
                      Judul Utama *
                    </label>
                    <input
                      name="title"
                      required
                      defaultValue={editingSlide?.title ?? ''}
                      placeholder="Contoh: Stronger Body."
                      className={field}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-dd-forest uppercase tracking-wider mb-1">
                      Judul Highlight (Aksen Hijau)
                    </label>
                    <input
                      name="highlightTitle"
                      defaultValue={editingSlide?.highlightTitle ?? ''}
                      placeholder="Contoh: Calmer Mind."
                      className={field}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-dd-forest uppercase tracking-wider mb-1">
                    Deskripsi Ringkas *
                  </label>
                  <textarea
                    name="description"
                    required
                    rows={2}
                    defaultValue={editingSlide?.description ?? ''}
                    placeholder="Tuliskan deskripsi penawaran atau informasi kelas..."
                    className={field}
                  />
                </div>

                {/* CTAs */}
                <div className="grid gap-4 sm:grid-cols-2 pt-2 border-t border-dd-line/60">
                  <div className="space-y-2">
                    <span className="block text-xs font-bold text-dd-ink">Tombol Aksi Utama</span>
                    <input
                      name="primaryCtaLabel"
                      defaultValue={editingSlide?.primaryCta?.label ?? 'Lihat Jadwal'}
                      placeholder="Teks Tombol (cth: Lihat Jadwal)"
                      className={field}
                    />
                    <input
                      name="primaryCtaHref"
                      defaultValue={editingSlide?.primaryCta?.href ?? '/classes#schedule'}
                      placeholder="URL Tujuan (cth: /classes#schedule)"
                      className={field}
                    />
                  </div>

                  <div className="space-y-2">
                    <span className="block text-xs font-bold text-dd-ink">Tombol Aksi Sekunder</span>
                    <input
                      name="secondaryCtaLabel"
                      defaultValue={editingSlide?.secondaryCta?.label ?? 'Lihat Paket'}
                      placeholder="Teks Tombol (cth: Lihat Paket)"
                      className={field}
                    />
                    <input
                      name="secondaryCtaHref"
                      defaultValue={editingSlide?.secondaryCta?.href ?? '/packages'}
                      placeholder="URL Tujuan (cth: /packages)"
                      className={field}
                    />
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 pt-3">
                  <Button type="submit">
                    {editingSlide ? 'Simpan Perubahan Slide' : 'Tambahkan Slide'}
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      setShowSlideForm(false);
                      setEditingSlide(null);
                    }}
                  >
                    Batal
                  </Button>
                </div>
              </form>
            )}

            {/* Slides List */}
            <div className="mt-5 space-y-3">
              {sliderConfig.slides.length === 0 ? (
                <div className="rounded-dd-lg border border-dd-line bg-dd-surface-muted p-8 text-center text-sm text-dd-muted">
                  Belum ada slide banner yang ditambahkan. Klik tombol &quot;Tambah Slide Baru&quot; di atas.
                </div>
              ) : (
                sliderConfig.slides.map((slide, index) => (
                  <article
                    key={slide.id || index}
                    className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-dd-xl border p-4 transition ${
                      slide.active
                        ? 'border-dd-line bg-white shadow-sm'
                        : 'border-dashed border-dd-line/80 bg-stone-50 opacity-70'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      {/* Order indicator */}
                      <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-dd-forest text-xs font-bold text-white">
                        {index + 1}
                      </span>

                      {/* Thumbnail Preview */}
                      <div className="relative size-16 shrink-0 overflow-hidden rounded-dd-md border border-dd-line bg-stone-200">
                        <Image
                          src={slide.imageSrc || '/images/public/landing/hero-pilates.png'}
                          fill
                          sizes="64px"
                          alt={slide.title}
                          className="object-cover"
                        />
                      </div>

                      {/* Info */}
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          {slide.badge && (
                            <span className="rounded bg-dd-forest/10 px-2 py-0.5 text-[10px] font-bold text-dd-forest uppercase">
                              {slide.badge}
                            </span>
                          )}
                          <strong className="text-sm font-bold text-dd-ink">
                            {slide.title} {slide.highlightTitle}
                          </strong>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                              slide.active
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-stone-200 text-stone-600'
                            }`}
                          >
                            {slide.active ? 'Aktif' : 'Nonaktif'}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-dd-muted line-clamp-1 max-w-lg">
                          {slide.description}
                        </p>
                        <div className="mt-1.5 flex items-center gap-3 text-[11px] text-dd-muted">
                          <span>
                            Tombol 1:{' '}
                            <strong className="text-dd-ink">{slide.primaryCta?.label || '-'}</strong>
                          </span>
                          <span>•</span>
                          <span>
                            Tombol 2:{' '}
                            <strong className="text-dd-ink">{slide.secondaryCta?.label || '-'}</strong>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex shrink-0 flex-wrap items-center gap-1.5 self-end sm:self-center">
                      <button
                        type="button"
                        disabled={index === 0}
                        onClick={() => moveSlide(index, 'up')}
                        aria-label="Geser ke atas"
                        className="rounded p-1.5 text-dd-muted hover:bg-dd-surface-muted hover:text-dd-ink disabled:opacity-30"
                      >
                        <ArrowUp className="size-4" />
                      </button>
                      <button
                        type="button"
                        disabled={index === sliderConfig.slides.length - 1}
                        onClick={() => moveSlide(index, 'down')}
                        aria-label="Geser ke bawah"
                        className="rounded p-1.5 text-dd-muted hover:bg-dd-surface-muted hover:text-dd-ink disabled:opacity-30"
                      >
                        <ArrowDown className="size-4" />
                      </button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => toggleSlideActive(index)}
                      >
                        {slide.active ? 'Nonaktifkan' : 'Aktifkan'}
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => openEditForm(slide)}
                      >
                        Edit
                      </Button>
                      <button
                        type="button"
                        onClick={() => deleteSlide(index)}
                        aria-label="Hapus slide"
                        className="rounded p-1.5 text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </article>
                ))
              )}
            </div>
          </div>
        </section>
      )}

      {activeTab === 'faq' && (
        <FaqEditor
          items={items}
          onChanged={load}
          onMessage={(message) => {
            setError('');
            setSuccessMessage(message);
          }}
          onError={(message) => {
            setSuccessMessage('');
            setError(message);
          }}
        />
      )}

      {/* TAB 2: RAW / ADVANCED ALL CONTENT ENTRIES */}
      {activeTab === 'all' && (
        <section className="space-y-6">
          <div className="rounded-dd-xl border border-dd-line bg-white p-5 shadow-dd-card">
            <h3 className="text-sm font-bold text-dd-ink mb-1">Riwayat & Status Versi</h3>
            <p className="mb-3 text-xs text-dd-muted">
              Hanya versi berstatus Terbit yang tampil di situs. Versi lama dapat disalin menjadi
              draf baru untuk diedit; versi terbit tidak diubah langsung.
            </p>
            {items.length === 0 && (
              <p className="text-sm text-dd-muted">Belum ada versi konten tersimpan.</p>
            )}
            <ul className="divide-y divide-dd-line">
              {items.map((item) => (
                <li key={item.id} className="flex flex-wrap justify-between gap-3 py-3.5 text-sm">
                  <div>
                    <strong className="text-dd-ink">
                      {item.contentKey === 'CLASS_DETAIL_FAQ' ? 'FAQ halaman kelas' : 'Slider beranda'} ·
                      versi {item.version}
                    </strong>
                    <div className="text-xs text-dd-muted mt-0.5">
                      {item.contentKey === 'CLASS_DETAIL_FAQ'
                        ? `${item.payload?.items?.length ?? 0} pertanyaan`
                        : `${item.payload?.slides?.length ?? 0} slide`}{' '}
                      · diperbarui{' '}
                      {new Date(item.updatedAt).toLocaleString('id-ID')}
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <StatusBadge
                      tone={
                        item.status === 'PUBLISHED'
                          ? 'success'
                          : item.status === 'DRAFT'
                            ? 'warning'
                            : 'neutral'
                      }
                    >
                      {item.status === 'PUBLISHED'
                        ? 'Terbit'
                        : item.status === 'DRAFT'
                          ? 'Draf'
                          : 'Diarsipkan'}
                    </StatusBadge>
                    {item.status === 'DRAFT' && (
                      <Button
                        size="sm"
                        disabled={busy}
                        onClick={() => void transition(item.id, 'PUBLISHED')}
                      >
                        Terbitkan
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="secondary"
                      disabled={busy}
                      onClick={() => void duplicate(item.id, item.contentKey)}
                    >
                      Salin jadi draf
                    </Button>
                    {item.status !== 'ARCHIVED' && (
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={busy}
                        onClick={() => void transition(item.id, 'ARCHIVED')}
                      >
                        Arsipkan
                      </Button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </main>
  );
}
