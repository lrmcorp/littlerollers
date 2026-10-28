import { resolve } from 'node:path';
import { defineConfig } from 'vitest/config';

// Studio beroperasi di WIB, dan beberapa tes (rentang tanggal laporan dan ekspor audit) mengubah tanggal lokal ke
// UTC. Tanpa ini hasilnya bergantung pada zona waktu mesin: lolos di laptop (WIB), gagal di runner CI (UTC).
// Diatur di proses utama sebelum pekerja uji dibuat, sehingga semua pekerja mewarisinya.
process.env.TZ = 'Asia/Jakarta';

export default defineConfig({
  esbuild: { jsx: 'automatic' },
  resolve: {
    alias: {
      '@': resolve(__dirname, './app'),
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    exclude: ['e2e/**', 'node_modules/**', '.next/**'],
    maxWorkers: 3,
    minWorkers: 1,
  },
});
