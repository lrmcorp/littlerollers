import 'reflect-metadata';
import { PrismaClient } from '@prisma/client';
import { loadRuntimeConfig } from '@dailydose/config';
import { NotificationProjectionWorker } from './notification-projection-worker';

const config = loadRuntimeConfig(process.env);
const database = new PrismaClient();
const configuredPoll = Number(process.env.DD_NOTIFICATION_PROJECTION_POLL_MS ?? '1000');
if (!Number.isInteger(configuredPoll) || configuredPoll < 100 || configuredPoll > 60_000)
  throw new Error('CONFIGURATION_INVALID:DD_NOTIFICATION_PROJECTION_POLL_MS');

const projection = new NotificationProjectionWorker(database, configuredPoll, config.email);
let closing = false;
const close = async () => {
  if (closing) return;
  closing = true;
  projection.stop();
  await database.$disconnect();
  process.exit(0);
};

process.once('SIGINT', () => void close());
process.once('SIGTERM', () => void close());
projection.start();
