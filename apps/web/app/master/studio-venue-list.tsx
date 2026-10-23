'use client';

import { useEffect, useState } from 'react';
import {
  browserMasterClient,
  masterFailureMessage,
  type MasterClient,
  type Room,
  type Studio,
} from '@/api-clients/master-client';
import { EmptyState, StatusBadge } from '../ui';
import { Button } from '../components/actions';
import { DataTable, type DataTableColumn } from '../components/admin/admin-ui';
import { Modal, useAppFeedback } from '../components/app-feedback';
import { Textarea, TextInput } from '../components/forms';
import { LifecycleDialog, type LifecycleAction } from '../components/admin/lifecycle-dialog';

type Editing =
  | { kind: 'studio'; studio: Studio }
  | { kind: 'room'; studio: Studio; room: Room }
  | null;

export function StudioVenueList({
  studios: propStudios,
  branchId,
  canManage,
  allowCreate = false,
  client = browserMasterClient,
  onChanged,
  onFailure,
  onAddRoom,
}: {
  studios?: Studio[];
  branchId?: string;
  canManage: boolean;
  allowCreate?: boolean;
  client?: Pick<MasterClient, 'updateStudio' | 'updateRoom'> &
    Partial<Pick<MasterClient, 'listStudios' | 'createStudio' | 'createRoom'>>;
  onChanged?(message: string): void | Promise<void>;
  onFailure?(message: string): void;
  onAddRoom?(studioId: string): void;
}) {
  const feedback = useAppFeedback();
  const [internalStudios, setInternalStudios] = useState<Studio[]>([]);
  const [editing, setEditing] = useState<Editing>(null);
  const [name, setName] = useState('');
  const [equipment, setEquipment] = useState('');
  const [phone, setPhone] = useState('');
  const [capacity, setCapacity] = useState('');
  const [busy, setBusy] = useState(false);
  const [lifecycle, setLifecycle] = useState<
    | { kind: 'studio'; studio: Studio; action: LifecycleAction }
    | { kind: 'room'; room: Room; action: LifecycleAction }
    | null
  >(null);

  // Create state for standalone usage (e.g. branch-detail-view)
  const [isCreateStudioOpen, setIsCreateStudioOpen] = useState(false);
  const [newStudioCode, setNewStudioCode] = useState('');
  const [newStudioName, setNewStudioName] = useState('');
  const [newStudioEquipment, setNewStudioEquipment] = useState('');
  const [newStudioPhone, setNewStudioPhone] = useState('');

  const [isCreateRoomOpen, setIsCreateRoomOpen] = useState(false);
  const [newRoomStudioId, setNewRoomStudioId] = useState('');
  const [newRoomCode, setNewRoomCode] = useState('');
  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomCapacity, setNewRoomCapacity] = useState('');

  useEffect(() => {
    if (!propStudios && branchId && client.listStudios) {
      client
        .listStudios(branchId, { includeInactive: true })
        .then(setInternalStudios)
        .catch(() => {
          onFailure?.('Area Studio dan Ruangan belum dapat dimuat.');
        });
    }
  }, [branchId, propStudios, client, onFailure]);

  const studios = propStudios ?? internalStudios;

  const run = async (action: () => Promise<unknown>, success: string) => {
    setBusy(true);
    try {
      await action();
      setEditing(null);
      if (!propStudios && branchId && client.listStudios) {
        const next = await client.listStudios(branchId, { includeInactive: true });
        setInternalStudios(next);
      }
      await onChanged?.(success);
    } catch (error) {
      onFailure?.(masterFailureMessage(error));
    } finally {
      setBusy(false);
    }
  };

  const toggleStudio = async (studio: Studio) => {
    if (studio.active) {
      setLifecycle({ kind: 'studio', studio, action: 'deactivate' });
      return;
    }
    const accepted = await feedback.confirm({
      tone: 'warning',
      title: 'Aktifkan area studio?',
      message: `${studio.name} akan tersedia lagi untuk jadwal kelas.`,
      confirmLabel: 'Aktifkan',
    });
    if (!accepted) return;
    await run(() => client.updateStudio(studio.id, { name: studio.name, active: true }), 'Area studio diaktifkan.');
  };

  const deleteStudio = (studio: Studio) => setLifecycle({ kind: 'studio', studio, action: 'delete' });

  const toggleRoom = async (room: Room) => {
    if (room.active) {
      setLifecycle({ kind: 'room', room, action: 'deactivate' });
      return;
    }
    const accepted = await feedback.confirm({
      tone: 'warning',
      title: 'Aktifkan ruangan?',
      message: `${room.name} akan tersedia lagi untuk jadwal kelas.`,
      confirmLabel: 'Aktifkan',
    });
    if (!accepted) return;
    await run(
      () => client.updateRoom(room.id, { name: room.name, capacity: room.capacity ?? undefined, active: true }),
      'Ruangan diaktifkan.',
    );
  };

  const deleteRoom = (room: Room) => setLifecycle({ kind: 'room', room, action: 'delete' });

  const save = () => {
    if (!editing) return;
    if (editing.kind === 'studio') {
      const payload: { name: string; equipmentText?: string; contactPhoneE164?: string } = {
        name: name.trim(),
        equipmentText: equipment.trim(),
      };
      if (phone.trim()) {
        payload.contactPhoneE164 = phone.trim();
      }
      void run(
        () => client.updateStudio(editing.studio.id, payload),
        'Area studio diperbarui.',
      );
    } else {
      void run(
        () =>
          client.updateRoom(editing.room.id, {
            name: name.trim(),
            capacity: capacity.trim() ? Number(capacity) : undefined,
          }),
        'Ruangan diperbarui.',
      );
    }
  };

  const capacityValid =
    capacity.trim() === '' ||
    (Number.isInteger(Number(capacity)) && Number(capacity) >= 1 && Number(capacity) <= 100);
  const canSave =
    Boolean(editing) &&
    name.trim().length >= (editing?.kind === 'studio' ? 2 : 1) &&
    (editing?.kind === 'studio' || capacityValid);

  if (studios.length === 0)
    return (
      <div className="mt-4">
        <EmptyState
          title="Belum ada Area Studio"
          description="Tambahkan Area Studio pada Studio/Cabang aktif."
        />
      </div>
    );

  const columns: DataTableColumn<Studio>[] = [
    {
      id: 'area',
      header: 'Area Studio',
      cell: (studio) => (
        <div>
          <strong className="block text-sm font-semibold text-dd-ink">{studio.name}</strong>
          <span className="font-mono text-xs text-dd-muted">{studio.code}</span>
        </div>
      ),
    },
    {
      id: 'equipment',
      header: 'Equipment & Kontak',
      cell: (studio) => (
        <div className="space-y-0.5 text-xs text-dd-muted">
          <p>{studio.equipmentText || 'Equipment belum dicatat'}</p>
          {studio.contactPhoneE164 && (
            <p>
              Kontak: <span className="font-medium text-dd-ink">{studio.contactPhoneE164}</span>
            </p>
          )}
        </div>
      ),
    },
    {
      id: 'rooms',
      header: 'Daftar Ruangan & Kapasitas',
      cell: (studio) => (
        <div className="space-y-1.5">
          {(studio.rooms ?? []).length > 0 ? (
            <ul className="grid list-none gap-1.5 p-0 m-0">
              {(studio.rooms ?? []).map((room) => (
                <li
                  key={room.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-dd-sm border border-dd-line/60 bg-dd-surface-muted/70 px-2.5 py-1.5 text-xs"
                >
                  <span className={room.active ? 'font-medium text-dd-ink' : 'text-dd-muted'}>
                    {room.name} · {room.code}
                    {!room.active && ' (nonaktif)'}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-dd-muted">
                      {room.capacity ? `Kapasitas ${room.capacity}` : 'Tanpa batas khusus'}
                    </span>
                    {canManage && (
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          aria-label={`Ubah ruangan ${room.name}`}
                          disabled={busy}
                          onClick={() => {
                            setName(room.name);
                            setCapacity(room.capacity ? String(room.capacity) : '');
                            setEditing({ kind: 'room', studio, room });
                          }}
                        >
                          Ubah
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          aria-label={`${room.active ? 'Nonaktifkan' : 'Aktifkan'} ruangan ${room.name}`}
                          disabled={busy}
                          onClick={() => void toggleRoom(room)}
                        >
                          {room.active ? 'Nonaktifkan' : 'Aktifkan'}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-dd-danger hover:text-dd-danger"
                          aria-label={`Hapus ruangan ${room.name}`}
                          disabled={busy}
                          onClick={() => deleteRoom(room)}
                        >
                          Hapus
                        </Button>
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <span className="text-xs italic text-dd-muted">Belum ada ruangan</span>
          )}
        </div>
      ),
    },
    {
      id: 'status',
      header: 'Status',
      cell: (studio) => (
        <StatusBadge tone={studio.active ? 'success' : 'neutral'}>
          {studio.active ? 'Aktif' : 'Nonaktif'}
        </StatusBadge>
      ),
    },
    {
      id: 'actions',
      header: 'Aksi',
      className: 'whitespace-nowrap',
      cell: (studio) => {
        const handleAddRoom = onAddRoom
          ? () => onAddRoom(studio.id)
          : allowCreate
            ? () => {
                setNewRoomStudioId(studio.id);
                setNewRoomCode('');
                setNewRoomName('');
                setNewRoomCapacity('');
                setIsCreateRoomOpen(true);
              }
            : undefined;

        return canManage ? (
          <div className="flex items-center gap-1.5">
            {studio.active && handleAddRoom && (
              <Button
                size="sm"
                variant="secondary"
                disabled={busy}
                onClick={handleAddRoom}
              >
                + Ruangan
              </Button>
            )}
            <Button
              size="sm"
              variant="secondary"
              disabled={busy}
              onClick={() => {
                setName(studio.name);
                setEquipment(studio.equipmentText ?? '');
                setPhone(studio.contactPhoneE164 ?? '');
                setEditing({ kind: 'studio', studio });
              }}
            >
              Ubah area
            </Button>
            <Button
              size="sm"
              variant={studio.active ? 'secondary' : 'secondary'}
              disabled={busy}
              onClick={() => void toggleStudio(studio)}
            >
              {studio.active ? 'Nonaktifkan' : 'Aktifkan kembali'}
            </Button>
            <Button
              size="sm"
              variant="danger"
              disabled={busy}
              onClick={() => deleteStudio(studio)}
            >
              Hapus
            </Button>
          </div>
        ) : (
          <span className="text-xs text-dd-muted">-</span>
        );
      },
    },
  ];

  const submitCreateStudio = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!branchId || !client.createStudio) return;
    setBusy(true);
    try {
      await client.createStudio(branchId, {
        code: newStudioCode.trim().toUpperCase(),
        name: newStudioName.trim(),
        equipmentText: newStudioEquipment.trim() || undefined,
        contactPhoneE164: newStudioPhone.trim() || undefined,
      });
      setIsCreateStudioOpen(false);
      if (client.listStudios) {
        const next = await client.listStudios(branchId, { includeInactive: true });
        setInternalStudios(next);
      }
      feedback.showToast({
        tone: 'success',
        title: 'Area studio ditambahkan',
        message: `${newStudioName} siap digunakan.`,
      });
      await onChanged?.('Area Studio berhasil ditambahkan.');
    } catch (err) {
      onFailure?.(masterFailureMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const submitCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomStudioId || !client.createRoom) return;
    setBusy(true);
    try {
      await client.createRoom(newRoomStudioId, {
        code: newRoomCode.trim().toUpperCase(),
        name: newRoomName.trim(),
        capacity: newRoomCapacity.trim() ? Number(newRoomCapacity) : undefined,
      });
      setIsCreateRoomOpen(false);
      if (branchId && client.listStudios) {
        const next = await client.listStudios(branchId, { includeInactive: true });
        setInternalStudios(next);
      }
      feedback.showToast({
        tone: 'success',
        title: 'Ruangan ditambahkan',
        message: `${newRoomName} siap digunakan.`,
      });
      await onChanged?.('Ruangan berhasil ditambahkan.');
    } catch (err) {
      onFailure?.(masterFailureMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      {allowCreate && (
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-dd-line pb-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold text-dd-ink">Area Studio &amp; Ruangan</h3>
              <StatusBadge tone="info">{studios.length} area</StatusBadge>
            </div>
            <p className="mt-1 text-xs text-dd-muted">
              Kelola area studio dan kapasitas ruangan di cabang ini.
            </p>
          </div>
          {canManage && branchId && (
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                disabled={busy || studios.filter((s) => s.active).length === 0}
                onClick={() => {
                  const first = studios.find((s) => s.active);
                  if (first) {
                    setNewRoomStudioId(first.id);
                    setNewRoomCode('');
                    setNewRoomName('');
                    setNewRoomCapacity('');
                    setIsCreateRoomOpen(true);
                  }
                }}
              >
                + Ruangan
              </Button>
              <Button
                size="sm"
                disabled={busy}
                onClick={() => {
                  setNewStudioCode('');
                  setNewStudioName('');
                  setNewStudioEquipment('');
                  setNewStudioPhone('');
                  setIsCreateStudioOpen(true);
                }}
              >
                + Tambah Area Studio
              </Button>
            </div>
          )}
        </div>
      )}

      <div className="mt-4">
        {studios.length === 0 ? (
          <EmptyState
            title="Belum ada Area Studio"
            description="Tambahkan Area Studio pertama untuk cabang ini."
            action={
              allowCreate && canManage && branchId ? (
                <Button
                  size="sm"
                  onClick={() => {
                    setNewStudioCode('');
                    setNewStudioName('');
                    setNewStudioEquipment('');
                    setNewStudioPhone('');
                    setIsCreateStudioOpen(true);
                  }}
                >
                  + Tambah Area Studio
                </Button>
              ) : undefined
            }
          />
        ) : (
          <DataTable items={studios} columns={columns} rowKey={(s) => s.id} />
        )}
      </div>

      {/* Modal Edit Studio / Room */}
      <Modal
        open={editing !== null}
        title={editing?.kind === 'room' ? 'Ubah ruangan' : 'Ubah area studio'}
        description={
          editing
            ? `${editing.kind === 'room' ? `${editing.studio.name} · ${editing.room.code}` : editing.studio.code}`
            : undefined
        }
        busy={busy}
        onClose={() => setEditing(null)}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="secondary" disabled={busy} onClick={() => setEditing(null)}>
              Batal
            </Button>
            <Button loading={busy} disabled={!canSave} onClick={save}>
              Simpan perubahan
            </Button>
          </div>
        }
      >
        <div className="grid gap-4">
          <TextInput
            label={editing?.kind === 'room' ? 'Nama ruangan' : 'Nama area'}
            value={name}
            maxLength={120}
            onChange={(event) => setName(event.target.value)}
          />
          {editing?.kind === 'studio' ? (
            <>
              <Textarea
                label="Equipment"
                value={equipment}
                maxLength={500}
                onChange={(event) => setEquipment(event.target.value)}
              />
              <TextInput
                label="Nomor kontak (opsional)"
                placeholder="+628…"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
              />
            </>
          ) : (
            <TextInput
              label="Kapasitas (opsional)"
              type="number"
              min={1}
              max={100}
              value={capacity}
              error={capacityValid ? undefined : 'Kapasitas 1–100.'}
              onChange={(event) => setCapacity(event.target.value)}
            />
          )}
        </div>
      </Modal>

      {/* Modal Tambah Area Studio (untuk allowCreate) */}
      <Modal
        open={isCreateStudioOpen}
        title="Tambah Area Studio"
        busy={busy}
        onClose={() => setIsCreateStudioOpen(false)}
        footer={
          <div className="flex justify-end gap-2">
            <Button
              variant="secondary"
              disabled={busy}
              onClick={() => setIsCreateStudioOpen(false)}
            >
              Batal
            </Button>
            <Button
              type="submit"
              form="create-studio-form"
              loading={busy}
              disabled={!newStudioCode.trim() || !newStudioName.trim()}
            >
              Simpan Area Studio
            </Button>
          </div>
        }
      >
        <form id="create-studio-form" onSubmit={submitCreateStudio} className="grid gap-4">
          <TextInput
            label="Kode area"
            placeholder="Contoh: MAIN"
            required
            value={newStudioCode}
            onChange={(e) => setNewStudioCode(e.target.value)}
          />
          <TextInput
            label="Nama area"
            placeholder="Main Studio"
            required
            value={newStudioName}
            onChange={(e) => setNewStudioName(e.target.value)}
          />
          <TextInput
            label="Equipment (opsional)"
            placeholder="Reformer, Mat, Foam Roller"
            value={newStudioEquipment}
            onChange={(e) => setNewStudioEquipment(e.target.value)}
          />
          <TextInput
            label="Nomor kontak (opsional)"
            placeholder="+628…"
            value={newStudioPhone}
            onChange={(e) => setNewStudioPhone(e.target.value)}
          />
        </form>
      </Modal>

      {/* Modal Tambah Ruangan (untuk allowCreate) */}
      <Modal
        open={isCreateRoomOpen}
        title="Tambah Ruangan"
        busy={busy}
        onClose={() => setIsCreateRoomOpen(false)}
        footer={
          <div className="flex justify-end gap-2">
            <Button
              variant="secondary"
              disabled={busy}
              onClick={() => setIsCreateRoomOpen(false)}
            >
              Batal
            </Button>
            <Button
              type="submit"
              form="create-room-form"
              loading={busy}
              disabled={!newRoomStudioId || !newRoomCode.trim() || !newRoomName.trim()}
            >
              Simpan Ruangan
            </Button>
          </div>
        }
      >
        <form id="create-room-form" onSubmit={submitCreateRoom} className="grid gap-4">
          {studios.length > 1 && (
            <label className="grid gap-1.5 text-sm font-semibold text-dd-ink">
              Area Studio
              <select
                className="min-h-11 rounded-dd-md border border-dd-line bg-white px-3 py-2 text-sm text-dd-ink"
                value={newRoomStudioId}
                onChange={(e) => setNewRoomStudioId(e.target.value)}
              >
                {studios.filter((s) => s.active).map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.code})
                  </option>
                ))}
              </select>
            </label>
          )}
          <TextInput
            label="Kode ruangan"
            placeholder="Contoh: R1"
            required
            value={newRoomCode}
            onChange={(e) => setNewRoomCode(e.target.value)}
          />
          <TextInput
            label="Nama ruangan"
            placeholder="Ruang Reformer A"
            required
            value={newRoomName}
            onChange={(e) => setNewRoomName(e.target.value)}
          />
          <TextInput
            label="Kapasitas (opsional)"
            type="number"
            min={1}
            max={100}
            placeholder="10"
            value={newRoomCapacity}
            onChange={(e) => setNewRoomCapacity(e.target.value)}
          />
        </form>
      </Modal>
      <LifecycleDialog
        request={
          lifecycle
            ? lifecycle.kind === 'studio'
              ? { kind: 'studio', id: lifecycle.studio.id, name: lifecycle.studio.name, action: lifecycle.action }
              : { kind: 'room', id: lifecycle.room.id, name: lifecycle.room.name, action: lifecycle.action }
            : null
        }
        deactivate={(reason) =>
          lifecycle!.kind === 'studio'
            ? client.updateStudio(lifecycle!.studio.id, { name: lifecycle!.studio.name, active: false, reason })
            : client.updateRoom(lifecycle!.room.id, {
                name: lifecycle!.room.name,
                capacity: lifecycle!.room.capacity ?? undefined,
                active: false,
                reason,
              })
        }
        onClose={() => setLifecycle(null)}
        onDone={async (message) => {
          setLifecycle(null);
          if (!propStudios && branchId && client.listStudios) {
            setInternalStudios(await client.listStudios(branchId, { includeInactive: true }));
          }
          await onChanged?.(message);
        }}
      />
    </>
  );
}
