import path from 'node:path';

// Load PrismaClient from apps/api
const apiPrismaPath = path.resolve(__dirname, '../../../../apps/api/node_modules/@prisma/client');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { PrismaClient } = require(apiPrismaPath);

const defaultDbUrl =
  process.env.TEST_DATABASE_URL ||
  (process.env.DATABASE_URL?.includes('3315')
    ? process.env.DATABASE_URL
    : 'mysql://dailydose:b64c0a6442c3df2f4f940459955788747a844facf4be7d9e23773bad7b592308@127.0.0.1:3315/dailydose');

export const prisma = new PrismaClient({
  datasources: {
    db: {
      url: defaultDbUrl,
    },
  },
});
