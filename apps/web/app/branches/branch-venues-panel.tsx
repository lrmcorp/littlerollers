'use client';

import { useCallback, useEffect, useState } from 'react';
import { Building2, DoorOpen, Pencil, Phone, Plus, Wrench } from 'lucide-react';
import { Badge, Panel } from '../components/admin/admin-ui';
import { Button } from '../components/actions';
import { Drawer, useAppFeedback } from '../components/app-feedback';
import { CheckboxInput, SearchSelect, TextInput } from '../components/forms';
import { EmptyState, Feedback, StatusBadge } from '../ui';
import { browserMasterClient } from '@/api-clients/master-client';
import type { Room, Studio } from '@dailydose/api-client-ts/generated';

export function BranchVenuesPanel({
  branchId,
  canManage,
  onVenuesChange,
}: {
  branchId: string;
  canManage: boolean;
  onVenuesChange?: (studios: Studio[]) => void;
}) {
  const feedback = useAppFeedback();
  const [studios, setStudios] = useState<Studio[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  // Studio Drawer State
  const [studioDrawerOpen, setStudioDrawerOpen] = useState(false);
  const [editingStudio, setEditingStudio] = useState<Studio | null>(null);
  const [studioDirty, setStudioDirty] = useState(false);

  // Room Drawer State
  const [roomDrawerOpen, setRoomDrawerOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<{ studioId: string; room: Room } | null>(null);
  const [targetStudioId, setTargetStudioId] = useState<string>('');
  const [roomDirty, setRoomDirty] = useState(false);

  const loadStudios = useCallback(async () => {
    if (!branchId) return;
    setLoading(true);
    try {
      setError('');
      const data = await browserMasterClient.listStudios(branchId);
      setStudios(data);
      onVenuesChange?.(data);
    } catch {
      setError('Area Studio dan Ruangan belum dapat dimuat.');
    } finally {
      setLoading(false);
    }
  }, [branchId, onVenuesChange]);

  useEffect(() => {
    void loadStudios();
  }, [loadStudios]);

  const activeStudios = studios.filter((s) => s.active);
  const totalRooms = studios.reduce((sum, s) => sum + (s.rooms?.length ?? 0), 0);

  // Handle Studio Submission (Create / Edit)
  const handleStudioSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const name = String(data.get('name')).trim();
    const equipmentText = String(data.get('equipmentText')).trim() || undefined;
    const contactPhoneE164 = String(data.get('contactPhoneE164')).trim() || undefined;
    const active = data.get('active') === 'true' || data.get('active') === 'on';

    setBusy(true);
    setError('');
    try {
      if (editingStudio) {
        await browserMasterClient.updateStudio(editingStudio.id, {
          name,
          equipmentText,
          contactPhoneE164,
          active,
        });
        feedback.showToast({
          tone: 'success',
          title: 'Area Studio diperbarui',
          message: `${name} berhasil disimpan.`,
        });
      } else {
        const code = String(data.get('code')).trim().toUpperCase();
        await browserMasterClient.createStudio(branchId, {
          code,
          name,
          equipmentText,
          contactPhoneE164,
        });
        feedback.showToast({
          tone: 'success',
          title: 'Area Studio ditambahkan',
          message: `${name} (${code}) siap digunakan.`,
        });
      }
      setStudioDirty(false);
      setStudioDrawerOpen(false);
      setEditingStudio(null);
      await loadStudios();
    } catch {
      feedback.showAlert({
        tone: 'danger',
        title: 'Gagal menyimpan Area Studio',
        message: 'Periksa kelengkapan kode atau nomor kontak, lalu coba kembali.',
      });
    } finally {
      setBusy(false);
    }
  };

  // Handle Room Submission (Create / Edit)
  const handleRoomSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const studioId = targetStudioId || String(data.get('studioId'));
    const name = String(data.get('name')).trim();
    const capacityRaw = data.get('capacity');
    const capacity = capacityRaw ? Number(capacityRaw) : undefined;
    const active = data.get('active') === 'true' || data.get('active') === 'on';

    if (!studioId) {
      feedback.showAlert({
        tone: 'warning',
        title: 'Pilih Area Studio',
        message: 'Ruangan wajib berada di dalam satu Area Studio.',
      });
      return;
    }

    setBusy(true);
    setError('');
    try {
      if (editingRoom) {
        await browserMasterClient.updateRoom(editingRoom.room.id, {
          name,
          capacity,
          active,
        });
        feedback.showToast({
          tone: 'success',
          title: 'Ruangan diperbarui',
          message: `${name} berhasil disimpan.`,
        });
      } else {
        const code = String(data.get('code')).trim().toUpperCase();
        await browserMasterClient.createRoom(studioId, {
          code,
          name,
          capacity,
        });
        feedback.showToast({
          tone: 'success',
          title: 'Ruangan ditambahkan',
          message: `${name} (${code}) berhasil dibuat.`,
        });
      }
      setRoomDirty(false);
      setRoomDrawerOpen(false);
      setEditingRoom(null);
      setTargetStudioId('');
      await loadStudios();
    } catch {
      feedback.showAlert({
        tone: 'danger',
        title: 'Gagal menyimpan Ruangan',
        message: 'Periksa kode ruangan atau kapasitas, lalu coba kembali.',
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Panel className="p-5">
      {/* Header Panel */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-dd-line/80 pb-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-semibold text-dd-ink">Area Studio &amp; Ruangan</h2>
            <Badge tone="success">{activeStudios.length} Area Aktif</Badge>
            <Badge tone="neutral">{totalRooms} Ruangan</Badge>
          </div>
          <p className="mt-1 text-sm text-dd-muted">
            Kelola area latihan fisik dan pembagian ruangan reformer pada studio/cabang ini secara langsung.
          </p>
        </div>
        {canManage && (
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              leadingIcon={<DoorOpen className="size-4" aria-hidden="true" />}
              disabled={activeStudios.length === 0}
              onClick={() => {
                setEditingRoom(null);
                setTargetStudioId(activeStudios[0]?.id ?? '');
                setRoomDirty(false);
                setRoomDrawerOpen(true);
              }}
            >
              + Tambah Ruangan
            </Button>
            <Button
              variant="primary"
              size="sm"
              leadingIcon={<Plus className="size-4" aria-hidden="true" />}
              onClick={() => {
                setEditingStudio(null);
                setStudioDirty(false);
                setStudioDrawerOpen(true);
              }}
            >
              + Tambah Area Studio
            </Button>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-4">
          <Feedback kind="error">{error}</Feedback>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading && !studios.length && (
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="h-44 animate-pulse rounded-dd-lg border border-dd-line bg-dd-surface-muted/40" />
          <div className="h-44 animate-pulse rounded-dd-lg border border-dd-line bg-dd-surface-muted/40" />
        </div>
      )}

      {/* Studio & Room List */}
      {!loading && studios.length === 0 && (
        <div className="mt-4">
          <EmptyState
            title="Belum ada Area Studio"
            description="Tambahkan Area Studio pertama (misal: Main Studio) untuk mulai menyusun slot kelas reformer."
          />
        </div>
      )}

      {studios.length > 0 && (
        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          {studios.map((studio) => {
            const rooms = studio.rooms ?? [];
            return (
              <div
                key={studio.id}
                className="flex flex-col justify-between rounded-dd-lg border border-dd-line/80 bg-white p-5 shadow-sm transition hover:border-dd-forest/40 hover:shadow-dd-card"
              >
                <div>
                  {/* Studio Top Row */}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="grid size-7 place-items-center rounded-dd-md bg-dd-forest/10 text-dd-forest">
                          <Building2 className="size-4" />
                        </span>
                        <strong className="text-base font-bold text-dd-ink">{studio.name}</strong>
                      </div>
                      <span className="mt-1 inline-block text-xs font-semibold text-dd-muted">
                        Kode: {studio.code}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge tone={studio.active ? 'success' : 'neutral'}>
                        {studio.active ? 'Aktif' : 'Nonaktif'}
                      </StatusBadge>
                      {canManage && (
                        <button
                          type="button"
                          className="rounded-dd-md p-1.5 text-dd-muted transition hover:bg-dd-surface-muted hover:text-dd-ink"
                          title="Edit Area Studio"
                          onClick={() => {
                            setEditingStudio(studio);
                            setStudioDirty(false);
                            setStudioDrawerOpen(true);
                          }}
                        >
                          <Pencil className="size-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Studio Meta (Equipment & Phone) */}
                  <div className="mt-3 space-y-1.5 border-t border-dd-line/60 pt-3 text-xs text-dd-muted">
                    {studio.equipmentText && (
                      <div className="flex items-center gap-2">
                        <Wrench className="size-3.5 text-dd-forest shrink-0" />
                        <span className="truncate">{studio.equipmentText}</span>
                      </div>
                    )}
                    {studio.contactPhoneE164 && (
                      <div className="flex items-center gap-2">
                        <Phone className="size-3.5 text-dd-forest shrink-0" />
                        <span>{studio.contactPhoneE164}</span>
                      </div>
                    )}
                    {!studio.equipmentText && !studio.contactPhoneE164 && (
                      <p className="italic text-dd-muted/80">Informasi peralatan dan kontak belum dicatat.</p>
                    )}
                  </div>

                  {/* Ruangan List Inside Studio */}
                  <div className="mt-4 border-t border-dd-line/60 pt-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-dd-forest">
                        Ruangan ({rooms.length})
                      </span>
                      {canManage && studio.active && (
                        <button
                          type="button"
                          className="inline-flex items-center gap-1 text-xs font-semibold text-dd-forest hover:underline"
                          onClick={() => {
                            setEditingRoom(null);
                            setTargetStudioId(studio.id);
                            setRoomDirty(false);
                            setRoomDrawerOpen(true);
                          }}
                        >
                          <Plus className="size-3" /> Tambah Ruangan
                        </button>
                      )}
                    </div>

                    {rooms.length === 0 ? (
                      <p className="mt-2 rounded-dd-md bg-dd-surface-muted/50 p-2.5 text-xs text-dd-muted italic">
                        Belum ada ruangan di area studio ini. Jadwal kelas akan menggunakan area studio utama.
                      </p>
                    ) : (
                      <ul className="mt-2.5 divide-y divide-dd-line/40 rounded-dd-md border border-dd-line/60 bg-dd-surface-muted/30">
                        {rooms.map((room) => (
                          <li
                            key={room.id}
                            className="flex items-center justify-between px-3 py-2 text-xs"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <DoorOpen className="size-3.5 text-dd-muted shrink-0" />
                              <strong className="truncate font-semibold text-dd-ink">{room.name}</strong>
                              <span className="rounded-dd-sm bg-white px-1.5 py-0.5 text-[10px] font-mono text-dd-muted shadow-2xs">
                                {room.code}
                              </span>
                            </div>
                            <div className="flex items-center gap-2.5 shrink-0">
                              <span className="rounded-full bg-dd-success-soft px-2 py-0.5 text-[10px] font-bold text-dd-success">
                                {room.capacity ? `${room.capacity} Reformer` : 'Standar'}
                              </span>
                              {!room.active && (
                                <span className="rounded-full bg-dd-surface-muted px-1.5 py-0.5 text-[10px] font-medium text-dd-muted">
                                  Nonaktif
                                </span>
                              )}
                              {canManage && (
                                <button
                                  type="button"
                                  className="rounded-dd-sm p-1 text-dd-muted transition hover:bg-white hover:text-dd-ink"
                                  title="Edit Ruangan"
                                  onClick={() => {
                                    setEditingRoom({ studioId: studio.id, room });
                                    setTargetStudioId(studio.id);
                                    setRoomDirty(false);
                                    setRoomDrawerOpen(true);
                                  }}
                                >
                                  <Pencil className="size-3" />
                                </button>
                              )}
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Drawer: Tambah / Edit Area Studio */}
      <Drawer
        open={studioDrawerOpen}
        title={editingStudio ? 'Edit Area Studio' : 'Tambah Area Studio'}
        description={
          editingStudio
            ? 'Perbarui nama, peralatan, dan nomor kontak Area Studio.'
            : 'Area Studio berada di dalam Studio/Cabang ini dan menjadi lokasi wajib jadwal kelas.'
        }
        busy={busy}
        dirty={studioDirty}
        onClose={() => {
          setStudioDirty(false);
          setStudioDrawerOpen(false);
          setEditingStudio(null);
        }}
        footer={
          <div className="flex justify-end gap-3">
            <Button
              variant="secondary"
              disabled={busy}
              onClick={() => {
                setStudioDirty(false);
                setStudioDrawerOpen(false);
                setEditingStudio(null);
              }}
            >
              Batal
            </Button>
            <Button type="submit" form="studio-form" loading={busy}>
              {editingStudio ? 'Simpan Perubahan' : 'Simpan Area Studio'}
            </Button>
          </div>
        }
      >
        <form
          id="studio-form"
          className="grid gap-4"
          onChange={() => setStudioDirty(true)}
          onSubmit={handleStudioSubmit}
        >
          {editingStudio ? (
            <TextInput label="Kode area" value={editingStudio.code} disabled />
          ) : (
            <TextInput
              label="Kode area"
              name="code"
              placeholder="Contoh: MAIN"
              description="Kode huruf kapital unik untuk area studio (tidak dapat diubah setelah dibuat)."
              required
            />
          )}
          <TextInput
            label="Nama area studio"
            name="name"
            defaultValue={editingStudio?.name ?? ''}
            placeholder="Contoh: Main Reformer Studio"
            required
          />
          <TextInput
            label="Peralatan & Equipment"
            name="equipmentText"
            defaultValue={editingStudio?.equipmentText ?? ''}
            placeholder="Contoh: 12 Reformer Allegro 2, Cadillacs, Box, Tower"
          />
          <TextInput
            label="Nomor kontak operasional"
            name="contactPhoneE164"
            defaultValue={editingStudio?.contactPhoneE164 ?? ''}
            placeholder="+628…"
            description="Format internasional E.164 (opsional)."
          />
          {editingStudio && (
            <CheckboxInput
              name="active"
              label="Area Studio aktif"
              defaultChecked={editingStudio.active}
            />
          )}
        </form>
      </Drawer>

      {/* Drawer: Tambah / Edit Ruangan */}
      <Drawer
        open={roomDrawerOpen}
        title={editingRoom ? 'Edit Ruangan' : 'Tambah Ruangan'}
        description={
          editingRoom
            ? 'Perbarui nama ruangan atau kapasitas reformer.'
            : 'Ruangan bersifat opsional dan berada di dalam satu Area Studio.'
        }
        busy={busy}
        dirty={roomDirty}
        onClose={() => {
          setRoomDirty(false);
          setRoomDrawerOpen(false);
          setEditingRoom(null);
        }}
        footer={
          <div className="flex justify-end gap-3">
            <Button
              variant="secondary"
              disabled={busy}
              onClick={() => {
                setRoomDirty(false);
                setRoomDrawerOpen(false);
                setEditingRoom(null);
              }}
            >
              Batal
            </Button>
            <Button type="submit" form="room-form" loading={busy}>
              {editingRoom ? 'Simpan Perubahan' : 'Simpan Ruangan'}
            </Button>
          </div>
        }
      >
        <form
          id="room-form"
          className="grid gap-4"
          onChange={() => setRoomDirty(true)}
          onSubmit={handleRoomSubmit}
        >
          {editingRoom ? (
            <TextInput
              label="Area Studio"
              value={studios.find((s) => s.id === editingRoom.studioId)?.name ?? editingRoom.studioId}
              disabled
            />
          ) : (
            <SearchSelect
              label="Pilih Area Studio"
              value={targetStudioId}
              required
              options={activeStudios.map((s) => ({
                id: s.id,
                label: s.name,
                description: s.code,
              }))}
              onChange={setTargetStudioId}
            />
          )}

          {editingRoom ? (
            <TextInput label="Kode ruangan" value={editingRoom.room.code} disabled />
          ) : (
            <TextInput
              label="Kode ruangan"
              name="code"
              placeholder="Contoh: ROOM-A"
              description="Kode unik ruangan (tidak dapat diubah setelah dibuat)."
              required
            />
          )}
          <TextInput
            label="Nama ruangan"
            name="name"
            defaultValue={editingRoom?.room.name ?? ''}
            placeholder="Contoh: Ruangan Reformer A"
            required
          />
          <TextInput
            label="Kapasitas maksimum"
            name="capacity"
            type="number"
            min={1}
            defaultValue={editingRoom?.room.capacity ? String(editingRoom.room.capacity) : ''}
            placeholder="Contoh: 12"
            description="Kapasitas unit reformer di ruangan ini."
          />
          {editingRoom && (
            <CheckboxInput
              name="active"
              label="Ruangan aktif"
              defaultChecked={editingRoom.room.active}
            />
          )}
        </form>
      </Drawer>
    </Panel>
  );
}
