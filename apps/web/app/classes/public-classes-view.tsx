'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  browserPublicClassCatalogClient,
  publicCatalogFailure,
  type PublicBranch,
  type PublicClassCatalogClient,
  type PublicClassSlot,
} from '../public-class-catalog-client';

function dayKey(value: string, timezone: string) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(value));
}

function dateLabel(value: string, timezone: string) {
  return new Intl.DateTimeFormat('id-ID', {
    timeZone: timezone,
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date(value));
}

function timeLabel(value: string, timezone: string) {
  return new Intl.DateTimeFormat('id-ID', {
    timeZone: timezone,
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).format(new Date(value));
}

export function PublicClassesView({
  client = browserPublicClassCatalogClient,
}: {
  client?: PublicClassCatalogClient;
}) {
  const [branches, setBranches] = useState<PublicBranch[]>([]);
  const [branchId, setBranchId] = useState('');
  const [slots, setSlots] = useState<PublicClassSlot[]>([]);
  const [day, setDay] = useState('');
  const [classType, setClassType] = useState('');
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    let active = true;
    setStatus('loading');
    void client
      .list({})
      .then((result) => {
        if (!active) return;
        setBranches(result.branches);
        setStatus('ready');
      })
      .catch((error) => {
        if (!active) return;
        setMessage(publicCatalogFailure(error));
        setStatus('error');
      });
    return () => {
      active = false;
    };
  }, [client]);

  const load = async (selectedBranch = branchId) => {
    if (!selectedBranch) return;
    setStatus('loading');
    setMessage('');
    try {
      const from = new Date();
      const until = new Date(from.getTime() + 14 * 86_400_000);
      const result = await client.list({ branchId: selectedBranch, from, until });
      setBranches(result.branches);
      setSlots(result.items);
      setStatus('ready');
    } catch (error) {
      setSlots([]);
      setMessage(publicCatalogFailure(error));
      setStatus('error');
    }
  };

  const branch = branches.find((item) => item.id === branchId);
  const classTypes = useMemo(
    () => [...new Map(slots.map((slot) => [slot.classType.id, slot.classType])).values()],
    [slots],
  );
  const visible = slots.filter(
    (slot) =>
      (!day || dayKey(slot.startAt, slot.timezone) === day) &&
      (!classType || slot.classType.id === classType),
  );
  const grouped = visible.reduce<Record<string, PublicClassSlot[]>>((groups, slot) => {
    const key = dayKey(slot.startAt, slot.timezone);
    groups[key] = [...(groups[key] ?? []), slot];
    return groups;
  }, {});

  return (
    <div className="public-site public-catalog-page">
      <a className="skip-link" href="#catalog-main">
        Langsung ke jadwal
      </a>
      <header className="public-header">
        <a className="public-brand" href="/" aria-label="Daily Dose Pilates — Beranda">
          <img
            src="https://dailydosepilates.com/assets/images/logo.png"
            width="500"
            height="138"
            alt="Daily Dose Pilates"
          />
        </a>
        <nav className="public-nav" aria-label="Navigasi publik">
          <a href="/">Beranda</a>
          <a href="/classes" aria-current="page">
            Kelas
          </a>
          <a href="/#locations">Lokasi</a>
          <a href="/#contact">Kontak</a>
        </nav>
        <a className="public-header-cta" href="/sign-in">
          Masuk / Registrasi
        </a>
      </header>

      <main id="catalog-main">
        <section className="catalog-hero">
          <p className="public-kicker">Public class schedule</p>
          <h1>Temukan waktu yang tepat untuk bergerak.</h1>
          <p>
            Pilih studio terlebih dahulu. Jadwal dan kapasitas berasal langsung dari sistem Daily
            Dose Pilates.
          </p>
        </section>

        <section className="catalog-discovery" aria-labelledby="catalog-filter-title">
          <div className="catalog-filter-heading">
            <div>
              <p className="public-section-index">01 — Pilih jadwal</p>
              <h2 id="catalog-filter-title">Kelas dua minggu ke depan</h2>
            </div>
            {branch ? (
              <p>
                <strong>{branch.name}</strong>
                <span>{branch.timezone}</span>
              </p>
            ) : (
              <p>Pilih studio tanpa pilihan otomatis.</p>
            )}
          </div>

          <div className="catalog-filters">
            <label>
              <span>Studio</span>
              <select
                aria-label="Studio"
                value={branchId}
                onChange={(event) => {
                  const value = event.target.value;
                  setBranchId(value);
                  setSlots([]);
                  setDay('');
                  setClassType('');
                  if (value) void load(value);
                }}
              >
                <option value="">Pilih studio</option>
                {branches.map((item) => (
                  <option value={item.id} key={item.id}>
                    {item.name} · {item.code}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span>Tanggal</span>
              <input
                aria-label="Tanggal"
                type="date"
                value={day}
                disabled={!branchId}
                onChange={(event) => setDay(event.target.value)}
              />
            </label>
            <label>
              <span>Tipe kelas</span>
              <select
                aria-label="Tipe kelas"
                value={classType}
                disabled={!branchId}
                onChange={(event) => setClassType(event.target.value)}
              >
                <option value="">Semua tipe</option>
                {classTypes.map((item) => (
                  <option value={item.id} key={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </label>
            <button
              className="catalog-reset"
              type="button"
              disabled={!day && !classType}
              onClick={() => {
                setDay('');
                setClassType('');
              }}
            >
              Reset filter
            </button>
          </div>

          {status === 'loading' ? (
            <div className="catalog-state" role="status">
              Memuat jadwal authoritative…
            </div>
          ) : status === 'error' ? (
            <div className="catalog-state catalog-state-error" role="alert">
              <strong>Jadwal belum tersedia</strong>
              <p>{message}</p>
              <button
                type="button"
                onClick={() =>
                  void (branchId
                    ? load()
                    : client.list({}).then((result) => {
                        setBranches(result.branches);
                        setStatus('ready');
                      }))
                }
              >
                Coba lagi
              </button>
            </div>
          ) : !branchId ? (
            <div className="catalog-state">
              <strong>Pilih studio untuk melihat kelas</strong>
              <p>
                Kami tidak memilih lokasi pertama secara otomatis agar jadwal selalu sesuai pilihan
                Anda.
              </p>
            </div>
          ) : visible.length === 0 ? (
            <div className="catalog-state">
              <strong>Belum ada kelas pada filter ini</strong>
              <p>Ubah tanggal atau tipe kelas untuk melihat pilihan lain.</p>
            </div>
          ) : (
            <div className="catalog-schedule" aria-live="polite">
              {Object.entries(grouped).map(([date, items]) => (
                <section className="catalog-day" aria-labelledby={`day-${date}`} key={date}>
                  <header>
                    <span>{date}</span>
                    <h3 id={`day-${date}`}>{dateLabel(items[0]!.startAt, items[0]!.timezone)}</h3>
                  </header>
                  <div>
                    {items.map((slot) => (
                      <article className="catalog-slot" key={slot.id}>
                        <div className="catalog-time">
                          <strong>{timeLabel(slot.startAt, slot.timezone)}</strong>
                          <span>{timeLabel(slot.endAt, slot.timezone)}</span>
                        </div>
                        <div className="catalog-class">
                          <span>{slot.classType.code}</span>
                          <h4>{slot.classType.name}</h4>
                          <p>
                            {slot.status === 'CONFIRMED'
                              ? 'Kelas dikonfirmasi'
                              : 'Terbuka untuk booking'}
                          </p>
                        </div>
                        <div className="catalog-capacity">
                          <span>Ketersediaan</span>
                          <strong>
                            {slot.available > 0 ? `${slot.available} tempat` : 'Penuh'}
                          </strong>
                        </div>
                        <a
                          className={
                            slot.available > 0
                              ? 'catalog-book'
                              : 'catalog-book catalog-book-disabled'
                          }
                          aria-disabled={slot.available < 1}
                          href={
                            slot.available > 0
                              ? `/sign-in?returnTo=${encodeURIComponent(`/classes?slot=${slot.id}`)}`
                              : undefined
                          }
                        >
                          {slot.available > 0 ? 'Pilih kelas' : 'Penuh'}
                        </a>
                      </article>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}
        </section>
      </main>
      <footer className="public-footer catalog-footer">
        <a className="public-brand" href="/">
          <img
            src="https://dailydosepilates.com/assets/images/logo.png"
            width="500"
            height="138"
            alt="Daily Dose Pilates"
          />
        </a>
        <div>
          <strong>Explore</strong>
          <a href="/">Beranda</a>
          <a href="/classes">Kelas</a>
        </div>
        <div>
          <strong>Support</strong>
          <a href="/health">Status sistem</a>
          <a href="/sign-in">Masuk</a>
        </div>
        <p>© {new Date().getFullYear()} Daily Dose Pilates</p>
      </footer>
    </div>
  );
}
