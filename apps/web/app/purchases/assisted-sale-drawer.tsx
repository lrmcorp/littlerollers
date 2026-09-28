'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  assistedPaymentMethodLabels,
  assistedSaleFailure,
  browserAssistedSaleClient,
  type AssistedPaymentMethod,
  type AssistedSaleClient,
  type Purchase,
} from '@/api-clients/purchase-client';
import { customerClient } from '../customers/customer-client';
import { Feedback } from '../ui';
import { Button } from '../components/actions';
import { Drawer, useAppFeedback } from '../components/app-feedback';
import { AsyncSearchSelect, SelectInput, TextInput, type SearchSelectOption } from '../components/forms';
import { formatRupiah } from '../lib/formatters';

type PackageOption = SearchSelectOption & { priceRp: number };

/**
 * Penjualan manual di meja. Staf mencatat pembayaran yang diterima; paket baru aktif setelah
 * penyetuju LAIN menyetujuinya di antrean Pembayaran (pencatat tidak boleh menyetujui sendiri).
 */
export function AssistedSaleDrawer({
  open,
  branch,
  customer,
  client = browserAssistedSaleClient,
  onClose,
  onRecorded,
}: {
  open: boolean;
  branch: { id: string; name: string };
  /** Bila diisi, pelanggan terkunci (dibuka dari halaman detail pelanggan). */
  customer?: { id: string; name: string };
  client?: AssistedSaleClient;
  onClose(): void;
  onRecorded?(purchase: Purchase): void;
}) {
  const feedback = useAppFeedback();
  const [customerOption, setCustomerOption] = useState<SearchSelectOption | undefined>(
    customer ? { id: customer.id, label: customer.name } : undefined,
  );
  const [packageOption, setPackageOption] = useState<PackageOption>();
  const [method, setMethod] = useState<AssistedPaymentMethod>('CASH');
  const [voucherCode, setVoucherCode] = useState('');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState('');
  const idempotencyKey = useRef<string | undefined>(undefined);
  const dirty = Boolean(
    (!customer && customerOption) || packageOption || voucherCode.trim() || note.trim(),
  );

  useEffect(() => {
    if (!open) return;
    setCustomerOption(customer ? { id: customer.id, label: customer.name } : undefined);
    setPackageOption(undefined);
    setMethod('CASH');
    setVoucherCode('');
    setNote('');
    setFailure('');
    idempotencyKey.current = undefined;
  }, [open, customer]);

  const searchCustomers = useCallback(async (query: string) => {
    const result = await customerClient.list({ q: query || undefined, status: 'ACTIVE' });
    return {
      items: result.items.map((item) => ({
        id: item.id,
        label: item.displayName,
        description: [item.phoneE164, item.email].filter(Boolean).join(' · ') || undefined,
      })),
      nextCursor: result.page.nextCursor ?? undefined,
    };
  }, []);

  const searchPackages = useCallback(
    async (query: string) => {
      const packages = await client.searchPackages(query);
      return packages
        .filter((pkg) => !pkg.branchId || pkg.branchId === branch.id)
        .map<PackageOption>((pkg) => ({
          id: pkg.id,
          label: pkg.name,
          description: `${formatRupiah(pkg.priceRp)} · ${pkg.sessionCount} sesi · ${pkg.durationDays} hari`,
          priceRp: pkg.priceRp,
        }));
    },
    [client, branch.id],
  );

  const ready = Boolean(customerOption && packageOption);

  const submit = async () => {
    if (!customerOption || !packageOption) return;
    const accepted = await feedback.confirm({
      tone: 'warning',
      title: 'Catat penjualan paket?',
      message: `${packageOption.label} untuk ${customerOption.label} (${formatRupiah(packageOption.priceRp)}, ${assistedPaymentMethodLabels[method]}). Paket aktif setelah penyetuju lain menyetujuinya di antrean Pembayaran.`,
      confirmLabel: 'Catat penjualan',
    });
    if (!accepted) return;
    setBusy(true);
    setFailure('');
    idempotencyKey.current ??= crypto.randomUUID();
    try {
      const purchase = await client.record(
        {
          customerUserId: customerOption.id,
          packageId: packageOption.id,
          branchId: branch.id,
          paymentMethod: method,
          voucherCode: voucherCode.trim() || undefined,
          note: note.trim() || undefined,
        },
        idempotencyKey.current,
      );
      feedback.showToast({
        tone: 'success',
        title: 'Penjualan dicatat',
        message: 'Menunggu persetujuan penyetuju lain di antrean Pembayaran.',
      });
      onRecorded?.(purchase);
      onClose();
    } catch (error) {
      setFailure(assistedSaleFailure(error));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Drawer
      open={open}
      title="Catat penjualan paket"
      description={`Penjualan di meja untuk cabang ${branch.name}.`}
      busy={busy}
      dirty={dirty}
      onDirtyClose={() =>
        feedback.confirm({
          tone: 'warning',
          title: 'Buang isian penjualan?',
          message: 'Data yang belum dicatat akan hilang.',
          confirmLabel: 'Buang',
        })
      }
      onClose={onClose}
      footer={
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" disabled={busy} onClick={onClose}>
            Batal
          </Button>
          <Button type="submit" form="assisted-sale-form" loading={busy} disabled={!ready}>
            Catat penjualan
          </Button>
        </div>
      }
    >
      <form
        id="assisted-sale-form"
        className="grid gap-4"
        onSubmit={(event) => {
          event.preventDefault();
          void submit();
        }}
      >
        {customer ? (
          <TextInput label="Pelanggan" value={customer.name} readOnly />
        ) : (
          <AsyncSearchSelect
            label="Pelanggan"
            required
            value={customerOption?.id ?? ''}
            selectedOption={customerOption}
            placeholder="Cari nama, email, atau telepon"
            loadOptions={searchCustomers}
            onChange={(_id, option) => setCustomerOption(option)}
          />
        )}
        <AsyncSearchSelect
          label="Paket"
          required
          value={packageOption?.id ?? ''}
          selectedOption={packageOption}
          placeholder="Pilih paket aktif"
          loadOptions={searchPackages}
          onChange={(_id, option) => setPackageOption(option as PackageOption | undefined)}
        />
        <SelectInput
          label="Metode pembayaran"
          value={method}
          onChange={(event) => setMethod(event.target.value as AssistedPaymentMethod)}
        >
          {Object.entries(assistedPaymentMethodLabels).map(([value, label]) => (
            <option value={value} key={value}>
              {label}
            </option>
          ))}
        </SelectInput>
        <TextInput
          label="Kode voucher (opsional)"
          value={voucherCode}
          maxLength={40}
          onChange={(event) => setVoucherCode(event.target.value)}
        />
        <TextInput
          label="Catatan (opsional)"
          value={note}
          maxLength={200}
          placeholder="Contoh: dibayar tunai di meja resepsionis"
          onChange={(event) => setNote(event.target.value)}
        />
        <Feedback kind="info">
          Penjualan dicatat dengan status menunggu. Pencatat tidak dapat menyetujui penjualannya
          sendiri; persetujuan dilakukan oleh Finance atau Manager di antrean Pembayaran.
        </Feedback>
        {failure && <Feedback kind="error">{failure}</Feedback>}
      </form>
    </Drawer>
  );
}
