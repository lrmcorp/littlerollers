import { HttpStatus, Injectable } from '@nestjs/common';
import * as XLSX from 'xlsx';
import { ApiProblem } from '../identity/security';
import type { ImportTargetTable } from './data-import.types';

interface TemplateDefinition {
  filename: string;
  sheetName: string;
  sampleRows: Record<string, string | number>[];
}

const TEMPLATES: Record<ImportTargetTable, TemplateDefinition> = {
  USERS: {
    filename: 'template_import_users.xlsx',
    sheetName: 'Users',
    sampleRows: [
      {
        'Nama Lengkap': 'Budi Santoso',
        'Email': 'budi.santoso@example.com',
        'No WhatsApp': '081234567890',
        'Role': 'CUSTOMER',
        'Kode Cabang': 'UNTAR',
        'Status': 'ACTIVE',
        'Jenis Kelamin': 'PRIA',
        'Tanggal Lahir': '1990-05-15',
        'Alamat': 'Jl. Tanjung Duren Barat No. 1, Jakarta Barat',
        'Barcode Member': 'DD-890123',
        'Path / URL KTP': 'foto_ktp/1769778562_istockphoto-2173059563-612x612.jpg',
        'Path / URL Selfie': 'foto_selfie/1769778563_istockphoto-2173059563-612x612.jpg',
        'NIK': '3174011505900001',
        'Negara': 'ID',
        'Foto Profil': 'foto_profil/1769778564_avatar.jpg',
      },
      {
        'Nama Lengkap': 'Siti Rahma',
        'Email': 'siti.rahma@dailydose.local',
        'No WhatsApp': '081298765432',
        'Role': 'INSTRUCTOR',
        'Kode Cabang': 'DD-JKT',
        'Status': 'ACTIVE',
        'Jenis Kelamin': 'WANITA',
        'Tanggal Lahir': '1995-08-20',
        'Alamat': 'Jl. Senopati No. 45, Jakarta Selatan',
        'Barcode Member': 'DD-890124',
        'Path / URL KTP': '',
        'Path / URL Selfie': '',
        'NIK': '',
        'Negara': 'ID',
        'Foto Profil': '',
      },
    ],
  },
  PACKAGES: {
    filename: 'template_import_paket.xlsx',
    sheetName: 'PaketKelas',
    sampleRows: [
      {
        'Kode Paket': 'GRP-10X',
        'Nama Paket': 'Group Reformer 10 Sesi',
        'Kategori Kelas': 'GROUP',
        'Jumlah Sesi': 10,
        'Masa Berlaku Hari': 60,
        'Harga IDR': 2500000,
        'Kode Cabang': 'GLOBAL',
        'Tampil di Publik': 'YA',
        'Boleh Beli Berulang': 'YA',
        'Kode Promo': '',
        'Diskon %': 0,
      },
      {
        'Kode Paket': 'PVT-05X',
        'Nama Paket': 'Private 1-on-1 Pilates 5 Sesi',
        'Kategori Kelas': 'PRIVATE',
        'Jumlah Sesi': 5,
        'Masa Berlaku Hari': 45,
        'Harga IDR': 3750000,
        'Kode Cabang': 'UNTAR, SBY',
        'Tampil di Publik': 'YA',
        'Boleh Beli Berulang': 'TIDAK',
        'Kode Promo': 'VALSDAY',
        'Diskon %': 10,
      },
    ],
  },
  CUSTOMER_PACKAGES: {
    filename: 'template_import_kuota_member.xlsx',
    sheetName: 'KuotaMember',
    sampleRows: [
      {
        'Email Pelanggan': 'budi.santoso@example.com',
        'Kode Paket': 'GRP-10X',
        'Sisa Sesi': 8,
        'Tanggal Kadaluwarsa': '2026-12-31',
        'Kode Cabang': 'UNTAR',
      },
      {
        'Email Pelanggan': 'siti.rahma@dailydose.local',
        'Kode Paket': 'PVT-05X',
        'Sisa Sesi': 5,
        'Tanggal Kadaluwarsa': '2026-11-30',
        'Kode Cabang': 'UNTAR',
      },
    ],
  },
  VOUCHERS: {
    filename: 'template_import_vouchers.xlsx',
    sheetName: 'Vouchers',
    sampleRows: [
      {
        'Kode Voucher': 'WELCOME20',
        'Nama Promo': 'Diskon Member Baru 20%',
        'Tipe Diskon': 'PERCENTAGE',
        'Nilai Diskon': 20,
        'Maksimal Pakai': 100,
        'Berlaku Hingga': '2026-12-31',
        'Kode Cabang': 'GLOBAL',
      },
      {
        'Kode Voucher': 'HEMAT50K',
        'Nama Promo': 'Potongan 50 Ribu Sesi Pertama',
        'Tipe Diskon': 'FIXED_AMOUNT',
        'Nilai Diskon': 50000,
        'Maksimal Pakai': 50,
        'Berlaku Hingga': '2026-10-31',
        'Kode Cabang': 'UNTAR',
      },
    ],
  },
  BRANCHES: {
    filename: 'template_import_cabang.xlsx',
    sheetName: 'CabangStudio',
    sampleRows: [
      {
        'Kode Cabang': 'UNTAR',
        'Nama Cabang': 'Universitas Tarumanagara - Kampus 2',
        'Zona Waktu': 'Asia/Jakarta',
        'Alamat': 'Jl. Tanjung Duren Barat No. 1',
        'No Kontak': '+6289506909801',
        'Nama Studio': 'Main Studio',
        'Kapasitas': 12,
      },
      {
        'Kode Cabang': 'DD-BSD',
        'Nama Cabang': 'Daily Dose Pilates BSD Serpong',
        'Zona Waktu': 'Asia/Jakarta',
        'Alamat': 'Ruko Foresta BSD Blok B',
        'No Kontak': '+6281122334455',
        'Nama Studio': 'Reformer Studio',
        'Kapasitas': 8,
      },
    ],
  },
};

@Injectable()
export class DataImportTemplateService {
  generateTemplate(
    targetTable: ImportTargetTable,
    format: 'xlsx' | 'csv' = 'xlsx',
  ): { buffer: Buffer; filename: string; mimeType: string } {
    const config = TEMPLATES[targetTable];
    if (!config) {
      throw new ApiProblem('UNSUPPORTED_TARGET_TABLE', HttpStatus.BAD_REQUEST);
    }

    const ws = XLSX.utils.json_to_sheet(config.sampleRows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, config.sheetName);

    if (format === 'csv') {
      const csvContent = XLSX.utils.sheet_to_csv(ws);
      const buffer = Buffer.from(csvContent, 'utf-8');
      return {
        buffer,
        filename: config.filename.replace('.xlsx', '.csv'),
        mimeType: 'text/csv',
      };
    }

    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    return {
      buffer,
      filename: config.filename,
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    };
  }
}
