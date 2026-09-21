'use client';

import { useCallback, useEffect, useState } from 'react';
import { Calendar, CircleDollarSign, RefreshCw, Users } from 'lucide-react';
import { PageHeader } from '../../ui';
import { Badge, DataTable, Panel, StatCard } from '../../components/admin/admin-ui';
import { Button } from '../../components/actions';
import { SearchSelect } from '../../components/forms';
import { useSessionContext } from '../../session-context';
import { formatRupiah } from '../../lib/formatters';

interface InstructorBreakdown {
  instructorId: string;
  instructorName: string;
  groupHours: number;
  groupFeeRp: number;
  semiPrivateHours: number;
  semiPrivateFeeRp: number;
  privateHours: number;
  privateFeeRp: number;
  totalHours: number;
  totalFeeRp: number;
}

interface PerformanceData {
  branch: {
    id: string;
    code: string;
    name: string;
  };
  period: string;
  omsetRp: number;
  otherCostRp: number;
  totalInstructorFeeRp: number;
  estimatedProfitRp: number;
  instructorCount: number;
  totalClassHours: number;
  instructors: InstructorBreakdown[];
}

export function OwnerBranchPerformanceView() {
  const context = useSessionContext();
  const session = context?.session;
  const branches = session?.branches ?? [];

  const [selectedBranchId, setSelectedBranchId] = useState<string>('');
  const [selectedPeriod, setSelectedPeriod] = useState<string>(() =>
    new Date().toISOString().slice(0, 7),
  );
  const [data, setData] = useState<PerformanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (branches.length > 0 && !selectedBranchId) {
      const first = branches[0];
      if (first) setSelectedBranchId(first.id);
    }
  }, [branches, selectedBranchId]);

  const loadData = useCallback(async () => {
    if (!selectedBranchId) return;
    setLoading(true);
    setError(null);
    try {
      const query = new URLSearchParams({
        branchId: selectedBranchId,
        period: selectedPeriod,
      });
      const res = await fetch(`/api/v1/finance/owner-branch-performance?${query.toString()}`, {
        headers: { 'Content-Type': 'application/json' },
      });
      if (!res.ok) {
        if (res.status === 403) {
          throw new Error('Anda tidak memiliki wewenang untuk mengakses cabang ini.');
        }
        throw new Error('Gagal memuat data performa cabang.');
      }
      const json = await res.json();
      setData(json);
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan sistem.');
    } finally {
      setLoading(false);
    }
  }, [selectedBranchId, selectedPeriod]);

  useEffect(() => {
    if (selectedBranchId) {
      void loadData();
    }
  }, [selectedBranchId, selectedPeriod, loadData]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Owner Cabang / Finansial"
        title="Performa Cabang Privat"
        description="Laporan Omset, Estimasi Profit, dan Rincian Biaya Mengajar Instruktur untuk Owner Cabang (Keputusan Bisnis #7 & #10)"
        context={
          <Button
            variant="secondary"
            leadingIcon={<RefreshCw className={`size-4 ${loading ? 'animate-spin' : ''}`} aria-hidden="true" />}
            onClick={loadData}
            disabled={loading}
          >
            Perbarui
          </Button>
        }
      />

      {/* Filter Cabang & Periode */}
      <div className="flex flex-wrap items-center gap-4 rounded-dd-lg border border-dd-line bg-dd-surface p-4 shadow-dd-card">
        <div className="min-w-64">
          <SearchSelect
            label="Cabang"
            options={branches.map((b) => ({
              id: b.id,
              label: `${b.code} - ${b.name}`,
            }))}
            value={selectedBranchId}
            onChange={(val) => setSelectedBranchId(val)}
            compact
          />
        </div>

        <div className="flex items-center gap-2 pt-5">
          <Calendar className="size-4 text-dd-muted" />
          <label htmlFor="period-select" className="text-xs font-semibold text-dd-muted">
            Periode:
          </label>
          <input
            id="period-select"
            type="month"
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="rounded-dd border border-dd-line bg-dd-surface px-3 py-1.5 text-sm font-medium text-dd-foreground focus:outline-none focus:ring-2 focus:ring-dd-brand"
          />
        </div>
      </div>

      {error && (
        <div className="rounded-dd-lg border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      {/* Ringkasan Finansial */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Omset Cabang"
          value={formatRupiah(data?.omsetRp ?? 0)}
          tone="success"
        />
        <StatCard
          label="Biaya Instruktur (Realtime)"
          value={formatRupiah(data?.totalInstructorFeeRp ?? 0)}
          tone="neutral"
        />
        <StatCard
          label="Biaya Operasional (Other Cost)"
          value={formatRupiah(data?.otherCostRp ?? 0)}
          tone="warning"
        />
        <StatCard
          label="Estimasi Profit"
          value={formatRupiah(data?.estimatedProfitRp ?? 0)}
          tone={(data?.estimatedProfitRp ?? 0) >= 0 ? 'success' : 'danger'}
        />
      </div>

      {/* Tabel Rincian Biaya Mengajar Instruktur (Rule #10) */}
      <Panel>
        <div className="border-b border-dd-line p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-dd-foreground">
                Detail Biaya Mengajar Instruktur (Rule #10)
              </h3>
              <p className="text-xs text-dd-muted">
                Daftar jam mengajar dan akumulasi honor instruktur per tipe kelas di cabang ini.
              </p>
            </div>
            <Badge tone="info">
              {data?.instructorCount ?? 0} Instruktur • {data?.totalClassHours ?? 0} Jam
            </Badge>
          </div>
        </div>

        <DataTable
          columns={[
            {
              id: 'instructorName',
              header: 'Nama Instruktur',
              cell: (item: InstructorBreakdown) => (
                <div className="font-semibold text-dd-foreground">{item.instructorName}</div>
              ),
            },
            {
              id: 'groupClass',
              header: 'Group Class',
              cell: (item: InstructorBreakdown) => (
                <div>
                  <span className="font-medium">{item.groupHours} jam</span>
                  <div className="text-xs text-dd-muted">{formatRupiah(item.groupFeeRp)}</div>
                </div>
              ),
            },
            {
              id: 'semiPrivate',
              header: 'Semi Private',
              cell: (item: InstructorBreakdown) => (
                <div>
                  <span className="font-medium">{item.semiPrivateHours} jam</span>
                  <div className="text-xs text-dd-muted">{formatRupiah(item.semiPrivateFeeRp)}</div>
                </div>
              ),
            },
            {
              id: 'private',
              header: 'Private',
              cell: (item: InstructorBreakdown) => (
                <div>
                  <span className="font-medium">{item.privateHours} jam</span>
                  <div className="text-xs text-dd-muted">{formatRupiah(item.privateFeeRp)}</div>
                </div>
              ),
            },
            {
              id: 'totalHours',
              header: 'Total Jam',
              cell: (item: InstructorBreakdown) => (
                <div className="font-bold text-dd-foreground">{item.totalHours} jam</div>
              ),
            },
            {
              id: 'totalFee',
              header: 'Total Honor (Rp)',
              cell: (item: InstructorBreakdown) => (
                <div className="font-bold text-dd-brand">{formatRupiah(item.totalFeeRp)}</div>
              ),
            },
          ]}
          items={data?.instructors ?? []}
          rowKey={(item) => item.instructorId}
          emptyTitle="Belum ada catatan mengajar"
          emptyDescription="Belum ada catatan kelas mengajar instruktur pada periode ini."
        />
      </Panel>
    </div>
  );
}
