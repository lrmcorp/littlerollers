const path = require('path');

// Dua proyek: `unit` tidak menyentuh database (cepat, paralel); `integration` memakai MySQL nyata
// (`*.integration.spec.ts`), dijalankan berurutan dan diperiksa dulu di global setup.
const base = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: path.resolve(__dirname, 'src'),
  transform: { '^.+\\.ts$': ['ts-jest', { tsconfig: { module: 'CommonJS' } }] },
  moduleNameMapper: {
    '^@dailydose/config$': '<rootDir>/../../../packages/config/src/index.ts',
  },
  testEnvironment: 'node',
};

module.exports = {
  projects: [
    {
      ...base,
      displayName: 'unit',
      testRegex: '.*\\.spec\\.ts$',
      testPathIgnorePatterns: ['/node_modules/', '\\.integration\\.spec\\.ts$'],
      setupFiles: ['<rootDir>/../jest.setup.unit.cjs'],
    },
    {
      ...base,
      displayName: 'integration',
      testRegex: '.*\\.integration\\.spec\\.ts$',
      // Koneksi pertama ke MySQL bisa lambat saat mesin sibuk; hook mengikuti batas ini.
      testTimeout: 60_000,
      setupFiles: ['<rootDir>/../jest.setup.cjs'],
      globalSetup: '<rootDir>/../jest.integration.global-setup.cjs',
    },
  ],
};
