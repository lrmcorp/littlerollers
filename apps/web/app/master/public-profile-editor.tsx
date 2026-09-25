'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Button } from '../components/actions';
import { Drawer, useAppFeedback } from '../components/app-feedback';
import { EmptyState, Feedback, StatusBadge } from '../ui';
import { controlClassName, SearchSelect, TextInput } from '../components/forms';
import { resolvePublicImageUrl } from '../lib/public-image-url';

type Editable = Record<string, unknown> & { version: number };
type ProfileData = {
  branch: {
    id: string;
    name: string;
    publicProfile: Editable | null;
    classTypes: Array<{
      code: string;
      name: string;
      packages: Array<{ id: string; name: string; publicProfile: Editable | null }>;
    }>;
  };
  classProfiles: Array<Editable & { code: string; slug: string }>;
  assetKeys: string[];
};

async function request<T>(url: string, init?: RequestInit) {
  const response = await fetch(url, {
    credentials: 'include',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json', ...init?.headers },
    ...init,
  });
  if (!response.ok) throw { response: { status: response.status } };
  return response.json() as Promise<T>;
}

export function PublicProfileEditor({
  branchId,
  canManage,
}: {
  branchId: string;
  canManage: boolean;
}) {
  const [data, setData] = useState<ProfileData | null>(null);
  const [failure, setFailure] = useState('');
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const feedback = useAppFeedback();
  const [selected, setSelected] = useState<{
    kind: 'branch' | 'class' | 'package';
    id: string;
    title: string;
    value: Editable;
  } | null>(null);
  const load = async () => {
    if (!branchId) return setData(null);
    try {
      setFailure('');
      setData(
        await request<ProfileData>(
          `/api/v1/master/public-profiles?branchId=${encodeURIComponent(branchId)}`,
        ),
      );
    } catch {
      setFailure('Profil publik belum dapat dimuat.');
    }
  };
  useEffect(() => {
    void load();
  }, [branchId]);
  if (!branchId)
    return (
      <EmptyState
        title="Pilih cabang"
        description="Profil publik selalu dikelola dalam konteks cabang aktif."
      />
    );
  if (failure) return <Feedback kind="error">{failure}</Feedback>;
  if (!data)
    return (
      <div
        className="h-48 animate-pulse rounded-dd-lg bg-dd-line"
        aria-label="Memuat profil publik"
      />
    );
  const edit = (
    kind: 'branch' | 'class' | 'package',
    id: string,
    title: string,
    value: Editable | null,
  ) => {
    if (value) {
      setDirty(false);
      setSelected({ kind, id, title, value });
    }
  };
  const confirmDiscard = () =>
    feedback.confirm({
      tone: 'warning',
      title: 'Batalkan perubahan profil publik?',
      message: 'Konten yang belum disimpan akan hilang.',
      confirmLabel: 'Buang perubahan',
    });
  const closeEditor = async () => {
    if (!dirty || (await confirmDiscard())) {
      setDirty(false);
      setSelected(null);
    }
  };
  return (
    <section className="rounded-dd-lg border border-dd-line bg-white p-6 shadow-dd-card">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2>Profil Publik</h2>
          <p className="text-dd-muted">
            Konten authoritative untuk halaman detail studio, kelas, dan paket.
          </p>
        </div>
        <StatusBadge tone="info">{data.branch.name}</StatusBadge>
      </div>
      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <article className="rounded-dd-md border border-dd-line p-4">
          <p className="text-xs font-bold text-dd-forest uppercase">Studio</p>
          <h3 className="mt-2 text-lg font-semibold">{data.branch.name}</h3>
          <p className="mt-2 text-sm text-dd-muted">
            {String(data.branch.publicProfile?.description ?? 'Profil belum lengkap')}
          </p>
          <Button
            className="mt-4"
            disabled={!canManage || !data.branch.publicProfile}
            onClick={() =>
              edit('branch', data.branch.id, data.branch.name, data.branch.publicProfile)
            }
          >
            Edit profil
          </Button>
        </article>
        {data.classProfiles.map((profile) => (
          <article className="rounded-dd-md border border-dd-line p-4" key={profile.code}>
            <p className="text-xs font-bold text-dd-forest uppercase">Kelas</p>
            <h3 className="mt-2 text-lg font-semibold">{profile.code}</h3>
            <p className="mt-2 line-clamp-3 text-sm text-dd-muted">{String(profile.summary)}</p>
            <Button
              className="mt-4"
              disabled={!canManage}
              onClick={() => edit('class', profile.code, `Kelas ${profile.code}`, profile)}
            >
              Edit profil
            </Button>
          </article>
        ))}
        {data.branch.classTypes.flatMap((type) =>
          type.packages.map((pkg) => (
            <article className="rounded-dd-md border border-dd-line p-4" key={pkg.id}>
              <p className="text-xs font-bold text-dd-forest uppercase">Paket · {type.name}</p>
              <h3 className="mt-2 text-lg font-semibold">{pkg.name}</h3>
              <p className="mt-2 line-clamp-3 text-sm text-dd-muted">
                {String(pkg.publicProfile?.summary ?? 'Profil belum lengkap')}
              </p>
              <Button
                className="mt-4"
                disabled={!canManage || !pkg.publicProfile}
                onClick={() => edit('package', pkg.id, pkg.name, pkg.publicProfile)}
              >
                Edit profil
              </Button>
            </article>
          )),
        )}
      </div>
      <Drawer
        open={Boolean(selected)}
        title={selected ? `Edit ${selected.title}` : 'Edit profil'}
        busy={saving}
        dirty={dirty}
        onDirtyClose={confirmDiscard}
        onClose={() => {
          setDirty(false);
          setSelected(null);
        }}
        footer={
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="secondary"
              disabled={saving}
              onClick={() => void closeEditor()}
            >
              Batal
            </Button>
            <Button type="submit" form="public-profile-form" loading={saving}>
              Simpan profil publik
            </Button>
          </div>
        }
      >
        {selected && (
          <form
            id="public-profile-form"
            className="grid gap-4"
            onChange={() => setDirty(true)}
            onSubmit={async (event) => {
              event.preventDefault();
              const form = event.currentTarget;
              const formData = new FormData(form);
              const body = profilePayload(selected.kind, formData);
              const reason = String(formData.get('reason'));
              const accepted = await feedback.confirm({
                tone: 'warning',
                title: 'Simpan profil publik?',
                message: 'Konten yang dipublikasikan akan digunakan pada halaman pelanggan.',
                confirmLabel: 'Simpan perubahan',
              });
              if (!accepted) return;
              setSaving(true);
              try {
                await request(
                  `/api/v1/master/public-profiles/${selected.kind}/${encodeURIComponent(selected.id)}`,
                  {
                    method: 'PATCH',
                    body: JSON.stringify({
                      ...body,
                      expectedVersion: selected.value.version,
                      reason,
                    }),
                  },
                );
                setDirty(false);
                setSelected(null);
                await load();
              } catch {
                setFailure('Profil gagal diperbarui. Muat ulang jika versinya telah berubah.');
              } finally {
                setSaving(false);
              }
            }}
          >
            {typeof selected.value.heroImageKey === 'string' && (
              <div className="relative min-h-48 overflow-hidden rounded-dd-lg border border-dd-line">
                <Image
                  src={resolvePublicImageUrl(selected.value.heroImageKey)}
                  alt={`Preview ${selected.title}`}
                  fill
                  sizes="520px"
                  className="object-cover"
                />
              </div>
            )}
            <p className="rounded-dd-md bg-dd-surface-muted p-3 text-sm text-dd-muted">
              Asset gambar hanya dapat menggunakan key yang telah dikurasi:{' '}
              {data.assetKeys.join(', ')}.
            </p>
            <ProfileFields kind={selected.kind} value={selected.value} assetKeys={data.assetKeys} />
            <TextInput
              label="Alasan perubahan"
              name="reason"
              minLength={3}
              required
              placeholder="Jelaskan kebutuhan perubahan konten"
            />
          </form>
        )}
      </Drawer>
    </section>
  );
}

const fieldClass =
  'mt-2 min-h-11 w-full rounded-dd-md border border-dd-line bg-white px-3 py-2 text-sm text-dd-ink outline-none focus:border-dd-forest focus:ring-2 focus:ring-dd-forest/15';

function text(value: unknown) {
  return typeof value === 'string' ? value : '';
}

function lines(value: unknown) {
  return Array.isArray(value) ? value.filter((item) => typeof item === 'string').join('\n') : '';
}

function list(form: FormData, key: string) {
  return String(form.get(key) ?? '')
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean);
}

function profilePayload(kind: 'branch' | 'class' | 'package', form: FormData) {
  if (kind === 'branch')
    return {
      slug: String(form.get('slug')),
      area: String(form.get('area')),
      city: String(form.get('city')),
      address: String(form.get('address')),
      operationalEmail: String(form.get('operationalEmail') ?? '').trim() || null,
      mapUrl: String(form.get('mapUrl') ?? '').trim() || null,
      description: String(form.get('description')),
      arrivalInformation: String(form.get('arrivalInformation')),
      parkingInformation: String(form.get('parkingInformation')),
      openingHours: list(form, 'openingHours'),
      amenities: list(form, 'amenities'),
      heroImageKey: String(form.get('heroImageKey')),
      galleryImageKeys: list(form, 'galleryImageKeys'),
    };
  if (kind === 'class')
    return {
      slug: String(form.get('slug')),
      summary: String(form.get('summary')),
      description: String(form.get('description')),
      level: String(form.get('level')),
      durationMinutes: Number(form.get('durationMinutes')),
      equipment: list(form, 'equipment'),
      benefits: list(form, 'benefits'),
      heroImageKey: String(form.get('heroImageKey')),
    };
  return {
    summary: String(form.get('summary')),
    description: String(form.get('description')),
    highlights: list(form, 'highlights'),
    usageGuidance: String(form.get('usageGuidance')),
    terms: list(form, 'terms'),
  };
}

function Field({
  label,
  name,
  value,
  multiline = false,
  required = true,
}: {
  label: string;
  name: string;
  value: unknown;
  multiline?: boolean;
  required?: boolean;
}) {
  return (
    <label className="text-sm font-semibold text-dd-ink">
      {label}
      {multiline ? (
        <textarea
          className={`${fieldClass} min-h-24 resize-y`}
          name={name}
          defaultValue={text(value)}
          required={required}
        />
      ) : (
        <input className={fieldClass} name={name} defaultValue={text(value)} required={required} />
      )}
    </label>
  );
}

function ListField({
  label,
  name,
  value,
  help,
}: {
  label: string;
  name: string;
  value: unknown;
  help: string;
}) {
  return (
    <label className="text-sm font-semibold text-dd-ink">
      {label}
      <textarea
        className={`${fieldClass} min-h-28 resize-y`}
        name={name}
        defaultValue={lines(value)}
        aria-describedby={`${name}-help`}
        required
      />
      <span className="mt-1 block text-xs font-normal text-dd-muted" id={`${name}-help`}>
        {help}
      </span>
    </label>
  );
}

function AssetField({
  name,
  label,
  value,
  assetKeys,
}: {
  name: string;
  label: string;
  value: unknown;
  assetKeys: string[];
}) {
  return (
    <SearchSelect
      name={name}
      label={label}
      defaultValue={text(value)}
      required
      options={assetKeys.map((key) => ({ id: key, label: key }))}
    />
  );
}

function ProfileFields({
  kind,
  value,
  assetKeys,
}: {
  kind: 'branch' | 'class' | 'package';
  value: Editable;
  assetKeys: string[];
}) {
  if (kind === 'branch')
    return (
      <>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Slug URL" name="slug" value={value.slug} />
          <Field label="Area" name="area" value={value.area} />
          <Field label="Kota" name="city" value={value.city} />
          <Field label="Alamat" name="address" value={value.address} />
          <Field
            label="Email operasional"
            name="operationalEmail"
            value={value.operationalEmail}
            required={false}
          />
          <Field
            label="Tautan Google Maps"
            name="mapUrl"
            value={value.mapUrl}
            required={false}
          />
        </div>
        <Field label="Deskripsi studio" name="description" value={value.description} multiline />
        <Field
          label="Panduan kedatangan"
          name="arrivalInformation"
          value={value.arrivalInformation}
          multiline
        />
        <Field
          label="Informasi parkir"
          name="parkingInformation"
          value={value.parkingInformation}
          multiline
        />
        <ListField
          label="Jam operasional"
          name="openingHours"
          value={value.openingHours}
          help="Satu baris untuk setiap hari atau rentang hari."
        />
        <ListField
          label="Fasilitas"
          name="amenities"
          value={value.amenities}
          help="Satu fasilitas per baris."
        />
        <AssetField
          name="heroImageKey"
          label="Gambar hero"
          value={value.heroImageKey}
          assetKeys={assetKeys}
        />
        <ListField
          label="Galeri gambar"
          name="galleryImageKeys"
          value={value.galleryImageKeys}
          help="Satu asset key per baris; seluruh key divalidasi server."
        />
      </>
    );
  if (kind === 'class')
    return (
      <>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Slug URL" name="slug" value={value.slug} />
          <Field label="Level" name="level" value={value.level} />
          <label className="text-sm font-semibold text-dd-ink">
            Durasi (menit)
            <input
              className={fieldClass}
              name="durationMinutes"
              type="number"
              min={15}
              max={240}
              defaultValue={Number(value.durationMinutes)}
              required
            />
          </label>
          <AssetField
            name="heroImageKey"
            label="Gambar hero"
            value={value.heroImageKey}
            assetKeys={assetKeys}
          />
        </div>
        <Field label="Ringkasan" name="summary" value={value.summary} multiline />
        <Field label="Deskripsi" name="description" value={value.description} multiline />
        <ListField
          label="Peralatan"
          name="equipment"
          value={value.equipment}
          help="Satu peralatan per baris."
        />
        <ListField
          label="Manfaat"
          name="benefits"
          value={value.benefits}
          help="Satu manfaat per baris."
        />
      </>
    );
  return (
    <>
      <Field label="Ringkasan" name="summary" value={value.summary} multiline />
      <Field label="Deskripsi" name="description" value={value.description} multiline />
      <ListField
        label="Highlight"
        name="highlights"
        value={value.highlights}
        help="Satu highlight per baris."
      />
      <Field
        label="Panduan penggunaan"
        name="usageGuidance"
        value={value.usageGuidance}
        multiline
      />
      <ListField
        label="Ketentuan"
        name="terms"
        value={value.terms}
        help="Satu ketentuan per baris."
      />
    </>
  );
}
