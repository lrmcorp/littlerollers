export const supportPriorityLabels: Record<string, string> = {
  LOW: 'Rendah',
  NORMAL: 'Normal',
  HIGH: 'Tinggi',
  URGENT: 'Mendesak',
};

export const supportStatusLabels: Record<string, string> = {
  OPEN: 'Terbuka',
  IN_PROGRESS: 'Diproses',
  WAITING_CUSTOMER: 'Menunggu pelanggan',
  RESOLVED: 'Selesai',
  CLOSED: 'Ditutup',
};

export const supportPriorityLabel = (value: string) => supportPriorityLabels[value] ?? value;
export const supportStatusLabel = (value: string) => supportStatusLabels[value] ?? value;
