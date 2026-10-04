'use client';

import { useEffect, useState } from 'react';
import {
  getCustomerLinkInfo,
  confirmCustomerLink,
  type CustomerLinkInfo,
  type CustomerLinkConfirmResult,
} from '../../api-clients/booking-client';
import { Button } from '../../components/actions';

export function CheckInLinkView({ token }: { token: string }) {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [info, setInfo] = useState<CustomerLinkInfo | null>(null);
  const [successResult, setSuccessResult] = useState<CustomerLinkConfirmResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    async function fetchInfo() {
      try {
        setLoading(true);
        setError(null);
        const data = await getCustomerLinkInfo(token);
        if (active) {
          setInfo(data);
          if (data.status === 'ATTENDED') {
            setSuccessResult({
              ok: true,
              status: 'ATTENDED',
              bookingId: data.bookingId,
              customerName: data.customerName,
              className: data.className,
              branchName: data.branchName,
              checkedInAt: new Date().toISOString(),
              message: 'Kehadiran Anda telah terkonfirmasi sebelumnya.',
            });
          }
        }
      } catch (err: any) {
        if (active) {
          setError(
            err?.message ??
              'Tautan check-in tidak valid, telah kadaluarsa, atau kelas tidak ditemukan.',
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    if (token) {
      void fetchInfo();
    }
    return () => {
      active = false;
    };
  }, [token]);

  const handleConfirm = async () => {
    try {
      setSubmitting(true);
      setError(null);
      const result = await confirmCustomerLink(token);
      setSuccessResult(result);
    } catch (err: any) {
      setError(
        err?.message ??
          'Gagal mengonfirmasi kehadiran. Silakan hubungi staf frontdesk studio.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  const formatSchedule = (startAtStr?: string, endAtStr?: string) => {
    if (!startAtStr || !endAtStr) return '';
    const start = new Date(startAtStr);
    const end = new Date(endAtStr);
    const datePart = new Intl.DateTimeFormat('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(start);
    const timePart = `${start.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} - ${end.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`;
    return `${datePart} · ${timePart}`;
  };

  return (
    <main className="grid min-h-dvh min-w-0 place-items-center overflow-x-hidden bg-dd-canvas px-4 py-10 font-sans">
      <section className="box-border w-full min-w-0 max-w-md rounded-2xl border border-dd-line bg-dd-surface p-6 sm:p-8 shadow-xl">
        <div className="text-center">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-dd-forest">
            Daily Dose Pilates
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-dd-ink">
            Presensi Kehadiran Kelas
          </h1>
          <p className="mt-1 text-sm text-dd-muted">
            Konfirmasi kehadiran mandiri (Self Check-in)
          </p>
        </div>

        {loading ? (
          <div className="mt-8 flex flex-col items-center justify-center py-10">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-dd-forest/20 border-t-dd-forest" />
            <p className="mt-4 text-sm text-dd-muted">Memuat data tiket sesi Anda...</p>
          </div>
        ) : error && !successResult ? (
          <div className="mt-6 rounded-xl bg-red-50 p-5 text-center text-sm text-red-700 border border-red-200">
            <p className="font-semibold">Presensi Tidak Dapat Diproses</p>
            <p className="mt-1">{error}</p>
            <p className="mt-3 text-xs text-red-600">
              Jika Anda sudah berada di studio, silakan minta bantuan admin frontdesk untuk presensi.
            </p>
          </div>
        ) : successResult ? (
          <div className="mt-6 space-y-5 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <svg
                className="h-9 w-9"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <div>
              <h2 className="text-xl font-bold text-emerald-800">Kehadiran Terkonfirmasi!</h2>
              <p className="mt-1 text-sm text-dd-muted">{successResult.message}</p>
            </div>

            <div className="rounded-xl border border-emerald-200/80 bg-emerald-50/50 p-4 text-left text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-dd-muted">Customer:</span>
                <span className="font-semibold text-dd-ink">{successResult.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-dd-muted">Kelas:</span>
                <span className="font-semibold text-dd-ink">{successResult.className}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-dd-muted">Cabang:</span>
                <span className="font-semibold text-dd-ink">{successResult.branchName}</span>
              </div>
            </div>

            <p className="text-xs text-dd-muted pt-2">
              Sesi Anda akan dipotong resmi oleh sistem saat kelas selesai. Selamat berlatih!
            </p>
          </div>
        ) : info ? (
          <div className="mt-6 space-y-6">
            <div className="rounded-xl border border-dd-line bg-dd-surface-muted p-5 space-y-3">
              <div>
                <p className="text-xs font-medium text-dd-muted uppercase">Nama Peserta</p>
                <p className="text-base font-semibold text-dd-ink">{info.customerName}</p>
              </div>
              <hr className="border-dd-line" />
              <div>
                <p className="text-xs font-medium text-dd-muted uppercase">Kelas & Cabang</p>
                <p className="text-base font-semibold text-dd-forest">{info.className}</p>
                <p className="text-sm text-dd-muted">{info.branchName} {info.studioName ? `· ${info.studioName}` : ''}</p>
              </div>
              {info.instructorName && (
                <div>
                  <p className="text-xs font-medium text-dd-muted uppercase">Instruktur</p>
                  <p className="text-sm font-semibold text-dd-ink">{info.instructorName}</p>
                </div>
              )}
              <div>
                <p className="text-xs font-medium text-dd-muted uppercase">Jadwal Sesi</p>
                <p className="text-sm font-medium text-dd-ink">
                  {formatSchedule(info.startAt, info.endAt)}
                </p>
              </div>
            </div>

            {info.status === 'TOO_EARLY' ? (
              <div className="rounded-xl bg-amber-50 p-4 text-center text-sm text-amber-800 border border-amber-200">
                <p className="font-semibold">Presensi Belum Dibuka</p>
                <p className="mt-1 text-xs">
                  Tautan presensi baru dapat dikonfirmasi mulai 60 menit sebelum kelas dimulai.
                </p>
              </div>
            ) : info.status === 'EXPIRED' ? (
              <div className="rounded-xl bg-zinc-100 p-4 text-center text-sm text-zinc-700 border border-zinc-200">
                <p className="font-semibold">Sesi Telah Selesai</p>
                <p className="mt-1 text-xs">
                  Jendela presensi mandiri telah berakhir. Silakan hubungi frontdesk jika Anda hadir.
                </p>
              </div>
            ) : (
              <Button
                type="button"
                className="w-full py-3.5 text-base font-semibold shadow-lg shadow-dd-forest/20"
                onClick={handleConfirm}
                disabled={submitting}
              >
                {submitting ? 'Memproses Konfirmasi...' : 'Konfirmasi Kehadiran Saya'}
              </Button>
            )}

            <p className="text-center text-xs text-dd-muted">
              Sesuai Aturan Sistem v1.0, sesi dipotong saat kelas dinyatakan selesai oleh studio.
            </p>
          </div>
        ) : null}
      </section>
    </main>
  );
}
