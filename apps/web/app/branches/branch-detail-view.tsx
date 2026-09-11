'use client';

import { ArrowLeft, ExternalLink, Pencil, Plus, Power, PowerOff } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button, ButtonLink } from '../components/actions';
import { AlertBanner, Drawer, useAppFeedback } from '../components/app-feedback';
import { Badge, Panel, StatCard } from '../components/admin/admin-ui';
import { TextInput } from '../components/forms';
import { useSessionContext } from '../session-context';
import { browserBranchClient, type BranchManagementDetail } from '@/api-clients/branch-client';
import { PageHeader, Skeleton } from '../ui';
import { BranchPaymentAccountsPanel } from './branch-payment-accounts-panel';
import { BranchVenuesPanel } from './branch-venues-panel';
import { BranchPublicProfileDrawer } from './branch-public-profile-drawer';

const auditLabels: Record<string, string> = {
  'master.branch_created': 'Cabang dibuat',
  'master.branch_updated': 'Informasi cabang diperbarui',
  'master.branch_deactivated': 'Cabang dinonaktifkan',
  'master.branch_reactivated': 'Cabang diaktifkan kembali',
  'master.public_branch_profile_updated': 'Profil publik diperbarui',
};

export function BranchDetailView({ id }: { id: string }) {
  const session = useSessionContext();
  const feedback = useAppFeedback();
  const [branch, setBranch] = useState<BranchManagementDetail | null>(null);
  const [failure, setFailure] = useState('');
  const [editorOpen, setEditorOpen] = useState(false);
  const [publicProfileOpen, setPublicProfileOpen] = useState(false);
  const [editDirty, setEditDirty] = useState(false);
  const [busy, setBusy] = useState(false);
  const canRead =
    session?.status === 'authenticated' && session.hasCapability('master:read', 'master:manage');
  const canManage = session?.status === 'authenticated' && session.hasCapability('master:manage');
  const confirmDiscardEdit = () =>
    feedback.confirm({
      tone: 'warning',
      title: 'Batalkan perubahan cabang?',
      message: 'Perubahan yang belum disimpan akan hilang.',
      confirmLabel: 'Buang perubahan',
    });
  const closeEdit = async () => {
    if (!editDirty || (await confirmDiscardEdit())) {
      setEditDirty(false);
      setEditorOpen(false);
    }
  };
  const load = () =>
    browserBranchClient
      .detail(id)
      .then(setBranch)
      .catch(() => setFailure('Detail cabang tidak dapat dimuat atau berada di luar scope Anda.'));

  useEffect(() => {
    if (canRead) void load();
  }, [canRead, id]);
  if (!session || session.status === 'loading') return <Skeleton label="Memuat detail cabang" />;
  if (!canRead)
    return (
      <AlertBanner
        tone="danger"
        title="Akses cabang tidak tersedia"
        message="Akun Anda tidak memiliki capability untuk membaca Branch Management."
      />
    );
  if (failure) return <AlertBanner tone="danger" title="Cabang tidak tersedia" message={failure} />;
  if (!branch) return <Skeleton label="Memuat detail cabang" />;

  const blockingDependencies =
    branch.dependencies.assignments +
    branch.dependencies.futureClasses +
    branch.dependencies.packages +
    branch.dependencies.paymentAccounts;

  const transition = async () => {
    const action = branch.active ? 'deactivate' : 'reactivate';
    const reason = branch.active
      ? 'Menonaktifkan cabang melalui Branch Management'
      : 'Mengaktifkan kembali cabang melalui Branch Management';
    const accepted = await feedback.confirm({
      tone: branch.active ? 'danger' : 'warning',
      title: branch.active ? 'Nonaktifkan cabang?' : 'Aktifkan kembali cabang?',
      message: branch.active
        ? blockingDependencies
          ? `Terdapat ${blockingDependencies} dependency operasional aktif. Selesaikan dependency sebelum menonaktifkan cabang.`
          : 'Cabang tidak lagi tersedia untuk operasi dan katalog baru.'
        : 'Cabang akan kembali tersedia untuk konfigurasi dan operasi baru.',
      confirmLabel: branch.active ? 'Nonaktifkan' : 'Aktifkan kembali',
    });
    if (!accepted) return;
    setBusy(true);
    try {
      await browserBranchClient.transition(branch.id, action, {
        expectedVersion: branch.version,
        reason,
      });
      await load();
      feedback.showToast({
        tone: 'success',
        title: 'Status cabang diperbarui',
        message: 'Perubahan tercatat pada audit trail.',
      });
    } catch {
      feedback.showAlert({
        tone: 'danger',
        title: 'Status belum berubah',
        message: branch.active
          ? 'Cabang masih memiliki dependency aktif atau datanya telah berubah.'
          : 'Konfigurasi cabang belum valid atau datanya telah berubah.',
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="grid gap-5" aria-labelledby="branch-title">
      <ButtonLink
        href="/workspace/branches"
        variant="ghost"
        size="sm"
        leadingIcon={<ArrowLeft className="size-4" aria-hidden="true" />}
        className="w-fit"
      >
        Kembali ke cabang
      </ButtonLink>
      <PageHeader
        eyebrow="Manajemen Cabang"
        title={branch.name}
        titleId="branch-title"
        description={`${branch.code} · ${branch.timezone}`}
        context={
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={branch.active ? 'success' : 'neutral'}>
              {branch.active ? 'Aktif' : 'Tidak aktif'}
            </Badge>
            {canManage && (
              <>
                <Button
                  variant="secondary"
                  leadingIcon={<Pencil className="size-4" aria-hidden="true" />}
                  onClick={() => setEditorOpen(true)}
                >
                  Edit cabang
                </Button>
                <Button
                  variant={branch.active ? 'danger' : 'primary'}
                  leadingIcon={
                    branch.active ? (
                      <PowerOff className="size-4" aria-hidden="true" />
                    ) : (
                      <Power className="size-4" aria-hidden="true" />
                    )
                  }
                  loading={busy}
                  onClick={transition}
                >
                  {branch.active ? 'Nonaktifkan' : 'Aktifkan kembali'}
                </Button>
              </>
            )}
          </div>
        }
      />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Staf aktif" value={String(branch.dependencies.staff)} />
        <StatCard label="Kelas mendatang" value={String(branch.dependencies.futureClasses)} />
        <StatCard label="Paket aktif" value={String(branch.dependencies.packages)} />
        <StatCard label="Rekening aktif" value={String(branch.dependencies.paymentAccounts)} />
      </div>
      {branch.active && blockingDependencies > 0 && (
        <AlertBanner
          tone="warning"
          title="Cabang memiliki dependency aktif"
          message="Assignment, kelas mendatang, paket aktif, dan rekening aktif harus diselesaikan sebelum cabang dapat dinonaktifkan."
        />
      )}
      <div className="grid gap-5 xl:grid-cols-2">
        <Panel className="p-5">
          <h2 className="text-lg font-semibold">Identitas & support</h2>
          <dl className="mt-4 grid gap-4 sm:grid-cols-2">
            <Info label="Kode cabang" value={branch.code} />
            <Info label="Zona waktu" value={branch.timezone} />
            <Info label="WhatsApp support" value={branch.supportWhatsappE164 ?? 'Belum diatur'} />
            <Info label="Versi data" value={String(branch.version)} />
          </dl>
        </Panel>
        <Panel className="p-5">
          <h2 className="text-lg font-semibold">Profil publik</h2>
          {branch.publicProfile ? (
            <div className="mt-4 grid gap-3">
              <p className="text-sm">
                <strong>
                  {branch.publicProfile.area}, {branch.publicProfile.city}
                </strong>
              </p>
              <p className="text-sm leading-6 text-dd-muted">{branch.publicProfile.address}</p>
              <div className="grid gap-1.5 text-xs text-dd-muted">
                {branch.publicProfile.operationalEmail && (
                  <p>
                    <span className="font-semibold text-dd-ink">Email: </span>
                    <a
                      href={`mailto:${branch.publicProfile.operationalEmail}`}
                      className="text-dd-forest hover:underline"
                    >
                      {branch.publicProfile.operationalEmail}
                    </a>
                  </p>
                )}
                {branch.publicProfile.mapUrl && (
                  <p>
                    <span className="font-semibold text-dd-ink">Peta: </span>
                    <a
                      href={branch.publicProfile.mapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-dd-forest hover:underline"
                    >
                      Buka di Google Maps
                      <ExternalLink className="size-3" aria-hidden="true" />
                    </a>
                  </p>
                )}
              </div>
              {canManage && (
                <Button
                  variant="secondary"
                  size="sm"
                  leadingIcon={<Pencil className="size-4" aria-hidden="true" />}
                  className="w-fit mt-1"
                  onClick={() => setPublicProfileOpen(true)}
                >
                  Edit profil publik
                </Button>
              )}
            </div>
          ) : (
            <div className="mt-4">
              <p className="text-sm text-dd-muted">Profil publik cabang belum dilengkapi.</p>
              {canManage && (
                <Button
                  variant="secondary"
                  size="sm"
                  leadingIcon={<Plus className="size-4" aria-hidden="true" />}
                  className="mt-3 w-fit"
                  onClick={() => setPublicProfileOpen(true)}
                >
                  Lengkapi profil publik
                </Button>
              )}
            </div>
          )}
        </Panel>
      </div>

      <BranchPaymentAccountsPanel
        branchId={branch.id}
        canManage={Boolean(canManage)}
        onAccountsChange={(count) =>
          setBranch((current) =>
            current
              ? {
                  ...current,
                  dependencies: { ...current.dependencies, paymentAccounts: count },
                }
              : null,
          )
        }
      />

      <BranchVenuesPanel
        branchId={branch.id}
        canManage={Boolean(canManage)}
      />
      <Panel className="p-5">
        <h2 className="text-lg font-semibold">Dependency operasional</h2>
        <dl className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Info label="Assignment aktif" value={String(branch.dependencies.assignments)} />
          <Info label="Tipe kelas aktif" value={String(branch.dependencies.classTypes)} />
          <Info label="Kelas mendatang" value={String(branch.dependencies.futureClasses)} />
          <Info label="Paket aktif" value={String(branch.dependencies.packages)} />
          <Info label="Rekening aktif" value={String(branch.dependencies.paymentAccounts)} />
          <Info label="Staf terhubung" value={String(branch.dependencies.staff)} />
        </dl>
      </Panel>
      <Panel className="overflow-hidden p-0">
        <div className="border-b border-dd-line px-5 py-4">
          <h2 className="text-lg font-semibold">Aktivitas audit</h2>
        </div>
        {branch.auditActivity.length ? (
          <ul className="divide-y divide-dd-line">
            {branch.auditActivity.map((item) => (
              <li key={item.id} className="flex flex-wrap justify-between gap-2 px-5 py-3 text-sm">
                <span>{auditLabels[item.action] ?? 'Konfigurasi cabang diperbarui'}</span>
                <time className="text-dd-muted">
                  {new Date(item.occurredAt).toLocaleString('id-ID')}
                </time>
              </li>
            ))}
          </ul>
        ) : (
          <p className="p-5 text-sm text-dd-muted">Belum ada aktivitas cabang.</p>
        )}
      </Panel>
      <Drawer
        open={editorOpen}
        title="Edit cabang"
        description="Kode cabang bersifat tetap agar seluruh histori dan relasi tetap konsisten."
        busy={busy}
        dirty={editDirty}
        onDirtyClose={confirmDiscardEdit}
        onClose={() => {
          setEditDirty(false);
          setEditorOpen(false);
        }}
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="secondary" disabled={busy} onClick={() => void closeEdit()}>
              Batal
            </Button>
            <Button type="submit" form="branch-edit-form" loading={busy}>
              Simpan perubahan
            </Button>
          </div>
        }
      >
        <form
          id="branch-edit-form"
          className="grid gap-4"
          onChange={() => setEditDirty(true)}
          onSubmit={async (event) => {
            event.preventDefault();
            const data = new FormData(event.currentTarget);
            const input = {
              name: String(data.get('name')).trim(),
              timezone: String(data.get('timezone')).trim(),
              supportWhatsappE164: String(data.get('supportWhatsappE164')).trim() || null,
              expectedVersion: branch.version,
              reason: String(data.get('reason')).trim(),
            };
            const accepted = await feedback.confirm({
              tone: 'warning',
              title: 'Simpan perubahan cabang?',
              message: 'Nama, timezone, dan nomor support akan digunakan pada operasi berikutnya.',
              confirmLabel: 'Simpan perubahan',
            });
            if (!accepted) return;
            setBusy(true);
            try {
              await browserBranchClient.update(branch.id, input);
              setEditDirty(false);
              setEditorOpen(false);
              await load();
              feedback.showToast({
                tone: 'success',
                title: 'Cabang diperbarui',
                message: 'Perubahan tercatat pada audit trail.',
              });
            } catch {
              feedback.showAlert({
                tone: 'danger',
                title: 'Perubahan belum disimpan',
                message: 'Periksa timezone, nomor WhatsApp, atau muat ulang versi terbaru.',
              });
            } finally {
              setBusy(false);
            }
          }}
        >
          <TextInput label="Kode cabang" value={branch.code} disabled />
          <TextInput name="name" label="Nama cabang" defaultValue={branch.name} required />
          <TextInput name="timezone" label="Zona waktu" defaultValue={branch.timezone} required />
          <TextInput
            name="supportWhatsappE164"
            label="WhatsApp support"
            defaultValue={branch.supportWhatsappE164 ?? ''}
            description="Gunakan format E.164."
          />
          <TextInput name="reason" label="Alasan perubahan" minLength={3} required />
        </form>
      </Drawer>

      <BranchPublicProfileDrawer
        branchId={branch.id}
        branchName={branch.name}
        open={publicProfileOpen}
        onClose={() => setPublicProfileOpen(false)}
        onSaved={() => void load()}
      />
    </section>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-dd-muted">{label}</dt>
      <dd className="mt-1 font-semibold text-dd-ink">{value}</dd>
    </div>
  );
}
