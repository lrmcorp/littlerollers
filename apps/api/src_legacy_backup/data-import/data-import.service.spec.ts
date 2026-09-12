import { DataImportTemplateService } from './data-import-template.service';
import { DataImportValidatorService, isValidEmail, normalizePhone } from './data-import-validator.service';

describe('Data Import Services', () => {
  describe('Helper Functions', () => {
    it('normalizes Indonesian phone numbers correctly', () => {
      expect(normalizePhone('081234567890')).toBe('+6281234567890');
      expect(normalizePhone('6281234567890')).toBe('+6281234567890');
      expect(normalizePhone('+6281234567890')).toBe('+6281234567890');
      expect(normalizePhone('0812-3456-7890')).toBe('+6281234567890');
      expect(normalizePhone('')).toBeNull();
    });

    it('validates emails correctly', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('invalid-email')).toBe(false);
      expect(isValidEmail('')).toBe(false);
    });
  });

  describe('DataImportTemplateService', () => {
    let service: DataImportTemplateService;

    beforeEach(() => {
      service = new DataImportTemplateService();
    });

    it('generates valid xlsx templates for all tables', () => {
      const tables = ['USERS', 'PACKAGES', 'CUSTOMER_PACKAGES', 'VOUCHERS', 'BRANCHES'] as const;
      for (const table of tables) {
        const result = service.generateTemplate(table, 'xlsx');
        expect(result.filename).toMatch(/\.xlsx$/);
        expect(result.mimeType).toContain('spreadsheetml');
        expect(result.buffer.length).toBeGreaterThan(0);
      }
    });

    it('generates valid csv templates', () => {
      const result = service.generateTemplate('USERS', 'csv');
      expect(result.filename).toBe('template_import_users.csv');
      expect(result.mimeType).toBe('text/csv');
      const csvStr = result.buffer.toString('utf-8');
      expect(csvStr).toContain('Nama Lengkap');
      expect(csvStr).toContain('Email');
      expect(csvStr).toContain('Jenis Kelamin');
      expect(csvStr).toContain('Tanggal Lahir');
      expect(csvStr).toContain('Alamat');
      expect(csvStr).toContain('Barcode Member');
      expect(csvStr).toContain('Path / URL KTP');
      expect(csvStr).toContain('Path / URL Selfie');
      expect(csvStr).toContain('NIK');
      expect(csvStr).toContain('Negara');
      expect(csvStr).toContain('Foto Profil');

      const pkgResult = service.generateTemplate('PACKAGES', 'csv');
      expect(pkgResult.filename).toBe('template_import_paket.csv');
      const pkgCsvStr = pkgResult.buffer.toString('utf-8');
      expect(pkgCsvStr).toContain('Kode Paket');
      expect(pkgCsvStr).toContain('Nama Paket');
      expect(pkgCsvStr).toContain('Kategori Kelas');
      expect(pkgCsvStr).toContain('Jumlah Sesi');
      expect(pkgCsvStr).toContain('Masa Berlaku Hari');
      expect(pkgCsvStr).toContain('Harga IDR');
      expect(pkgCsvStr).toContain('Kode Cabang');
      expect(pkgCsvStr).toContain('Tampil di Publik');
      expect(pkgCsvStr).toContain('Boleh Beli Berulang');
      expect(pkgCsvStr).toContain('Kode Promo');
      expect(pkgCsvStr).toContain('Diskon %');
    });
  });
});
