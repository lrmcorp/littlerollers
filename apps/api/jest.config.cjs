module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: { '^.+\\.ts$': ['ts-jest', { tsconfig: { module: 'CommonJS' } }] },
  moduleNameMapper: {
    '^@dailydose/config$': '<rootDir>/../../../packages/config/src/index.ts',
  },
  testEnvironment: 'node',
};
