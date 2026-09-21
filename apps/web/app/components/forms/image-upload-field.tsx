'use client';

import { useState, useRef, useId, type ChangeEvent, type DragEvent } from 'react';
import { Upload, X, RefreshCw, Loader2, Check } from 'lucide-react';
import { resolvePublicImageUrl } from '../../lib/public-image-url';
import { uploadImage, ALLOWED_IMAGE_TYPES, MAX_IMAGE_SIZE_BYTES } from '../../lib/media';
import { controlClassName } from '../forms';

export interface ImageUploadFieldProps {
  name: string;
  label: string;
  defaultValue?: string | null;
  description?: string;
  required?: boolean;
  presetOptions?: Array<{ id: string; label: string }>;
  onChange?: (value: string) => void;
}

const ALLOWED_TYPES = ALLOWED_IMAGE_TYPES as unknown as string[];
const MAX_SIZE_BYTES = MAX_IMAGE_SIZE_BYTES;

export function ImageUploadField({
  name,
  label,
  defaultValue = '',
  description,
  required = false,
  presetOptions,
  onChange,
}: ImageUploadFieldProps) {
  const inputId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [value, setValue] = useState<string>(defaultValue ?? '');
  const [previewError, setPreviewError] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [showManualInput, setShowManualInput] = useState(false);

  const updateValue = (nextVal: string) => {
    setValue(nextVal);
    setPreviewError(false);
    setUploadError('');
    onChange?.(nextVal);
  };

  const handleFileProcess = async (file: File) => {
    setUploading(true);
    setUploadError('');
    setUploadSuccess(false);

    try {
      const result = await uploadImage(file);
      updateValue(result.key);
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 3000);
    } catch (err) {
      setUploadError(
        err instanceof Error
          ? err.message
          : 'Gagal mengunggah foto. Pastikan koneksi dan format berkas sesuai.',
      );
    } finally {
      setUploading(false);
    }
  };

  const onFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      void handleFileProcess(file);
    }
    // Reset file input so selecting the same file triggers change
    e.target.value = '';
  };

  const onDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      void handleFileProcess(file);
    }
  };

  const hasImage = Boolean(value.trim());
  const resolvedUrl = hasImage ? resolvePublicImageUrl(value) : '';

  return (
    <div className="grid gap-2">
      {/* Hidden input for Native Form Submission */}
      <input type="hidden" name={name} value={value} required={required && !hasImage} />

      {/* Hidden native file picker */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={onFileInputChange}
      />

      <div className="flex items-center justify-between">
        <label htmlFor={inputId} className="text-sm font-semibold text-dd-ink">
          {label} {required && <span className="text-dd-danger">*</span>}
        </label>
        <button
          type="button"
          onClick={() => setShowManualInput(!showManualInput)}
          className="text-xs font-medium text-dd-forest hover:underline"
        >
          {showManualInput ? 'Sembunyikan Key Manual' : 'Input Key Manual'}
        </button>
      </div>

      {description && <p className="text-xs text-dd-muted">{description}</p>}

      {/* Image Preview & Dropzone */}
      {hasImage && !previewError ? (
        <div className="relative overflow-hidden rounded-dd-lg border border-dd-line/80 bg-dd-surface-muted">
          <div className="relative h-44 w-full bg-stone-900/5">
            <img
              src={resolvedUrl}
              alt={label}
              className="size-full object-cover object-center"
              onError={() => setPreviewError(true)}
            />
            {uploading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 text-white backdrop-blur-xs">
                <Loader2 className="size-8 animate-spin text-white" />
                <span className="mt-2 text-xs font-medium">Mengunggah foto…</span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between bg-white px-3 py-2 border-t border-dd-line/60">
            <div className="min-w-0 pr-2">
              <p className="truncate text-xs font-mono text-dd-muted" title={value}>
                {value}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                disabled={uploading}
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 rounded-dd-md border border-dd-line px-2.5 py-1 text-xs font-medium text-dd-ink hover:bg-stone-50 transition"
              >
                <RefreshCw className="size-3" /> Ganti
              </button>
              <button
                type="button"
                disabled={uploading}
                onClick={() => updateValue('')}
                className="inline-flex items-center gap-1 rounded-dd-md border border-red-200 px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 transition"
                title="Hapus gambar"
              >
                <X className="size-3.5" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Empty Dropzone */
        <div
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onClick={() => !uploading && fileInputRef.current?.click()}
          className={`group flex cursor-pointer flex-col items-center justify-center rounded-dd-lg border-2 border-dashed p-6 transition ${
            isDragging
              ? 'border-dd-forest bg-dd-forest/5'
              : 'border-dd-line/80 bg-dd-surface-muted hover:border-dd-forest/50 hover:bg-dd-surface-muted/80'
          }`}
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-2 text-dd-forest">
              <Loader2 className="size-8 animate-spin" />
              <p className="text-xs font-medium text-dd-ink">Mengunggah foto…</p>
            </div>
          ) : (
            <>
              <div className="flex size-10 items-center justify-center rounded-full bg-white shadow-2xs group-hover:scale-105 transition">
                <Upload className="size-5 text-dd-forest" />
              </div>
              <p className="mt-2 text-xs font-semibold text-dd-ink">
                Klik untuk unggah atau seret file ke sini
              </p>
              <p className="mt-0.5 text-[11px] text-dd-muted">JPG, PNG, atau WEBP (maks. 5 MB)</p>
            </>
          )}
        </div>
      )}

      {/* Success alert */}
      {uploadSuccess && (
        <p className="flex items-center gap-1 text-xs font-medium text-dd-success">
          <Check className="size-3.5" /> Foto berhasil diunggah!
        </p>
      )}

      {/* Error alert */}
      {uploadError && (
        <p className="text-xs font-medium text-dd-danger">{uploadError}</p>
      )}

      {/* Optional Manual Key & Preset Options */}
      {showManualInput && (
        <div className="mt-1 rounded-dd-md border border-dd-line bg-stone-50/70 p-3 space-y-2">
          <div>
            <label className="text-xs font-semibold text-dd-ink">Key atau URL Aset</label>
            <input
              type="text"
              value={value}
              onChange={(e) => updateValue(e.target.value)}
              placeholder="Contoh: branches/muara-karang.png atau https://…"
              className={`${controlClassName} mt-1 text-xs`}
            />
          </div>

          {presetOptions && presetOptions.length > 0 && (
            <div>
              <label className="text-xs font-semibold text-dd-ink">Atau pilih aset katalog:</label>
              <select
                className={`${controlClassName} mt-1 text-xs`}
                value={presetOptions.some((p) => p.id === value) ? value : ''}
                onChange={(e) => updateValue(e.target.value)}
              >
                <option value="">-- Pilih dari Katalog Aset --</option>
                {presetOptions.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
