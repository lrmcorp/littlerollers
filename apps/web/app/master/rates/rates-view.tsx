'use client';

import { useCallback, useEffect, useState } from 'react';
import { Calendar, Plus, RefreshCw } from 'lucide-react';
import { useSessionContext } from '../../session-context';
import { Feedback, PageHeader } from '../../ui';
import {
  AdminEmptyState,
  Badge,
  DataTable,
  Panel,
} from '../../components/admin/admin-ui';
import { Button } from '../../components/actions';
import { SearchSelect, TextInput } from '../../components/forms';
import { formatRupiah } from '../../lib/formatters';

interface InstructorFeeItem {
  id: string;
  instructorId: string;
  instructorName: string;
  branchId: string;
  branch?: { id: string; code: string; name: string };
  classTypeId: string;
  classType?: { id: string; name: string };
  feePerJamRp: number;
  effectiveDate: string;
}

interface ProjectionRateItem {
  id: string;
  branchId: string;
  branch?: { id: string; code: string; name: string };
  classTypeId: string;
  classType?: { id: string; name: string };
  ratePerSesiRp: number;
  effectiveDate: string;
}

export function RatesView() {
  const context = useSessionContext();
  const session = context?.session;
  const branches = session?.branches ?? [];

  const [activeTab, setActiveTab] = useState<'INSTRUCTOR_FEE' | 'PROJECTION_RATE'>('INSTRUCTOR_FEE');
  const [selectedBranchId, setSelectedBranchId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Master lists
  const [instructorFees, setInstructorFees] = useState<InstructorFeeItem[]>([]);
  const [projectionRates, setProjectionRates] = useState<ProjectionRateItem[]>([]);
  const [classTypes, setClassTypes] = useState<Array<{ id: string; name: string }>>([]);
  const [instructors, setInstructors] = useState<Array<{ id: string; displayName: string }>>([]);

  // Form states: InstructorFee
  const [instInstructorId, setInstInstructorId] = useState('');
  const [instClassTypeId, setInstClassTypeId] = useState('');
  const [instFeeRp, setInstFeeRp] = useState('150000');
  const [instEffectiveDate, setInstEffectiveDate] = useState(() =>
    new Date().toISOString().slice(0, 10),
  );

  // Form states: ProjectionRate
  const [projClassTypeId, setProjClassTypeId] = useState('');
  const [projRateRp, setProjRateRp] = useState('125000');
  const [projEffectiveDate, setProjEffectiveDate] = useState(() =>
    new Date().toISOString().slice(0, 10),
  );

  useEffect(() => {
    if (branches.length > 0 && !selectedBranchId) {
      const active = branches.find((b) => b.id === context?.activeBranchId) || branches[0];
      if (active) setSelectedBranchId(active.id);
    }
  }, [branches, context?.activeBranchId, selectedBranchId]);

  const loadData = useCallback(async () => {
    if (!selectedBranchId) return;
    setLoading(true);
    setError(null);
    try {
      const [feeRes, projRes, ctRes, instRes] = await Promise.all([
        fetch(`/api/v1/master/instructor-fees?branchId=${selectedBranchId}`, { credentials: 'include' }),
        fetch(`/api/v1/master/projection-rates?branchId=${selectedBranchId}`, { credentials: 'include' }),
        fetch(`/api/v1/master/class-types?branchId=${selectedBranchId}`, { credentials: 'include' }),
        fetch(`/api/v1/instructors?branchId=${selectedBranchId}`, { credentials: 'include' }),
      ]);

      if (feeRes.ok) {
        const json = await feeRes.json();
        setInstructorFees(json.items ?? []);
      }
      if (projRes.ok) {
        const json = await projRes.json();
        setProjectionRates(json.items ?? []);
      }
      if (ctRes.ok) {
        const json = await ctRes.json();
        const items = json.items ?? [];
        setClassTypes(items.map((c: any) => ({ id: c.id, name: c.name })));
        if (items.length > 0 && !instClassTypeId) setInstClassTypeId(items[0].id);
        if (items.length > 0 && !projClassTypeId) setProjClassTypeId(items[0].id);
      }
      if (instRes.ok) {
        const json = await instRes.json();
        const items = json.items ?? [];
        setInstructors(items.map((i: any) => ({ id: i.id, displayName: i.displayName || i.name })));
        if (items.length > 0 && !instInstructorId) setInstInstructorId(items[0].id);
      }
    } catch (err: any) {
      setError(err.message || 'Gagal memuat konfigurasi tarif');
    } finally {
      setLoading(false);
    }
  }, [selectedBranchId, instClassTypeId, projClassTypeId, instInstructorId]);

  useEffect(() => {
    if (selectedBranchId) {
      void loadData();
    }
  }, [selectedBranchId, loadData]);

  const submitInstructorFee = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    try {
      const res = await fetch('/api/v1/master/instructor-fees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          branchId: selectedBranchId,
          instructorUserId: instInstructorId,
          classTypeId: instClassTypeId,
          feeRp: Number(instFeeRp),
          effectiveFrom: instEffectiveDate,
          reason: 'Konfigurasi tarif honor instruktur ber-effective-date',
        }),
      });
      if (!res.ok) throw new Error('Gagal menyimpan tarif instruktur');
      setSuccessMsg('Tarif honor instruktur berhasil disimpan.');
      void loadData();
    } catch (err: any) {
      setError(err.message || 'Gagal menyimpan tarif');
    }
  };

  const submitProjectionRate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    try {
      const res = await fetch('/api/v1/master/projection-rates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          branchId: selectedBranchId,
          classTypeId: projClassTypeId,
          rateRp: Number(projRateRp),
          effectiveFrom: projEffectiveDate,
          reason: 'Konfigurasi projection rate ber-effective-date',
        }),
      });
      if (!res.ok) throw new Error('Gagal menyimpan projection rate');
      setSuccessMsg('Projection rate berhasil disimpan.');
      void loadData();
    } catch (err: any) {
      setError(err.message || 'Gagal menyimpan rate projeksi');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Master Data Finansial"
        title="Konfigurasi Tarif Ber-Effective Date"
        description="Pengaturan Honor Instruktur (Fee/Jam) & Projection Rate Beban Sesi dengan riwayat tanggal berlaku efektif."
        context={
          <Button
            variant="secondary"
            leadingIcon={<RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />}
            onClick={() => void loadData()}
            disabled={loading}
          >
            Segarkan
          </Button>
        }
      />

      {error && <Feedback kind="error">{error}</Feedback>}
      {successMsg && <Feedback kind="status">{successMsg}</Feedback>}

      {/* FILTER CABANG */}
      <Panel className="p-4 flex items-center justify-between gap-4">
        <div className="w-72">
          <SearchSelect
            label="Cabang Studio"
            value={selectedBranchId}
            onChange={(val) => setSelectedBranchId(val)}
            options={branches.map((b) => ({ id: b.id, label: `${b.code} - ${b.name}` }))}
            placeholder="Pilih Cabang..."
          />
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('INSTRUCTOR_FEE')}
            className={`px-4 py-2 text-sm font-semibold rounded-dd-sm transition-colors ${
              activeTab === 'INSTRUCTOR_FEE'
                ? 'bg-dd-primary text-white shadow-sm'
                : 'text-dd-muted hover:bg-dd-surface-alt'
            }`}
          >
            Tarif Honor Instruktur (Fee/Jam)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('PROJECTION_RATE')}
            className={`px-4 py-2 text-sm font-semibold rounded-dd-sm transition-colors ${
              activeTab === 'PROJECTION_RATE'
                ? 'bg-dd-primary text-white shadow-sm'
                : 'text-dd-muted hover:bg-dd-surface-alt'
            }`}
          >
            Projection Rate (Rate/Sesi)
          </button>
        </div>
      </Panel>

      {/* TAB 1: INSTRUCTOR FEE */}
      {activeTab === 'INSTRUCTOR_FEE' && (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* FORM INPUT INSTRUCTOR FEE */}
          <Panel className="p-5 space-y-4">
            <h3 className="text-base font-semibold">+ Tambah Tarif Instruktur</h3>
            <form onSubmit={submitInstructorFee} className="space-y-4">
              <SearchSelect
                label="Instruktur"
                value={instInstructorId}
                onChange={(val) => setInstInstructorId(val)}
                options={instructors.map((i) => ({ id: i.id, label: i.displayName }))}
                placeholder="Pilih Instruktur..."
              />

              <SearchSelect
                label="Jenis Kelas"
                value={instClassTypeId}
                onChange={(val) => setInstClassTypeId(val)}
                options={classTypes.map((c) => ({ id: c.id, label: c.name }))}
                placeholder="Pilih Jenis Kelas..."
              />

              <TextInput
                label="Honor per Jam (Rp)"
                type="number"
                min="0"
                step="5000"
                value={instFeeRp}
                onChange={(e) => setInstFeeRp(e.target.value)}
              />

              <TextInput
                label="Tanggal Berlaku Efektif"
                type="date"
                value={instEffectiveDate}
                onChange={(e) => setInstEffectiveDate(e.target.value)}
              />

              <Button
                variant="primary"
                leadingIcon={<Plus className="h-4 w-4" />}
                type="submit"
                className="w-full"
                disabled={loading || !instInstructorId || !instClassTypeId}
              >
                Simpan Tarif Efektif
              </Button>
            </form>
          </Panel>

          {/* TABEL INSTRUCTOR FEES */}
          <Panel className="lg:col-span-2 p-5 space-y-4">
            <h3 className="text-base font-semibold">Riwayat Tarif Honor Instruktur</h3>
            {instructorFees.length === 0 ? (
              <AdminEmptyState
                title="Belum Ada Tarif Khusus"
                description="Menggunakan default fallback sistem (Rp 150.000 / jam)."
              />
            ) : (
              <DataTable<InstructorFeeItem>
                items={instructorFees}
                rowKey={(r) => r.id}
                columns={[
                  {
                    id: 'instructorName',
                    header: 'Instruktur',
                    cell: (r) => <span className="font-semibold">{r.instructorName}</span>,
                  },
                  {
                    id: 'classType',
                    header: 'Jenis Kelas',
                    cell: (r) => r.classType?.name ?? '-',
                  },
                  {
                    id: 'feePerJamRp',
                    header: 'Honor / Jam',
                    cell: (r) => (
                      <span className="font-semibold text-emerald-600">
                        {formatRupiah(r.feePerJamRp)}
                      </span>
                    ),
                  },
                  {
                    id: 'effectiveDate',
                    header: 'Berlaku Efektif',
                    cell: (r) => (
                      <Badge tone="neutral">
                        <Calendar className="mr-1 h-3 w-3 inline" />
                        {r.effectiveDate}
                      </Badge>
                    ),
                  },
                ]}
              />
            )}
          </Panel>
        </div>
      )}

      {/* TAB 2: PROJECTION RATE */}
      {activeTab === 'PROJECTION_RATE' && (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* FORM INPUT PROJECTION RATE */}
          <Panel className="p-5 space-y-4">
            <h3 className="text-base font-semibold">+ Tambah Projection Rate</h3>
            <form onSubmit={submitProjectionRate} className="space-y-4">
              <SearchSelect
                label="Jenis Kelas"
                value={projClassTypeId}
                onChange={(val) => setProjClassTypeId(val)}
                options={classTypes.map((c) => ({ id: c.id, label: c.name }))}
                placeholder="Pilih Jenis Kelas..."
              />

              <TextInput
                label="Rate Projeksi per Sesi (Rp)"
                type="number"
                min="0"
                step="5000"
                value={projRateRp}
                onChange={(e) => setProjRateRp(e.target.value)}
              />

              <TextInput
                label="Tanggal Berlaku Efektif"
                type="date"
                value={projEffectiveDate}
                onChange={(e) => setProjEffectiveDate(e.target.value)}
              />

              <Button
                variant="primary"
                leadingIcon={<Plus className="h-4 w-4" />}
                type="submit"
                className="w-full"
                disabled={loading || !projClassTypeId}
              >
                Simpan Projection Rate
              </Button>
            </form>
          </Panel>

          {/* TABEL PROJECTION RATES */}
          <Panel className="lg:col-span-2 p-5 space-y-4">
            <h3 className="text-base font-semibold">Riwayat Projection Rate Sesi</h3>
            {projectionRates.length === 0 ? (
              <AdminEmptyState
                title="Belum Ada Rate Projeksi Khusus"
                description="Menggunakan default fallback sistem (Rp 125.000 / sesi)."
              />
            ) : (
              <DataTable<ProjectionRateItem>
                items={projectionRates}
                rowKey={(r) => r.id}
                columns={[
                  {
                    id: 'classType',
                    header: 'Jenis Kelas',
                    cell: (r) => r.classType?.name ?? '-',
                  },
                  {
                    id: 'ratePerSesiRp',
                    header: 'Rate Projeksi / Sesi',
                    cell: (r) => (
                      <span className="font-semibold text-purple-600">
                        {formatRupiah(r.ratePerSesiRp)}
                      </span>
                    ),
                  },
                  {
                    id: 'effectiveDate',
                    header: 'Berlaku Efektif',
                    cell: (r) => (
                      <Badge tone="neutral">
                        <Calendar className="mr-1 h-3 w-3 inline" />
                        {r.effectiveDate}
                      </Badge>
                    ),
                  },
                ]}
              />
            )}
          </Panel>
        </div>
      )}
    </div>
  );
}
