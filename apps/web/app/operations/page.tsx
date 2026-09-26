import { OperationsView } from './operations-view';

// Job dan pengiriman email di halaman ini masih data contoh (tersimpan di memori API), sehingga
// tombol pemulihan dinonaktifkan sampai antrean job nyata tersedia.
export default function OperationsPage() {
  return <OperationsView access={{ canRecover: false }} />;
}
