'use client';

import { useEffect, useState } from 'react';
import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react';
import { Button } from '../components/actions';
import { useAppFeedback } from '../components/app-feedback';
import { Textarea, TextInput } from '../components/forms';
import { StatusBadge } from '../ui';
import { contentFailure, request } from './content-api';

const FAQ_KEY = 'CLASS_DETAIL_FAQ';
const MAX_ITEMS = 50;
const MIN_TEXT = 5;

type ContentRow = {
  id: string;
  contentKey: string;
  status: string;
  version: number;
  updatedAt?: string;
  payload?: { items?: Array<{ id?: string; question?: string; answer?: string }> };
};

/** Butir yang sedang diedit; `uid` hanya untuk key React, `id` dipertahankan dari yang tersimpan. */
type Entry = { uid: string; id?: string; question: string; answer: string };

let counter = 0;
const nextUid = () => `entry-${(counter += 1)}`;

const fromRow = (row?: ContentRow): Entry[] =>
  (row?.payload?.items ?? []).map((item) => ({
    uid: nextUid(),
    id: item.id,
    question: item.question ?? '',
    answer: item.answer ?? '',
  }));

/**
 * FAQ yang tampil di halaman detail kelas publik. Alurnya sama dengan slider: simpan draf, lalu
 * terbitkan; yang belum terbit tidak tampil. Bila tidak ada FAQ terbit, situs memakai pertanyaan bawaan.
 */
export function FaqEditor({
  items,
  onChanged,
  onMessage,
  onError,
}: {
  items: ContentRow[];
  onChanged(): Promise<unknown> | unknown;
  onMessage(message: string): void;
  onError(message: string): void;
}) {
  const feedback = useAppFeedback();
  const rows = items.filter((item) => item.contentKey === FAQ_KEY);
  const draftRow = rows.find((row) => row.status === 'DRAFT');
  const publishedRow = rows.find((row) => row.status === 'PUBLISHED');
  // Editor memuat draf terbaru bila ada, kalau tidak versi yang sedang terbit.
  const source = draftRow ?? publishedRow;
  const [entries, setEntries] = useState<Entry[]>(() => fromRow(source));
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setEntries(fromRow(source));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- muat ulang hanya bila baris sumbernya berganti
  }, [source?.id, source?.version, source?.updatedAt]);

  const trimmed = (value: string) => value.trim().length;
  const complete =
    entries.length >= 1 &&
    entries.length <= MAX_ITEMS &&
    entries.every((entry) => trimmed(entry.question) >= MIN_TEXT && trimmed(entry.answer) >= MIN_TEXT);

  const update = (uid: string, patch: Partial<Entry>) =>
    setEntries((current) => current.map((entry) => (entry.uid === uid ? { ...entry, ...patch } : entry)));

  const move = (index: number, direction: -1 | 1) =>
    setEntries((current) => {
      const target = index + direction;
      if (target < 0 || target >= current.length) return current;
      const next = [...current];
      [next[index], next[target]] = [next[target]!, next[index]!];
      return next;
    });

  const remove = async (entry: Entry, number: number) => {
    if (entry.question.trim() || entry.answer.trim()) {
      const accepted = await feedback.confirm({
        tone: 'warning',
        title: `Hapus pertanyaan ${number}?`,
        message: 'Pertanyaan dan jawabannya dihapus dari draf ini. Simpan draf untuk menerapkannya.',
        confirmLabel: 'Hapus',
      });
      if (!accepted) return;
    }
    setEntries((current) => current.filter((item) => item.uid !== entry.uid));
  };

  const save = async (publish: boolean) => {
    setBusy(true);
    try {
      const payload = {
        items: entries.map((entry) => ({
          id: entry.id,
          question: entry.question.trim(),
          answer: entry.answer.trim(),
        })),
      };
      // Draf yang ada diperbarui; bila belum ada (atau sudah terbit) dibuat draf versi baru.
      const saved = draftRow
        ? await request(`/public-content-management/${draftRow.id}`, {
            method: 'PATCH',
            body: JSON.stringify({ payload }),
          })
        : await request('/public-content-management', {
            method: 'POST',
            body: JSON.stringify({ contentKey: FAQ_KEY, kind: 'FAQ', payload }),
          });
      if (publish && saved?.id) {
        await request(`/public-content-management/${saved.id}/PUBLISHED`, { method: 'POST' });
        onMessage(
          'FAQ berhasil dipublikasikan. Halaman kelas memperbarui tampilannya dalam beberapa menit (cache situs).',
        );
      } else {
        onMessage('Draf FAQ berhasil disimpan.');
      }
      await onChanged();
    } catch (cause) {
      onError(contentFailure(cause, 'Gagal menyimpan FAQ.', 'faq'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="space-y-6" aria-labelledby="faq-editor-title">
      <div className="rounded-dd-xl border border-dd-line bg-white p-6 shadow-dd-card">
        <div className="flex flex-col gap-4 border-b border-dd-line/60 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 id="faq-editor-title" className="text-lg font-bold text-dd-ink">
              FAQ Halaman Detail Kelas
            </h2>
            <p className="mt-0.5 text-xs text-dd-muted">
              Pertanyaan yang sama tampil di halaman detail semua jenis kelas (maks. {MAX_ITEMS}{' '}
              pertanyaan).
            </p>
            <div className="mt-2">
              {draftRow ? (
                <StatusBadge tone="warning">Ada draf belum terbit (versi {draftRow.version})</StatusBadge>
              ) : publishedRow ? (
                <StatusBadge tone="success">Terbit (versi {publishedRow.version})</StatusBadge>
              ) : (
                <StatusBadge tone="neutral">
                  Belum ada FAQ terbit — halaman kelas memakai 3 pertanyaan bawaan
                </StatusBadge>
              )}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="secondary"
              disabled={busy || !complete}
              onClick={() => void save(false)}
            >
              Simpan Draf FAQ
            </Button>
            <Button disabled={busy || !complete} loading={busy} onClick={() => void save(true)}>
              Publikasikan FAQ
            </Button>
          </div>
        </div>
        {!complete && (
          <p className="mt-3 text-xs text-dd-muted" role="note">
            Isi minimal satu pertanyaan; pertanyaan dan jawaban masing-masing minimal {MIN_TEXT}{' '}
            karakter.
          </p>
        )}
      </div>

      <ol className="m-0 grid list-none gap-4 p-0">
        {entries.map((entry, index) => (
          <li
            key={entry.uid}
            className="grid gap-3 rounded-dd-xl border border-dd-line bg-white p-5 shadow-dd-card"
          >
            <div className="flex items-center justify-between gap-2">
              <strong className="text-sm text-dd-ink">Butir {index + 1}</strong>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={index === 0 || busy}
                  onClick={() => move(index, -1)}
                  aria-label={`Geser pertanyaan ${index + 1} ke atas`}
                  className="rounded p-1.5 text-dd-muted hover:bg-dd-surface-muted hover:text-dd-ink disabled:opacity-30"
                >
                  <ArrowUp className="size-4" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  disabled={index === entries.length - 1 || busy}
                  onClick={() => move(index, 1)}
                  aria-label={`Geser pertanyaan ${index + 1} ke bawah`}
                  className="rounded p-1.5 text-dd-muted hover:bg-dd-surface-muted hover:text-dd-ink disabled:opacity-30"
                >
                  <ArrowDown className="size-4" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void remove(entry, index + 1)}
                  aria-label={`Hapus pertanyaan ${index + 1}`}
                  className="rounded p-1.5 text-red-600 hover:bg-red-50 disabled:opacity-30"
                >
                  <Trash2 className="size-4" aria-hidden="true" />
                </button>
              </div>
            </div>
            <TextInput
              label={`Pertanyaan ${index + 1}`}
              value={entry.question}
              maxLength={200}
              onChange={(event) => update(entry.uid, { question: event.target.value })}
            />
            <Textarea
              label={`Jawaban ${index + 1}`}
              value={entry.answer}
              maxLength={1500}
              rows={3}
              onChange={(event) => update(entry.uid, { answer: event.target.value })}
            />
          </li>
        ))}
      </ol>

      <div>
        <Button
          variant="secondary"
          disabled={busy || entries.length >= MAX_ITEMS}
          onClick={() =>
            setEntries((current) => [...current, { uid: nextUid(), question: '', answer: '' }])
          }
        >
          <Plus className="size-4" aria-hidden="true" /> Tambah pertanyaan
        </Button>
      </div>
    </section>
  );
}
