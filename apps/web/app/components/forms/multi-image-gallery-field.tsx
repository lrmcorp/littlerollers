'use client';

import { useState, useRef, useId, type ChangeEvent, type DragEvent } from 'react';
import { Upload, X, Trash2, Plus, Loader2, Image as ImageIcon } from 'lucide-react';
import { resolveImageUrl, uploadImage } from '../../lib/media';

export interface MultiImageGalleryFieldProps {
  name: string;
  label?: string;
  defaultValue?: string[] | string;
  description?: string;
  maxImages?: number;
  onChange?: (keys: string[]) => void;
}

interface GalleryItem {
  id: string;
  key: string;
  uploading?: boolean;
  error?: string;
}

export function MultiImageGalleryField({
  name,
  label = 'Galeri Foto',
  defaultValue = [],
  description = 'Unggah foto-foto galeri suasana studio atau fasilitas.',
  maxImages = 20,
  onChange,
}: MultiImageGalleryFieldProps) {
  const inputId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Normalize defaultValue (can be string[] or newline-separated string)
  const initialKeys = Array.isArray(defaultValue)
    ? defaultValue.filter((k) => typeof k === 'string' && k.trim())
    : typeof defaultValue === 'string'
      ? defaultValue.split('\n').map((s) => s.trim()).filter(Boolean)
      : [];

  const [items, setItems] = useState<GalleryItem[]>(() =>
    initialKeys.map((key, idx) => ({
      id: `init-${idx}-${key}`,
      key,
    })),
  );
  const [isDragging, setIsDragging] = useState(false);
  const [generalError, setGeneralError] = useState('');
  const [showManualKeyInput, setShowManualKeyInput] = useState(false);
  const [manualKeyText, setManualKeyText] = useState('');

  const emitChange = (nextItems: GalleryItem[]) => {
    const keys = nextItems.filter((i) => !i.uploading && i.key).map((i) => i.key);
    onChange?.(keys);
  };

  const handleRemove = (id: string) => {
    const next = items.filter((i) => i.id !== id);
    setItems(next);
    emitChange(next);
  };

  const handleAddFiles = async (files: FileList | File[]) => {
    setGeneralError('');
    const fileArray = Array.from(files);
    if (!fileArray.length) return;

    if (items.length + fileArray.length > maxImages) {
      setGeneralError(`Maksimal ${maxImages} foto dalam galeri.`);
      return;
    }

    // Append pending items
    const newItems: GalleryItem[] = fileArray.map((file, idx) => ({
      id: `upload-${Date.now()}-${idx}`,
      key: '',
      uploading: true,
    }));

    setItems((prev) => [...prev, ...newItems]);

    // Process uploads in parallel
    await Promise.all(
      newItems.map(async (pendingItem, idx) => {
        const file = fileArray[idx];
        if (!file) return;
        const targetId = pendingItem.id;
        try {
          const result = await uploadImage(file);
          setItems((prev) => {
            const updated = prev.map((item) =>
              item.id === targetId
                ? { ...item, key: result.key, uploading: false }
                : item,
            );
            emitChange(updated);
            return updated;
          });
        } catch (err) {
          setItems((prev) =>
            prev.map((item) =>
              item.id === targetId
                ? {
                    ...item,
                    uploading: false,
                    error: err instanceof Error ? err.message : 'Gagal upload',
                  }
                : item,
            ),
          );
        }
      }),
    );
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      void handleAddFiles(e.target.files);
      e.target.value = ''; // reset so same files can be re-selected
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      void handleAddFiles(e.dataTransfer.files);
    }
  };

  const handleAddManualKey = () => {
    const trimmed = manualKeyText.trim();
    if (!trimmed) return;
    const next = [...items, { id: `manual-${Date.now()}`, key: trimmed }];
    setItems(next);
    emitChange(next);
    setManualKeyText('');
  };

  // Valid keys for hidden input value
  const validKeys = items.filter((i) => !i.uploading && i.key).map((i) => i.key);

  return (
    <div className="grid gap-2">
      {/* Hidden input storing newline-separated keys for FormData backward compatibility */}
      <input type="hidden" name={name} value={validKeys.join('\n')} />

      {/* Header */}
      <div className="flex items-center justify-between">
        <label htmlFor={inputId} className="text-sm font-semibold text-dd-ink">
          {label}{' '}
          <span className="text-xs font-normal text-dd-muted">
            ({validKeys.length} foto)
          </span>
        </label>
        <button
          type="button"
          onClick={() => setShowManualKeyInput(!showManualKeyInput)}
          className="text-xs font-medium text-dd-forest hover:underline"
        >
          {showManualKeyInput ? 'Tutup Input Manual' : '+ Input Key Manual'}
        </button>
      </div>

      {description && <p className="text-xs text-dd-muted">{description}</p>}

      {generalError && (
        <p className="text-xs font-medium text-dd-danger bg-dd-danger-soft border border-dd-danger/30 px-3 py-1.5 rounded-dd-md">
          {generalError}
        </p>
      )}

      {/* Manual Key Input Drawer / Form */}
      {showManualKeyInput && (
        <div className="flex gap-2 p-2.5 bg-dd-surface-muted border border-dd-line rounded-dd-lg">
          <input
            type="text"
            value={manualKeyText}
            onChange={(e) => setManualKeyText(e.target.value)}
            placeholder="Masukkan path atau key aset (cth: branches/gallery-1.jpg)..."
            className="flex-1 px-3 py-1.5 text-xs bg-white border border-dd-line rounded-dd-md text-dd-ink focus:outline-none focus:ring-1 focus:ring-dd-forest"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddManualKey();
              }
            }}
          />
          <button
            type="button"
            onClick={handleAddManualKey}
            className="px-3 py-1.5 text-xs font-medium text-white bg-dd-forest rounded-dd-md hover:bg-dd-forest-dark transition"
          >
            Tambah
          </button>
        </div>
      )}

      {/* Gallery Visual Grid */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 p-3 rounded-dd-xl border-2 border-dashed transition-all ${
          isDragging
            ? 'border-dd-forest bg-dd-forest/5'
            : 'border-dd-line bg-dd-surface-muted/50 hover:bg-dd-surface-muted'
        }`}
      >
        {items.map((item, index) => (
          <div
            key={item.id}
            className="group relative aspect-4/3 rounded-dd-lg overflow-hidden bg-dd-surface-muted border border-dd-line flex items-center justify-center transition hover:shadow-dd-soft"
          >
            {item.uploading ? (
              <div className="flex flex-col items-center gap-1.5 p-2 text-center">
                <Loader2 className="size-5 animate-spin text-dd-forest" />
                <span className="text-[10px] font-medium text-dd-muted">Mengunggah…</span>
              </div>
            ) : item.error ? (
              <div className="flex flex-col items-center gap-1 p-2 text-center">
                <X className="size-5 text-dd-danger" />
                <span className="text-[10px] font-medium text-dd-danger line-clamp-2">
                  {item.error}
                </span>
                <button
                  type="button"
                  onClick={() => handleRemove(item.id)}
                  className="text-[10px] text-dd-muted underline mt-1"
                >
                  Hapus
                </button>
              </div>
            ) : (
              <>
                {/* Visual Thumbnail */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={resolveImageUrl(item.key)}
                  alt={`Galeri #${index + 1}`}
                  className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.display = 'none';
                    e.currentTarget.parentElement?.classList.add('bg-dd-warning-soft');
                  }}
                />

                {/* Index badge */}
                <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 text-[10px] font-bold bg-black/60 text-white rounded-md backdrop-blur-xs">
                  #{index + 1}
                </span>

                {/* Action overlay on hover */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-2">
                  <button
                    type="button"
                    onClick={() => handleRemove(item.id)}
                    className="p-1.5 bg-dd-danger text-white rounded-dd-md shadow-sm hover:bg-dd-danger/90 transition transform hover:scale-110"
                    title="Hapus foto ini"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </>
            )}
          </div>
        ))}

        {/* Add / Upload Dropzone Card */}
        {items.length < maxImages && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="group relative aspect-4/3 rounded-dd-lg border border-dashed border-dd-line bg-white hover:border-dd-forest hover:bg-dd-forest/5 flex flex-col items-center justify-center gap-1.5 p-3 text-dd-muted hover:text-dd-forest transition"
          >
            <div className="size-8 rounded-full bg-dd-surface-muted group-hover:bg-dd-forest/10 flex items-center justify-center transition">
              <Plus className="size-4 text-dd-muted group-hover:text-dd-forest" />
            </div>
            <span className="text-xs font-semibold">Tambah Foto</span>
            <span className="text-[10px] text-dd-muted text-center leading-tight">
              Pilih berkas atau seret ke sini
            </span>
          </button>
        )}
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        id={inputId}
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFileInputChange}
      />
    </div>
  );
}
