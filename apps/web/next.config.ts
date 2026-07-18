import type { NextConfig } from 'next';
const config: NextConfig = {
  output: 'standalone',
  transpilePackages: ['@dailydose/api-client-ts'],
};
export default config;
