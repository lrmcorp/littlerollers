'use client';

import { useState } from 'react';
import { masterFailureMessage, type MasterClient } from '@/api-clients/master-client';
import type { Room, Studio } from '@/api-clients/master-client';
import { EmptyState, StatusBadge } from '../ui';
import { Button } from '../components/actions';
import { Modal, useAppFeedback } from '../components/app-feedback';
import { Textarea, TextInput } from '../components/forms';

type Editing =
  | { kind: 'studio'; studio: Studio }
  | { kind: 'room'; studio: Studio; room: Room }
  | null;

/** Daftar Area Studio dan Ruangan dengan ubah, nonaktifkan, dan aktifkan kembali. */
export function StudioVenueList({
  studios,
  canManage,
  client,
  onChanged,
  onFailure,
  onAddRoom,
}: {
  studios: Studio[];
  canManage: boolean;
  client: Pick<MasterClient, 'updateStudio' | 'updateRoom'>;
  onChanged(message: string): void | Promise<void>;
  onFailure(message: string): void;
  onAddRoom?(studioId: string): void;
}) {
  const feedback = useAppFeedback();
  const [editing, setEditing] = useState<Editing>(null);
  const [name, setName] = useState('');
  const [equipment, setEquipment] = useState('');
  const [phone, setPhone] = useState('');
  const [capacity, setCapacity] = useState('');
  const [busy, setBusy] = useState(false);

  const run = async (action: () => Promise<unknown>, success: string) => {
    setBusy(true);
    try {
      await action();
      setEditing(null);
      await onChanged(success);
    } catch (error) {
      onFailure(masterFailureMessage(error));
    } finally {
      setBusy(false);
    }
  };

  const toggleStudio = async (studio: Studio) => {
    const next = !studio.active;
    const accepted = await feedback.confirm({
      tone: next ? 'warning' : 'danger',
      title: next ? 'Aktifkan area studio?' : 'Nonaktifkan area studio?',
      message: next
        ? `${studio.name} akan tersedia lagi untuk jadwal kelas.`
        : `${studio.name} tidak dapat dipakai untuk kelas baru. Ditolak bila masih ada kelas terjadwal di area ini.`,
      confirmLabel: next ? 'Aktifkan' : 'Nonaktifkan',
    });
    if (!accepted) return;
    await run(
      () => client.updateStudio(studio.id, { name: studio.name, active: next }),
      next ? 'Area studio diaktifkan.' : 'Area studio dinonaktifkan.',
    );
  };

  const toggleRoom = async (room: Room) => {
    const next = !room.active;
    const accepted = await feedback.confirm({
      tone: next ? 'warning' : 'danger',
      title: next ? 'Aktifkan ruangan?' : 'Nonaktifkan ruangan?',
      message: next
        ? `${room.name} akan tersedia lagi untuk jadwal kelas.`
        : `${room.name} tidak dapat dipakai untuk kelas baru. Ditolak bila masih ada kelas terjadwal di ruangan ini.`,
      confirmLabel: next ? 'Aktifkan' : 'Nonaktifkan',
    });
    if (!accepted) return;
    await run(
      () =>
        client.updateRoom(room.id, {
          name: room.name,
          capacity: room.capacity ?? undefined,
          active: next,
        }),
      next ? 'Ruangan diaktifkan.' : 'Ruangan dinonaktifkan.',
    );
  };

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

  return (
    <>
      <ul className="mt-4 grid list-none gap-4 p-0 md:grid-cols-2">
        {studios.map((studio) => (
          <li
            className={`rounded-dd-sm border border-dd-line p-4 ${studio.active ? '' : 'bg-dd-surface-muted/60'}`}
            key={studio.id}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <strong className="text-sm font-semibold text-dd-ink">{studio.name}</strong>
                <p className="text-sm text-dd-muted">{studio.code}</p>
              </div>
              <StatusBadge tone={studio.active ? 'success' : 'neutral'}>
                {studio.active ? 'Aktif' : 'Nonaktif'}
              </StatusBadge>
            </div>
            <p className="mt-2 text-xs text-dd-muted">
              {studio.equipmentText || 'Equipment belum dicatat'}
            </p>
            {studio.contactPhoneE164 && (
              <p className="mt-1 text-xs text-dd-muted">
                Kontak: <span className="font-medium text-dd-ink">{studio.contactPhoneE164}</span>
              </p>
            )}
            {canManage && (
              <div className="mt-3 flex flex-wrap gap-2">
                {studio.active && onAddRoom && (
                  <Button
                    size="sm"
                    variant="secondary"
                    disabled={busy}
                    onClick={() => onAddRoom(studio.id)}
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
                  variant="ghost"
                  disabled={busy}
                  onClick={() => void toggleStudio(studio)}
                >
                  {studio.active ? 'Nonaktifkan' : 'Aktifkan kembali'}
                </Button>
              </div>
            )}
            <ul className="mt-3 grid list-none gap-2 p-0">
              {(studio.rooms ?? []).map((room) => (
                <li
                  className="flex flex-wrap items-center justify-between gap-2 rounded-dd-sm bg-dd-surface-muted px-3 py-2 text-sm"
                  key={room.id}
                >
                  <span className={room.active ? '' : 'text-dd-muted'}>
                    {room.name} · {room.code}
                    {!room.active && ' (nonaktif)'}
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="text-xs text-dd-muted">
                      {room.capacity ? `Kapasitas ${room.capacity}` : 'Tanpa batas khusus'}
                    </span>
                    {canManage && (
                      <>
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
                      </>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
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
    </>
  );
}
