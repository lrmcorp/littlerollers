import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const toolDirectory = dirname(fileURLToPath(import.meta.url));
const repositoryRoot = join(toolDirectory, '..');

function quoted(value) {
  return `\`${String(value).replaceAll('`', '``')}\``;
}

function columnType(table, column) {
  if (column === 'id')
    return table === 'notifications'
      ? 'VARCHAR(36) NOT NULL'
      : 'BIGINT UNSIGNED NOT NULL AUTO_INCREMENT';
  if (
    column.startsWith('id_') ||
    column.endsWith('_id') ||
    ['model_id', 'subject_id', 'causer_id', 'notifiable_id'].includes(column)
  )
    return ['model_has_roles', 'model_has_permissions', 'role_has_permissions'].includes(table)
      ? 'BIGINT UNSIGNED NOT NULL'
      : 'BIGINT UNSIGNED NULL';
  if (
    column === 'model_type' &&
    ['model_has_roles', 'model_has_permissions'].includes(table)
  )
    return 'VARCHAR(255) NOT NULL';
  if (
    column.endsWith('_at') ||
    column.startsWith('tanggal') ||
    ['expired', 'expired_date', 'datetime_avaiable', 'jadwal', 'jam_mulai'].includes(column)
  )
    return 'DATETIME NULL';
  if (['jam_open', 'jam_close', 'jam'].includes(column)) return 'TIME NULL';
  if (
    column.startsWith('is_') ||
    ['status', 'rating', 'jumlah_pertemuan', 'sisa', 'harga', 'saldo', 'jumlah_uang', 'tipe', 'disc_harga', 'disc_percent', 'lama_aktif', 'sekali_gunakan', 'status_digunakan', 'valid_day', 'duration', 'min_anggota', 'max_anggota', 'max_peserta', 'honor', 'fee', 'level'].includes(column)
  )
    return 'BIGINT NULL';
  if (['payload', 'exception', 'properties', 'data', 'description', 'deskripsi', 'keterangan', 'alamat'].includes(column))
    return 'LONGTEXT NULL';
  return 'VARCHAR(255) NULL';
}

export async function syntheticV1FixtureSql() {
  const contract = JSON.parse(
    await readFile(join(repositoryRoot, 'apps/api/prisma/v1-schema-contract.json'), 'utf8'),
  );
  const statements = ['SET FOREIGN_KEY_CHECKS=0'];
  for (const [table, definition] of Object.entries(contract.tables)) {
    const columns = definition.columns.map(
      (column) => `${quoted(column)} ${columnType(table, column)}`,
    );
    if (definition.columns.includes('id')) columns.push('PRIMARY KEY (`id`)');
    else if (table === 'model_has_roles')
      columns.push('PRIMARY KEY (`role_id`,`model_type`,`model_id`)');
    else if (table === 'model_has_permissions')
      columns.push('PRIMARY KEY (`permission_id`,`model_type`,`model_id`)');
    else if (table === 'role_has_permissions')
      columns.push('PRIMARY KEY (`permission_id`,`role_id`)');
    statements.push(`CREATE TABLE ${quoted(table)} (${columns.join(',')}) ENGINE=InnoDB`);
  }
  const timestamp = '2026-01-01 00:00:00';
  statements.push(
    `INSERT INTO locations (id,nama,deskripsi,no_hp,alamat,email,url_location,image,created_at,updated_at,deleted_at,nama_bank,no_rekening,atas_nama) VALUES (1,'Synthetic Branch','Integration-only branch','081234567890','Synthetic address','branch@example.test','','legacy/branch.jpg','${timestamp}','${timestamp}',NULL,'TEST BANK','0000','SYNTHETIC')`,
    `INSERT INTO location_studios (id,id_location,nama,equipment,image,created_at,updated_at,deleted_at,no_hp) VALUES (1,1,'Synthetic Studio','Mat','legacy/studio.jpg','${timestamp}','${timestamp}',NULL,'081234567890')`,
    `INSERT INTO ruangans (id,id_location_studio,nama_ruangan,max_peserta,created_at,updated_at,deleted_at) VALUES (1,1,'Room A',20,'${timestamp}','${timestamp}',NULL)`,
    `INSERT INTO location_openings (id,hari,id_location,jam_open,jam_close,created_at,updated_at,deleted_at) VALUES (1,1,1,'08:00:00','20:00:00','${timestamp}','${timestamp}',NULL)`,
    `INSERT INTO roles (id,name,guard_name,created_at,updated_at) VALUES (1,'customer','web','${timestamp}','${timestamp}'),(2,'instructor','web','${timestamp}','${timestamp}')`,
    `INSERT INTO permissions (id,name,guard_name,created_at,updated_at) VALUES (1,'booking-view','web','${timestamp}','${timestamp}')`,
    `INSERT INTO role_has_permissions (permission_id,role_id) VALUES (1,1)`,
    `INSERT INTO users (id,name,email,email_verified_at,password,remember_token,created_at,updated_at,no_hp,alamat,status,foto,deleted_at,jenis_kelamin,negara,tanggal_lahir,id_location,rating,ktp,selfie,nik,barcode,google_id) VALUES (1,'Synthetic Customer','customer@example.test','${timestamp}','$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',NULL,'${timestamp}','${timestamp}','081298765432','Synthetic address',1,'legacy/profile.jpg',NULL,1,'Indonesia','1990-01-01',1,0,'legacy/ktp.jpg','legacy/selfie.jpg','SYNTHETIC-NIK','SYN-001',NULL),(2,'Synthetic Instructor','instructor@example.test','${timestamp}','$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',NULL,'${timestamp}','${timestamp}','081298765433','Synthetic address',1,NULL,NULL,1,'Indonesia','1991-01-01',1,5,NULL,NULL,'SYNTHETIC-NIK-2','SYN-002',NULL)`,
    "INSERT INTO model_has_roles (role_id,model_type,model_id) VALUES (1,'App\\\\Models\\\\User',1),(2,'App\\\\Models\\\\User',2)",
    "INSERT INTO model_has_permissions (permission_id,model_type,model_id) VALUES (1,'App\\\\Models\\\\User',1)",
    `INSERT INTO kelas (id,is_active,min_anggota,max_anggota,keterangan,nama_kelas,created_at,updated_at,deleted_at,duration,bawaan,type,honor,fee,id_location) VALUES (1,1,1,20,'Synthetic class','Pilates','${timestamp}','${timestamp}',NULL,60,'Mat','GROUP',0,0,1)`,
    `INSERT INTO pakets (id,nama,jumlah_pertemuan,harga,valid_day,promote_code,diskon,created_at,updated_at,deleted_at,id_kelas,is_many_times,is_show_public) VALUES (1,'Ten Sessions',10,100000,30,NULL,0,'${timestamp}','${timestamp}',NULL,1,1,1)`,
    `INSERT INTO paket_locations (id,id_paket,id_location,created_at,updated_at,deleted_at) VALUES (1,1,1,'${timestamp}','${timestamp}',NULL)`,
    `INSERT INTO kelas_pakets (id,id_kelas,id_paket,created_at,updated_at,deleted_at) VALUES (1,1,1,'${timestamp}','${timestamp}',NULL)`,
    `INSERT INTO order_pakets (id,id_user,id_paket,harga,status,is_active,expired_date,created_at,updated_at,deleted_at,tanggal_pembayaran,bukti_pembayaran,jumlah_pertemuan,sisa,id_location,unix_code,metode_pembayaran) VALUES (1,1,1,100000,1,1,'2026-02-01 00:00:00','${timestamp}','${timestamp}',NULL,'${timestamp}','legacy/payment.jpg',10,8,1,'SYN001','TRANSFER')`,
    `INSERT INTO kelas_activities (id,id_kelas,id_location_studio,jam_mulai,id_user,status,created_at,updated_at,deleted_at,nama_latihan,level,tanggal,user_update,rating) VALUES (1,1,1,'2026-01-05 09:00:00',2,1,'${timestamp}','${timestamp}',NULL,'Pilates Basic',1,'2026-01-05 00:00:00',2,5)`,
    `INSERT INTO kelas_pertamuans (id,id_kelas,datetime_avaiable,status,keterangan,created_at,updated_at,deleted_at) VALUES (1,1,'2026-01-05 09:00:00',1,'Available','${timestamp}','${timestamp}',NULL)`,
    `INSERT INTO customer_kelas (id,id_user,id_kelas,status,tanggal_bayar,bukti_bayar,jumlah_pertemuan,created_at,updated_at,deleted_at) VALUES (1,1,1,1,'${timestamp}','legacy/class-payment.jpg',10,'${timestamp}','${timestamp}',NULL)`,
    `INSERT INTO booking_kelas (id,id_user,id_kelas_activity,is_send_email,status_kehadiran,created_at,updated_at,deleted_at,keterangan,review,rating) VALUES (1,1,1,1,0,'2026-01-02 00:00:00','2026-01-02 00:00:00',NULL,'Booked',NULL,NULL)`,
    `INSERT INTO kelas_ratings (id,id_user,id_kelas_activity,comment,rating,created_at,updated_at,deleted_at) VALUES (1,1,1,'Good class',5,'2026-01-06 00:00:00','2026-01-06 00:00:00',NULL)`,
    `INSERT INTO vouchers (id,nama,deskripsi,expired,image,status,disc_harga,disc_percent,tanggal_aktif,lama_aktif,created_at,updated_at,deleted_at,id_paket,kode_voucher,sekali_gunakan) VALUES (1,'Synthetic Voucher','Fixture voucher','2026-12-31 00:00:00','legacy/voucher.jpg',1,10000,NULL,'${timestamp}',365,'${timestamp}','${timestamp}',NULL,1,'SYN10',1)`,
    `INSERT INTO voucher_customers (id,id_voucher,id_customer,status,expired,status_digunakan,tanggal_digunakan,created_at,updated_at,deleted_at,id_order_paket) VALUES (1,1,1,1,'2026-12-31 00:00:00',1,'2026-01-02 00:00:00','${timestamp}','${timestamp}',NULL,1)`,
    `INSERT INTO coas (id,nomor,nama,saldo,created_at,updated_at,deleted_at) VALUES (1,'1001','Cash',100000,'${timestamp}','${timestamp}',NULL)`,
    `INSERT INTO jurnals (id,nama,jumlah_uang,tipe,struk,tanggal,created_at,updated_at,deleted_at,id_parent,id_order_paket,id_user) VALUES (1,'Synthetic Sale',100000,1,'legacy/journal.jpg','${timestamp}','${timestamp}','${timestamp}',NULL,NULL,1,1)`,
    `INSERT INTO activity_log (id,log_name,description,subject_type,event,subject_id,causer_type,causer_id,properties,batch_uuid,created_at,updated_at) VALUES (1,'migration','Synthetic audit','Order','created',1,'User',1,'{}','fixture-batch','${timestamp}','${timestamp}')`,
    `INSERT INTO notifications (id,type,notifiable_type,notifiable_id,data,read_at,created_at,updated_at) VALUES ('00000000-0000-0000-0000-000000000001','FixtureNotification','User',1,'{"title":"Fixture","message":"Synthetic notification"}',NULL,'${timestamp}','${timestamp}')`,
    `INSERT INTO kelas_images (id,id_kelas,image,created_at,updated_at,deleted_at) VALUES (1,1,'legacy/class.jpg','${timestamp}','${timestamp}',NULL)`,
    'SET FOREIGN_KEY_CHECKS=1',
  );
  return `${statements.join(';\n')};\n`;
}

if (process.argv[1] === fileURLToPath(import.meta.url))
  process.stdout.write(await syntheticV1FixtureSql());
