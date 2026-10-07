#!/usr/bin/env node

/**
 * Daily Dose Pilates Studio Management System v2.0
 * Autonomous Automation & Background Cron Worker Daemon
 * 
 * Menjalankan siklus otomasi secara mandiri:
 * 1. Auto-Cancel Evaluator: Pembatalan kelas kurang kuota pada jendela H-24 (Aturan Bisnis #4 & #5)
 * 2. WhatsApp Reminders Batch: Admin Digest 3 Jam, Owner Recap 3 Hari, & Customer Expiry Reminder (Aturan Bisnis #11, #12, #13)
 * 
 * Penggunaan:
 *   node scripts/automation-daemon.mjs          -> Menjalankan continuous daemon loop
 *   node scripts/automation-daemon.mjs --once   -> Menjalankan satu putaran evaluasi (untuk crontab/cronjob)
 */

const API_BASE = process.env.API_BASE_URL || 'http://localhost:32121/api/v1';
const SUPER_OWNER_EMAIL = process.env.DAEMON_AUTH_EMAIL || 'superowner@dailydose.test';
const SUPER_OWNER_PASSWORD = process.env.DAEMON_AUTH_PASSWORD || 'SuperOwner123!';

const AUTO_CANCEL_INTERVAL_MS = 15 * 60 * 1000; // Setiap 15 Menit
const REMINDER_BATCH_INTERVAL_MS = 60 * 60 * 1000; // Setiap 60 Menit

let token = null;
let tokenExpiresAt = 0;

function log(level, message, data = null) {
  const ts = new Date().toISOString();
  const prefix = `[${ts}] [${level.toUpperCase()}] [AUTOMATION-DAEMON]`;
  if (data) {
    console.log(`${prefix} ${message}`, JSON.stringify(data));
  } else {
    console.log(`${prefix} ${message}`);
  }
}

async function getAuthToken() {
  if (token && Date.now() < tokenExpiresAt - 60_000) {
    return token;
  }

  try {
    const res = await fetch(`${API_BASE}/auth/password/sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: SUPER_OWNER_EMAIL,
        password: SUPER_OWNER_PASSWORD,
        channel: 'MOBILE',
      }),
    });

    if (!res.ok) {
      throw new Error(`Autentikasi daemon gagal (HTTP ${res.status}): ${await res.text()}`);
    }

    const data = await res.json();
    token = data.accessToken;
    tokenExpiresAt = Date.now() + 14 * 60 * 1000; // 14 Menit lease
    log('info', `Berhasil otentikasi daemon service account: ${SUPER_OWNER_EMAIL}`);
    return token;
  } catch (err) {
    log('error', `Gagal otentikasi daemon service account: ${err.message}`);
    throw err;
  }
}

async function triggerAutoCancel() {
  try {
    const authToken = await getAuthToken();
    const res = await fetch(`${API_BASE}/operations/auto-cancel/evaluate`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      log('warn', `Evaluasi Auto-Cancel gagal (HTTP ${res.status}): ${await res.text()}`);
      return;
    }

    const json = await res.json();
    log('info', 'Evaluasi Auto-Cancel H-24 Berhasil Dijalankan:', json.data);
  } catch (err) {
    log('error', `Eksekusi Auto-Cancel terganggu: ${err.message}`);
  }
}

async function triggerRemindersBatch() {
  try {
    const authToken = await getAuthToken();
    const res = await fetch(`${API_BASE}/operations/reminders/evaluate-batch`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      log('warn', `Evaluasi Batch Reminders gagal (HTTP ${res.status}): ${await res.text()}`);
      return;
    }

    const json = await res.json();
    log('info', 'Evaluasi Batch Reminders WhatsApp Berhasil Dijalankan:', json.data);
  } catch (err) {
    log('error', `Eksekusi Batch Reminders terganggu: ${err.message}`);
  }
}

async function runOnce() {
  log('info', 'Menjalankan evaluasi tunggal (--once)...');
  await triggerAutoCancel();
  await triggerRemindersBatch();
  log('info', 'Siklus tunggal selesai dieksekusi.');
}

async function startDaemon() {
  log('info', 'Memulai Autonomous Worker Daemon untuk Daily Dose Pilates v2.0...');
  log('info', `Target Backend: ${API_BASE}`);
  log('info', `Interval Auto-Cancel: ${AUTO_CANCEL_INTERVAL_MS / 60000} menit | Interval Reminders: ${REMINDER_BATCH_INTERVAL_MS / 60000} menit`);

  // Jalankan segera saat pertama kali start
  await triggerAutoCancel();
  await triggerRemindersBatch();

  const cancelTimer = setInterval(triggerAutoCancel, AUTO_CANCEL_INTERVAL_MS);
  const reminderTimer = setInterval(triggerRemindersBatch, REMINDER_BATCH_INTERVAL_MS);

  const shutdown = () => {
    log('info', 'Menerima sinyal termination, menghentikan daemon...');
    clearInterval(cancelTimer);
    clearInterval(reminderTimer);
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

const isOnce = process.argv.includes('--once');
if (isOnce) {
  runOnce().catch((e) => {
    log('error', `Fatal error on single run: ${e.message}`);
    process.exit(1);
  });
} else {
  startDaemon().catch((e) => {
    log('error', `Fatal error on daemon start: ${e.message}`);
    process.exit(1);
  });
}
