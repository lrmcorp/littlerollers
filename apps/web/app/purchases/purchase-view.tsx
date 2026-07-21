'use client';
import { useState } from 'react';
import {
  browserPurchaseClient,
  purchaseFailure,
  type PurchaseClient,
  type PurchasePackage,
} from '../purchase-client';
export function PurchaseView({ client = browserPurchaseClient }: { client?: PurchaseClient }) {
  const [branchId, setBranchId] = useState('');
  const [packages, setPackages] = useState<PurchasePackage[]>([]);
  const [selected, setSelected] = useState('');
  const [proofId, setProofId] = useState('');
  const [scan, setScan] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const run = async (action: () => Promise<void>) => {
    setLoading(true);
    setError('');
    try {
      await action();
    } catch (e) {
      setError(purchaseFailure(e));
    } finally {
      setLoading(false);
    }
  };
  return (
    <section className="card" aria-labelledby="purchase-title">
      <p className="muted">SYNTHETIC NON-PRODUCTION · PRIVATE PROOF</p>
      <h1 id="purchase-title">Pilih paket dan kirim bukti pembayaran</h1>
      <label>
        ID cabang
        <input value={branchId} onChange={(e) => setBranchId(e.target.value)} />
      </label>
      <button
        disabled={loading || !branchId}
        onClick={() =>
          run(async () => {
            const items = await client.list(branchId);
            setPackages(items);
            setMessage(items.length ? 'Paket berhasil dimuat.' : 'Belum ada paket aktif.');
          })
        }
      >
        Muat paket
      </button>
      <label>
        Paket
        <select aria-label="Paket" value={selected} onChange={(e) => setSelected(e.target.value)}>
          <option value="">Pilih paket</option>
          {packages.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} · {p.sessionCount} sesi · Rp{p.priceRp}
            </option>
          ))}
        </select>
      </label>
      <form
        aria-label="Upload bukti pembayaran"
        onSubmit={(e) => {
          e.preventDefault();
          const d = new FormData(e.currentTarget);
          const sha256 = String(d.get('sha256'));
          const sizeBytes = Number(d.get('sizeBytes'));
          void run(async () => {
            const id = await client.issue({
              branchId,
              packageId: selected,
              fileName: String(d.get('fileName')),
              mimeType: String(d.get('mimeType')),
              sizeBytes,
              sha256,
            });
            setProofId(id);
            setScan('PENDING');
            const state = await client.finalize(id, sha256, sizeBytes);
            setScan(state);
            setMessage(
              state === 'CLEAN' ? 'Bukti bersih dan siap dikirim.' : `Status scan: ${state}`,
            );
          });
        }}
      >
        <label>
          Nama file
          <input name="fileName" required />
        </label>
        <label>
          MIME
          <select name="mimeType">
            <option>image/png</option>
            <option>image/jpeg</option>
            <option>application/pdf</option>
          </select>
        </label>
        <label>
          Ukuran byte
          <input name="sizeBytes" type="number" min="1" required />
        </label>
        <label>
          SHA-256
          <input name="sha256" minLength={64} maxLength={64} required />
        </label>
        <button disabled={!selected || loading}>Upload dan scan</button>
      </form>
      <p>
        Status scan: <strong>{scan || 'BELUM ADA'}</strong>
      </p>
      <button
        disabled={scan !== 'CLEAN' || loading}
        onClick={() =>
          run(async () => {
            const status = await client.submit(selected, proofId, crypto.randomUUID());
            setMessage(`Purchase ${status}.`);
          })
        }
      >
        Kirim purchase
      </button>
      {loading && <p role="status">Memproses…</p>}
      {message && !loading && <p role="status">{message}</p>}
      {error && <p role="alert">{error}</p>}
    </section>
  );
}
