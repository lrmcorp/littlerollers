import type { ClassSlot } from '../api-clients/class-slot-client';

/** Alasan cepat untuk mencatat kehadiran manual; petugas memilih satu, atau menulis sendiri. */
export const ATTENDANCE_REASON_PRESETS = [
  'Pelanggan hadir tetapi belum mengonfirmasi lewat tautan',
  'Ponsel pelanggan bermasalah saat konfirmasi',
  'Petugas melihat langsung pelanggan mengikuti kelas',
] as const;

/** Presensi susulan oleh admin hanya sampai 2 jam setelah kelas selesai (Rule #9). */
export const BACKFILL_WINDOW_MS = 2 * 3600_000;

const LIVE_STATUSES: readonly string[] = ['PUBLISHED', 'CONFIRMED', 'COMPLETED'];

/** Kelas hari ini yang tidak dibatalkan, urut jam mulai. */
export function liveSlots(slots: readonly ClassSlot[]): ClassSlot[] {
  return slots
    .filter((slot) => LIVE_STATUSES.includes(slot.status))
    .sort((a, b) => a.startAt.getTime() - b.startAt.getTime());
}

/** Kelas yang sedang berjalan dan kelas berikutnya pada waktu `now`. */
export function pickRunningAndNext(slots: readonly ClassSlot[], now: Date) {
  const sorted = liveSlots(slots);
  const running = sorted.find((slot) => slot.startAt <= now && now < slot.endAt) ?? null;
  const next = sorted.find((slot) => slot.startAt > now) ?? null;
  return { running, next };
}

/** Kelas terakhir yang sudah selesai sampai `now`; dipilih bila tidak ada kelas berjalan atau berikutnya. */
export function pickLastEnded(slots: readonly ClassSlot[], now: Date): ClassSlot | null {
  const ended = liveSlots(slots).filter((slot) => slot.endAt <= now);
  return ended[ended.length - 1] ?? null;
}

export type SlotPhase = 'Selesai' | 'Berjalan' | 'Belum mulai';

export function slotPhase(slot: ClassSlot, now: Date): SlotPhase {
  if (slot.endAt <= now) return 'Selesai';
  if (slot.startAt <= now) return 'Berjalan';
  return 'Belum mulai';
}

/**
 * Apakah admin boleh mencatat kehadiran pelanggan kelas ini sekarang. API menolak bila kelas belum
 * dikonfirmasi (kuota minimum belum terpenuhi) atau sudah lewat 2 jam setelah selesai.
 */
export function attendanceWindow(slot: ClassSlot, now: Date): { open: boolean; reason?: string } {
  if (slot.status !== 'CONFIRMED' && slot.status !== 'COMPLETED')
    return { open: false, reason: 'Kehadiran bisa dicatat setelah kelas dikonfirmasi.' };
  if (now.getTime() > slot.endAt.getTime() + BACKFILL_WINDOW_MS)
    return { open: false, reason: 'Lewat 2 jam setelah kelas selesai. Ajukan penyesuaian sesi ke Manager.' };
  return { open: true };
}
