// Tes unit tidak boleh menyentuh database. Variabel .env tetap dimuat (mis. konfigurasi fitur),
// tetapi DATABASE_URL diarahkan ke port yang selalu menolak koneksi: tes unit yang diam-diam
// memakai DB akan gagal cepat, bukan menulis ke database dev atau timeout karena DB sibuk.
require('./jest.setup.cjs');
process.env.DATABASE_URL = 'mysql://unit:unit@127.0.0.1:1/unit_tests_must_not_use_a_database';
