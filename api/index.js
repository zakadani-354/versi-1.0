/**
 * BACKEND SERVER TPQ BAITUSSALAM HUDA MANSURIN
 * Arsitektur: Pure Node.js Standard Library (Tanpa external npm dependency)
 * File: backend.js
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const crypto = require('crypto');

const PORT = process.env.PORT || 3000;
const DB_FILE = path.join(__dirname, '..', 'data.json');
const LOGO_FILE = path.join(__dirname, '..', 'logo.png');
const SESSION_SECRET = process.env.SESSION_SECRET || (
  process.env.NODE_ENV === 'production' ? '' : 'local-development-session-secret'
);
const SESSION_TTL_MS = 12 * 60 * 60 * 1000;
const SUPABASE_URL = (process.env.SUPABASE_URL || '').replace(/\/+$/, '');
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const SUPABASE_TABLE = 'tpq_app_state';

// Master referensi
const MASTER_KELAS = ['PAUD A', 'PAUD B', 'KELAS 1', 'KELAS 2', 'KELAS 3', 'KELAS 4', 'KELAS 5', 'KELAS 6'];
const MASTER_KELOMPOK = ['Baitu Taqwa', 'Almansuriin', 'Al Huda', 'Al Malik', 'Miftahul Jannah', 'Baitul Makmur'];
const MASTER_KATEGORI = [
  'Bacaan/Tilawah',
  'Tahsinul Kitabah/Menulis',
  'Hafalan Surat',
  'Hafalan Doa',
  'Ilmu Tajwid',
  'Praktek Ibadah',
  'Kefahaman Agama',
  'Adab Harian',
  'Asmaul Husna'
];

// Helper ID Unik
function generateId(prefix = 'id') {
  return `${prefix}_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
}

// Inisialisasi Database Default (Seed Data)
function getInitialData() {
  const users = [
    {
      id: 'usr_admin',
      username: 'admin',
      password: 'admin123',
      nama: 'Super Admin TPQ',
      role: 'admin',
      kelas: null,
      createdAt: '2026-09-01T08:00:00.000Z'
    },
    {
      id: 'usr_guru_paud_a',
      username: 'guru_pauda',
      password: 'guru123',
      nama: 'Ustadzah Fatimah',
      role: 'guru',
      kelas: 'PAUD A',
      createdAt: '2026-09-01T08:00:00.000Z'
    },
    {
      id: 'usr_guru_paud_b',
      username: 'guru_paudb',
      password: 'guru123',
      nama: 'Ustadzah Aisyah',
      role: 'guru',
      kelas: 'PAUD B',
      createdAt: '2026-09-01T08:00:00.000Z'
    },
    {
      id: 'usr_guru_k1',
      username: 'guru_k1',
      password: 'guru123',
      nama: 'Ustadz Ahmad Fauzi',
      role: 'guru',
      kelas: 'KELAS 1',
      createdAt: '2026-09-01T08:00:00.000Z'
    },
    {
      id: 'usr_guru_k2',
      username: 'guru_k2',
      password: 'guru123',
      nama: 'Ustadzah Nurul Hidayah',
      role: 'guru',
      kelas: 'KELAS 2',
      createdAt: '2026-09-01T08:00:00.000Z'
    },
    {
      id: 'usr_guru_k3',
      username: 'guru_k3',
      password: 'guru123',
      nama: 'Ustadz Mansur Al-Hafidz',
      role: 'guru',
      kelas: 'KELAS 3',
      createdAt: '2026-09-01T08:00:00.000Z'
    },
    {
      id: 'usr_guru_k4',
      username: 'guru_k4',
      password: 'guru123',
      nama: 'Ustadzah Khadijah',
      role: 'guru',
      kelas: 'KELAS 4',
      createdAt: '2026-09-01T08:00:00.000Z'
    },
    {
      id: 'usr_guru_k5',
      username: 'guru_k5',
      password: 'guru123',
      nama: 'Ustadz Ibrahim',
      role: 'guru',
      kelas: 'KELAS 5',
      createdAt: '2026-09-01T08:00:00.000Z'
    },
    {
      id: 'usr_guru_k6',
      username: 'guru_k6',
      password: 'guru123',
      nama: 'Ustadz Abdullah',
      role: 'guru',
      kelas: 'KELAS 6',
      createdAt: '2026-09-01T08:00:00.000Z'
    }
  ];

  const siswa = [
    // Siswa Real TPQ Baitussalam dari data rekaman
    { id: 'sis_1', nama: 'Haura Zulaikha Tsabita', ttl: 'Jakarta, 12-05-2020', kelas: 'PAUD B', kelompok: 'Baitu Taqwa', jk: 'P', hp: '081234567801' },
    { id: 'sis_2', nama: 'Ilzam Ezyr Hafidzhan Ramdani', ttl: 'Bekasi, 08-08-2020', kelas: 'PAUD B', kelompok: 'Baitu Taqwa', jk: 'L', hp: '081234567802' },
    { id: 'sis_3', nama: 'Khalisa Qais Permana', ttl: 'Jakarta, 21-03-2020', kelas: 'PAUD B', kelompok: 'Baitu Taqwa', jk: 'P', hp: '081234567803' },
    { id: 'sis_4', nama: 'Muhammad Hafy Ruzain', ttl: 'Jakarta, 15-09-2020', kelas: 'PAUD B', kelompok: 'Al Huda', jk: 'L', hp: '081234567804' },
    { id: 'sis_5', nama: 'Muhammad Ruzain Haydar Rasyid', ttl: 'Depok, 10-10-2020', kelas: 'PAUD B', kelompok: 'Al Huda', jk: 'L', hp: '081234567805' },
    { id: 'sis_6', nama: 'Amroyni Muhammad Abimanyu', ttl: 'Jakarta, 01-01-2020', kelas: 'PAUD B', kelompok: 'Al Huda', jk: 'L', hp: '081234567806' },
    { id: 'sis_7', nama: 'M. Arsyad', ttl: 'Jakarta, 19-07-2020', kelas: 'PAUD B', kelompok: 'Al Huda', jk: 'L', hp: '081234567807' },

    // PAUD A
    { id: 'sis_8', nama: 'Bilal Habibi Ramadhan', ttl: 'Jakarta, 15-04-2021', kelas: 'PAUD A', kelompok: 'Baitu Taqwa', jk: 'L', hp: '081234567808' },
    { id: 'sis_9', nama: 'Aqila Shafa Zhafira', ttl: 'Jakarta, 22-06-2021', kelas: 'PAUD A', kelompok: 'Almansuriin', jk: 'P', hp: '081234567809' },
    { id: 'sis_10', nama: 'Muhammad Rayyan Al-Ghifari', ttl: 'Bekasi, 11-09-2021', kelas: 'PAUD A', kelompok: 'Al Malik', jk: 'L', hp: '081234567810' },

    // KELAS 1
    { id: 'sis_11', nama: 'Zaidan Ahsanul Karim', ttl: 'Jakarta, 05-02-2019', kelas: 'KELAS 1', kelompok: 'Al Huda', jk: 'L', hp: '081234567811' },
    { id: 'sis_12', nama: 'Aisyah Humaira', ttl: 'Depok, 14-06-2019', kelas: 'KELAS 1', kelompok: 'Baitul Makmur', jk: 'P', hp: '081234567812' },
    { id: 'sis_13', nama: 'Fathir Ahmad Pratama', ttl: 'Jakarta, 29-11-2019', kelas: 'KELAS 1', kelompok: 'Miftahul Jannah', jk: 'L', hp: '081234567813' },

    // KELAS 2
    { id: 'sis_14', nama: 'Hafizhah Khairunnisa', ttl: 'Jakarta, 18-03-2018', kelas: 'KELAS 2', kelompok: 'Baitu Taqwa', jk: 'P', hp: '081234567814' },
    { id: 'sis_15', nama: 'Sulaiman Al-Farisi', ttl: 'Jakarta, 20-07-2018', kelas: 'KELAS 2', kelompok: 'Almansuriin', jk: 'L', hp: '081234567815' },

    // KELAS 3
    { id: 'sis_16', nama: 'Maryam Salsabila', ttl: 'Jakarta, 02-01-2017', kelas: 'KELAS 3', kelompok: 'Al Malik', jk: 'P', hp: '081234567816' },
    { id: 'sis_17', nama: 'Dzaky Rahmatullah', ttl: 'Bekasi, 19-09-2017', kelas: 'KELAS 3', kelompok: 'Miftahul Jannah', jk: 'L', hp: '081234567817' },

    // KELAS 4
    { id: 'sis_18', nama: 'Aliya Zahra', ttl: 'Jakarta, 11-12-2016', kelas: 'KELAS 4', kelompok: 'Al Huda', jk: 'P', hp: '081234567818' },
    { id: 'sis_19', nama: 'Faris Al-Muhtadi', ttl: 'Jakarta, 04-05-2016', kelas: 'KELAS 4', kelompok: 'Baitul Makmur', jk: 'L', hp: '081234567819' },

    // KELAS 5
    { id: 'sis_20', nama: 'Nadia Az-Zahra', ttl: 'Jakarta, 23-04-2015', kelas: 'KELAS 5', kelompok: 'Baitu Taqwa', jk: 'P', hp: '081234567820' },
    { id: 'sis_21', nama: 'Ikhwan Ramadhan', ttl: 'Depok, 16-08-2015', kelas: 'KELAS 5', kelompok: 'Almansuriin', jk: 'L', hp: '081234567821' },

    // KELAS 6
    { id: 'sis_22', nama: 'Muhammad Yusuf Al-Mansur', ttl: 'Jakarta, 07-07-2014', kelas: 'KELAS 6', kelompok: 'Baitul Makmur', jk: 'L', hp: '081234567822' },
    { id: 'sis_23', nama: 'Zahrotul Jannah', ttl: 'Jakarta, 30-10-2014', kelas: 'KELAS 6', kelompok: 'Miftahul Jannah', jk: 'P', hp: '081234567823' }
  ];

  const targetMateri = [
    // PAUD A & B
    { id: 'tgt_1', kelas: 'PAUD A', kategori: 'Bacaan/Tilawah', judul: 'Mengenal Huruf Hijaiyah Alif - Ya', uraian: 'Pengenalan visual & makhraj huruf dasar' },
    { id: 'tgt_2', kelas: 'PAUD A', kategori: 'Adab Harian', judul: 'Doa Sebelum dan Sesudah Makan', uraian: 'Hafal lancar beserta adab makan' },
    { id: 'tgt_3', kelas: 'PAUD A', kategori: 'Asmaul Husna', judul: 'Asmaul Husna 1 - 5 (Ar-Rahman s/d Al-Quddus)', uraian: 'Hafal berurutan dengan nada' },

    { id: 'tgt_4', kelas: 'PAUD B', kategori: 'Bacaan/Tilawah', judul: 'Tilawati PAUD / Iqro Jilid 1 Halaman 1-15', uraian: 'Membaca huruf berharakat fathah mandiri' },
    { id: 'tgt_5', kelas: 'PAUD B', kategori: 'Praktek Ibadah', judul: 'Gerakan Wudhu Praktis & Tertib', uraian: 'Praktik langsung rukun wudhu' },
    { id: 'tgt_6', kelas: 'PAUD B', kategori: 'Kefahaman Agama', judul: 'Rukun Islam 5 Perkara', uraian: 'Hafal dan memahami garis besar' },
    { id: 'tgt_7', kelas: 'PAUD B', kategori: 'Adab Harian', judul: 'Doa Masuk & Keluar Kamar Mandi', uraian: 'Membiasakan doa harian' },

    // KELAS 1
    { id: 'tgt_8', kelas: 'KELAS 1', kategori: 'Bacaan/Tilawah', judul: 'Tilawati Jilid 1 Tamat / Jilid 2 Awal', uraian: 'Kelancaran membaca harakat fathah, kasrah, dhammah' },
    { id: 'tgt_9', kelas: 'KELAS 1', kategori: 'Ilmu Tajwid', judul: 'Pengenalan Tanda Baca Panjang (Mad Thabi’i)', uraian: 'Membedakan bacaan 1 alif / 2 harakat' },
    { id: 'tgt_10', kelas: 'KELAS 1', kategori: 'Tahsinul Kitabah/Menulis', judul: 'Menulis Huruf Hijaiyah Tunggal Rapi', uraian: 'Kerapian garis buku tulis Al-Quran' },
    { id: 'tgt_11', kelas: 'KELAS 1', kategori: 'Praktek Ibadah', judul: 'Praktik Sholat Subuh & Bacaannya', uraian: 'Takbiratul ihram sampai salam' },
    { id: 'tgt_12', kelas: 'KELAS 1', kategori: 'Asmaul Husna', judul: 'Asmaul Husna 1 - 10', uraian: 'Hafal berseri' },

    // KELAS 2
    { id: 'tgt_13', kelas: 'KELAS 2', kategori: 'Bacaan/Tilawah', judul: 'Tilawati Jilid 2 Tamat & Mulai Jilid 3', uraian: 'Bacaan sukun dan qalqalah' },
    { id: 'tgt_14', kelas: 'KELAS 2', kategori: 'Ilmu Tajwid', judul: 'Hukum Nun Mati & Tanwin: Idzhar Halqi', uraian: 'Pengertian, huruf idzhar, dan contoh ayat' },
    { id: 'tgt_15', kelas: 'KELAS 2', kategori: 'Tahsinul Kitabah/Menulis', judul: 'Menyambung Huruf Hijaiyah di Awal & Tengah', uraian: 'Kaidah tulisan pegon / arab standar' },
    { id: 'tgt_16', kelas: 'KELAS 2', kategori: 'Kefahaman Agama', judul: 'Rukun Iman 6 Perkara', uraian: 'Penjelasan iman kepada Allah hingga Qadha Qadar' },

    // KELAS 3
    { id: 'tgt_17', kelas: 'KELAS 3', kategori: 'Bacaan/Tilawah', judul: 'Tilawati Jilid 3 & 4 (Tasydid & Waqaf)', uraian: 'Kelancaran waqaf dan kelanjutan nada' },
    { id: 'tgt_18', kelas: 'KELAS 3', kategori: 'Ilmu Tajwid', judul: 'Hukum Nun Mati: Idgham Bighunnah & Bilaghunnah', uraian: 'Perbedaan dengung dan lebur' },
    { id: 'tgt_19', kelas: 'KELAS 3', kategori: 'Praktek Ibadah', judul: 'Sholat Fardhu 5 Waktu & Bacaan Tasyahhud', uraian: 'Hafal tasyahhud akhir dan shalawat' },

    // KELAS 4
    { id: 'tgt_20', kelas: 'KELAS 4', kategori: 'Bacaan/Tilawah', judul: 'Tilawati Jilid 5 / Pra Al-Quran', uraian: 'Kaidah bacaan ghorib ringkas' },
    { id: 'tgt_21', kelas: 'KELAS 4', kategori: 'Ilmu Tajwid', judul: 'Hukum Ikhfa Haqiqi & Iqlab', uraian: 'Praktik dengung samar pada 15 huruf ikhfa' },
    { id: 'tgt_22', kelas: 'KELAS 4', kategori: 'Tahsinul Kitabah/Menulis', judul: 'Menulis Kaligrafi Naskhi Surat Pendek', uraian: 'Menulis Surah Al-Ikhlas & Al-Falaq' },

    // KELAS 5
    { id: 'tgt_23', kelas: 'KELAS 5', kategori: 'Bacaan/Tilawah', judul: 'Tadarus Al-Quran Juz 1 - 2 Tartil', uraian: 'Membaca Al-Quran mushaf pojok/standar kemenag' },
    { id: 'tgt_24', kelas: 'KELAS 5', kategori: 'Ilmu Tajwid', judul: 'Hukum Mim Mati (Idzhar Syafawi, Ikhfa Syafawi, Idgham Mimi)', uraian: 'Penguasaan seluruh hukum mim mati' },
    { id: 'tgt_25', kelas: 'KELAS 5', kategori: 'Kefahaman Agama', judul: 'Kisah 25 Nabi & Rasul & Karakter Teladan', uraian: 'Memetik ibrah perjuangan nabi' },

    // KELAS 6
    { id: 'tgt_26', kelas: 'KELAS 6', kategori: 'Bacaan/Tilawah', judul: 'Tadarus Tartil Al-Quran & Khotmil Quran', uraian: 'Khatam bacaan dan hafalan Juz 30' },
    { id: 'tgt_27', kelas: 'KELAS 6', kategori: 'Ilmu Tajwid', judul: 'Macam-macam Mad Far’i & Hukum Ra', uraian: 'Mad Jaiz, Wajib, Lazim, Ra Tafkhim & Tarqiq' },
    { id: 'tgt_28', kelas: 'KELAS 6', kategori: 'Praktek Ibadah', judul: 'Sholat Jenazah & Perawatan Mayit Ringkas', uraian: 'Praktik 4 takbir sholat jenazah' },
    { id: 'tgt_29', kelas: 'KELAS 6', kategori: 'Asmaul Husna', judul: 'Asmaul Husna 1 s/d 99 Tamat', uraian: 'Hafal lengkap beserta doa asmaul husna' }
  ];

  // Penilaian awal (checklist capaian materi per siswa)
  const penilaian = [
    { id: 'pen_1', siswaId: 'sis_1', targetId: 'tgt_4', status: 'Tuntas', nilai: 90, catatan: 'Lancar dan tajwid baik', tanggal: '2026-09-08' },
    { id: 'pen_2', siswaId: 'sis_1', targetId: 'tgt_5', status: 'Tuntas', nilai: 88, catatan: 'Gerakan tertib', tanggal: '2026-09-09' },
    { id: 'pen_3', siswaId: 'sis_1', targetId: 'tgt_6', status: 'Sedang Proses', nilai: 75, catatan: 'Perlu pengulangan rukun ke-4 & 5', tanggal: '2026-09-11' },
    { id: 'pen_4', siswaId: 'sis_2', targetId: 'tgt_4', status: 'Tuntas', nilai: 95, catatan: 'Sangat fasih', tanggal: '2026-09-08' },
    { id: 'pen_5', siswaId: 'sis_2', targetId: 'tgt_5', status: 'Tuntas', nilai: 92, catatan: 'Sempurna', tanggal: '2026-09-09' },
    { id: 'pen_6', siswaId: 'sis_3', targetId: 'tgt_4', status: 'Sedang Proses', nilai: 70, catatan: 'Sedang melatih makhraj Kha dan Gho', tanggal: '2026-09-08' },
    { id: 'pen_7', siswaId: 'sis_4', targetId: 'tgt_4', status: 'Tuntas', nilai: 85, catatan: 'Bagus', tanggal: '2026-09-08' },
    { id: 'pen_8', siswaId: 'sis_11', targetId: 'tgt_8', status: 'Tuntas', nilai: 88, catatan: 'Jilid 1 tamat', tanggal: '2026-09-10' },
    { id: 'pen_9', siswaId: 'sis_11', targetId: 'tgt_9', status: 'Sedang Proses', nilai: 75, catatan: 'Membedakan mad 2 harakat', tanggal: '2026-09-12' },
    { id: 'pen_10', siswaId: 'sis_12', targetId: 'tgt_8', status: 'Tuntas', nilai: 90, catatan: 'Bagus', tanggal: '2026-09-10' }
  ];

  // Presensi awal (September 2026)
  const presensi = [
    // 2026-09-08
    { id: 'pre_1', tanggal: '2026-09-08', kelas: 'PAUD B', siswaId: 'sis_1', nama: 'Haura Zulaikha Tsabita', kelompok: 'Baitu Taqwa', status: 'Hadir', catatan: '' },
    { id: 'pre_2', tanggal: '2026-09-08', kelas: 'PAUD B', siswaId: 'sis_2', nama: 'Ilzam Ezyr Hafidzhan Ramdani', kelompok: 'Baitu Taqwa', status: 'Hadir', catatan: '' },
    { id: 'pre_3', tanggal: '2026-09-08', kelas: 'PAUD B', siswaId: 'sis_3', nama: 'Khalisa Qais Permana', kelompok: 'Baitu Taqwa', status: 'Izin', catatan: 'Acara keluarga' },
    { id: 'pre_4', tanggal: '2026-09-08', kelas: 'PAUD B', siswaId: 'sis_4', nama: 'Muhammad Hafy Ruzain', kelompok: 'Al Huda', status: 'Hadir', catatan: '' },
    { id: 'pre_5', tanggal: '2026-09-08', kelas: 'PAUD B', siswaId: 'sis_5', nama: 'Muhammad Ruzain Haydar Rasyid', kelompok: 'Al Huda', status: 'Hadir', catatan: '' },
    { id: 'pre_6', tanggal: '2026-09-08', kelas: 'PAUD B', siswaId: 'sis_6', nama: 'Amroyni Muhammad Abimanyu', kelompok: 'Al Huda', status: 'Hadir', catatan: '' },
    { id: 'pre_7', tanggal: '2026-09-08', kelas: 'PAUD B', siswaId: 'sis_7', nama: 'M. Arsyad', kelompok: 'Al Huda', status: 'Hadir', catatan: '' },

    // 2026-09-09
    { id: 'pre_8', tanggal: '2026-09-09', kelas: 'PAUD B', siswaId: 'sis_1', nama: 'Haura Zulaikha Tsabita', kelompok: 'Baitu Taqwa', status: 'Hadir', catatan: '' },
    { id: 'pre_9', tanggal: '2026-09-09', kelas: 'PAUD B', siswaId: 'sis_2', nama: 'Ilzam Ezyr Hafidzhan Ramdani', kelompok: 'Baitu Taqwa', status: 'Hadir', catatan: '' },
    { id: 'pre_10', tanggal: '2026-09-09', kelas: 'PAUD B', siswaId: 'sis_3', nama: 'Khalisa Qais Permana', kelompok: 'Baitu Taqwa', status: 'Hadir', catatan: '' },
    { id: 'pre_11', tanggal: '2026-09-09', kelas: 'PAUD B', siswaId: 'sis_4', nama: 'Muhammad Hafy Ruzain', kelompok: 'Al Huda', status: 'Hadir', catatan: '' },
    { id: 'pre_12', tanggal: '2026-09-09', kelas: 'PAUD B', siswaId: 'sis_5', nama: 'Muhammad Ruzain Haydar Rasyid', kelompok: 'Al Huda', status: 'Sakit', catatan: 'Demam flu' },
    { id: 'pre_13', tanggal: '2026-09-09', kelas: 'PAUD B', siswaId: 'sis_6', nama: 'Amroyni Muhammad Abimanyu', kelompok: 'Al Huda', status: 'Hadir', catatan: '' },
    { id: 'pre_14', tanggal: '2026-09-09', kelas: 'PAUD B', siswaId: 'sis_7', nama: 'M. Arsyad', kelompok: 'Al Huda', status: 'Hadir', catatan: '' },

    // 2026-09-10 (Kelas 1)
    { id: 'pre_15', tanggal: '2026-09-10', kelas: 'KELAS 1', siswaId: 'sis_11', nama: 'Zaidan Ahsanul Karim', kelompok: 'Al Huda', status: 'Hadir', catatan: '' },
    { id: 'pre_16', tanggal: '2026-09-10', kelas: 'KELAS 1', siswaId: 'sis_12', nama: 'Aisyah Humaira', kelompok: 'Baitul Makmur', status: 'Hadir', catatan: '' },
    { id: 'pre_17', tanggal: '2026-09-10', kelas: 'KELAS 1', siswaId: 'sis_13', nama: 'Fathir Ahmad Pratama', kelompok: 'Miftahul Jannah', status: 'Hadir', catatan: '' }
  ];

  // Jurnal awal
  const jurnal = [
    {
      id: 'jur_1',
      tanggal: '2026-09-08',
      kelas: 'PAUD B',
      guru: 'Ustadzah Aisyah',
      materi: 'Tilawati Peraga Halaman 10 - 12 (Huruf Jim, Ha, Kho)',
      kehadiran: 6,
      catatan: 'Santri sangat antusias. Santri Hafy perlu pengulangan makhraj Kho.'
    },
    {
      id: 'jur_2',
      tanggal: '2026-09-09',
      kelas: 'PAUD B',
      guru: 'Ustadzah Aisyah',
      materi: 'Praktik Gerakan Wudhu & Doa Sebelum Makan',
      kehadiran: 6,
      catatan: 'Praktik basuh muka dan tangan sudah tertib. Santri Ruzain izin sakit.'
    },
    {
      id: 'jur_3',
      tanggal: '2026-09-10',
      kelas: 'KELAS 1',
      guru: 'Ustadz Ahmad Fauzi',
      materi: 'Tilawati Jilid 1 Halaman 20 & Menulis Huruf Dal, Dzal, Ra',
      kehadiran: 3,
      catatan: 'Alhamdulillah semua siswa tuntas menulis di buku berpetak.'
    }
  ];

  return {
    appName: 'TPQ BAITUSSALAM HUDA MANSURIN',
    kelasList: MASTER_KELAS,
    kelompokList: MASTER_KELOMPOK,
    kategoriList: MASTER_KATEGORI,
    users,
    siswa,
    targetMateri,
    penilaian,
    nilaiRapor: [],
    presensi,
    jurnal
  };
}

function normalizeDatabase(data) {
  if (!data.kelasList) data.kelasList = MASTER_KELAS;
  if (!data.kelompokList) data.kelompokList = MASTER_KELOMPOK;
  data.kategoriList = [...new Set([...MASTER_KATEGORI, ...(data.kategoriList || [])])];
  if (!data.users) data.users = [];
  if (!data.siswa) data.siswa = [];
  if (!data.targetMateri) data.targetMateri = [];
  if (!data.penilaian) data.penilaian = [];
  if (!data.nilaiRapor) data.nilaiRapor = [];
  if (!data.presensi) data.presensi = [];
  if (!data.jurnal) data.jurnal = [];

  data.penilaian.forEach(record => {
    if (!record.semester) record.semester = '1';
    if (!record.tahunAjaran) record.tahunAjaran = '2026-2027';
  });
  data.nilaiRapor.forEach(record => {
    if (!record.semester) record.semester = '1';
    if (!record.tahunAjaran) record.tahunAjaran = '2026-2027';
  });
  data.targetMateri.forEach(target => {
    if (!target.semester) target.semester = '1';
    if (!target.tahunAjaran) target.tahunAjaran = '2026-2027';
  });

  return data;
}

function loadDatabaseFromFile() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      const init = getInitialData();
      fs.writeFileSync(DB_FILE, JSON.stringify(init, null, 2), 'utf-8');
      return init;
    }
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return normalizeDatabase(JSON.parse(raw));
  } catch (err) {
    console.error('Error membaca database:', err);
    return normalizeDatabase(getInitialData());
  }
}

async function loadDatabase() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY wajib dikonfigurasi di Vercel');
    }
    return loadDatabaseFromFile();
  }

  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/${SUPABASE_TABLE}?id=eq.main&select=payload`, {
      headers: {
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`
      }
    });
    if (!response.ok) throw new Error(`Supabase read failed: ${response.status} ${await response.text()}`);

    const rows = await response.json();
    if (rows.length && rows[0].payload) return normalizeDatabase(rows[0].payload);

    const seedData = loadDatabaseFromFile();
    if (!await saveDatabase(seedData, true)) throw new Error('Supabase seed initialization failed');
    return seedData;
  } catch (err) {
    console.error('Error membaca database Supabase:', err);
    throw err;
  }
}

async function saveDatabase(data, ignoreDuplicates = false) {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    if (process.env.NODE_ENV === 'production') return false;
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
      return true;
    } catch (err) {
      console.error('Error menyimpan database lokal:', err);
      return false;
    }
  }

  try {
    const resolution = ignoreDuplicates ? 'ignore-duplicates' : 'merge-duplicates';
    const response = await fetch(`${SUPABASE_URL}/rest/v1/${SUPABASE_TABLE}?on_conflict=id`, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
        Prefer: `resolution=${resolution},return=minimal`
      },
      body: JSON.stringify({ id: 'main', payload: data, updated_at: new Date().toISOString() })
    });
    if (!response.ok) console.error('Error menyimpan database Supabase:', response.status, await response.text());
    return response.ok;
  } catch (err) {
    console.error('Error menyimpan database Supabase:', err);
    return false;
  }
}

async function loadDatabaseOrReply(res) {
  try {
    return await loadDatabase();
  } catch (err) {
    console.error('Database unavailable:', err);
    sendJSON(res, 503, { success: false, message: 'Database belum siap. Periksa konfigurasi Supabase di Vercel.' });
    return null;
  }
}

async function saveDatabaseOrReply(data, res) {
  if (await saveDatabase(data)) return true;
  sendJSON(res, 503, { success: false, message: 'Data tidak dapat disimpan. Periksa konfigurasi dan akses database Supabase.' });
  return false;
}

function createSession(user) {
  const sessionData = {
    userId: user.id,
    username: user.username,
    nama: user.nama,
    role: user.role,
    kelas: user.kelas,
    expiresAt: Date.now() + SESSION_TTL_MS
  };
  const payload = Buffer.from(JSON.stringify(sessionData)).toString('base64url');
  const signature = crypto.createHmac('sha256', SESSION_SECRET).update(payload).digest('base64url');
  return `${payload}.${signature}`;
}

function verifySession(token) {
  if (!SESSION_SECRET || typeof token !== 'string') return null;

  const separator = token.lastIndexOf('.');
  if (separator < 1) return null;

  const payload = token.slice(0, separator);
  const receivedSignature = Buffer.from(token.slice(separator + 1), 'base64url');
  const expectedSignature = crypto.createHmac('sha256', SESSION_SECRET).update(payload).digest();
  if (receivedSignature.length !== expectedSignature.length || !crypto.timingSafeEqual(receivedSignature, expectedSignature)) {
    return null;
  }

  try {
    const sessionData = JSON.parse(Buffer.from(payload, 'base64url').toString('utf-8'));
    if (!sessionData.expiresAt || Date.now() > sessionData.expiresAt) return null;
    return sessionData;
  } catch (err) {
    return null;
  }
}

// Helper parsing Request Body (JSON)
function parseRequestBody(req) {
  if (req.body !== undefined) {
    if (typeof req.body === 'string') {
      try {
        return Promise.resolve(JSON.parse(req.body));
      } catch (err) {
        return Promise.resolve({});
      }
    }
    return Promise.resolve(req.body || {});
  }

  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
      if (body.length > 25 * 1024 * 1024) { // Max 25MB
        reject(new Error('Payload too large'));
      }
    });
    req.on('end', () => {
      if (!body) return resolve({});
      try {
        const parsed = JSON.parse(body);
        resolve(parsed);
      } catch (err) {
        resolve({});
      }
    });
    req.on('error', err => reject(err));
  });
}

// Helper kirim JSON
function sendJSON(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  });
  res.end(JSON.stringify(data));
}

// Helper kirim File Statis
function sendFile(res, filePath, contentType) {
  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('File Not Found');
      return;
    }
    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': 'no-cache'
    });
    res.end(content);
  });
}

// Handler dipakai oleh server lokal dan Vercel Serverless Functions
async function handleRequest(req, res) {
  // CORS Preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    });
    res.end();
    return;
  }

  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const method = req.method;
  const query = parsedUrl.query;

  // Ekstrak Bearer Token
  const authHeader = req.headers['authorization'] || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : (query.token || '');
  const currentUser = verifySession(token);

  if (pathname === '/api/blocked') {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    return res.end('Not found');
  }

  // 1. Static Routes
  if ((method === 'GET' || method === 'HEAD') && (pathname === '/' || pathname === '/index.html')) {
    const indexPath = path.join(__dirname, '..', 'index.html');
    return sendFile(res, indexPath, 'text/html; charset=utf-8');
  }

  if ((method === 'GET' || method === 'HEAD') && (pathname === '/logo.png' || pathname === '/logo_tpq.png')) {
    if (fs.existsSync(LOGO_FILE)) {
      return sendFile(res, LOGO_FILE, 'image/png');
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      return res.end('Logo Not Found');
    }
  }

  // 2. Auth Routes
  if (method === 'POST' && pathname === '/api/login') {
    const body = await parseRequestBody(req);
    const { username, password } = body;

    if (!username || !password) {
      return sendJSON(res, 400, { success: false, message: 'Username dan password wajib diisi' });
    }

    if (!SESSION_SECRET) {
      return sendJSON(res, 500, { success: false, message: 'SESSION_SECRET belum dikonfigurasi di environment production' });
    }

    const db = await loadDatabaseOrReply(res);
    if (!db) return;
    const user = db.users.find(u => u.username.toLowerCase() === username.trim().toLowerCase());

    if (!user || user.password !== password) {
      return sendJSON(res, 401, { success: false, message: 'Username atau password salah!' });
    }

    const sessionToken = createSession(user);
    return sendJSON(res, 200, {
      success: true,
      message: 'Login berhasil',
      token: sessionToken,
      user: {
        id: user.id,
        username: user.username,
        nama: user.nama,
        role: user.role,
        kelas: user.kelas
      }
    });
  }

  if (method === 'GET' && pathname === '/api/me') {
    if (!currentUser) {
      return sendJSON(res, 401, { success: false, message: 'Sesi tidak valid / kedaluwarsa' });
    }
    return sendJSON(res, 200, { success: true, user: currentUser });
  }

  if (method === 'POST' && pathname === '/api/logout') {
    return sendJSON(res, 200, { success: true, message: 'Logout berhasil' });
  }

  // 3. Metadata Master (Kelas, Kelompok, Kategori)
  if (method === 'GET' && pathname === '/api/meta') {
    const db = await loadDatabaseOrReply(res);
    if (!db) return;
    return sendJSON(res, 200, {
      success: true,
      appName: db.appName || 'TPQ BAITUSSALAM HUDA MANSURIN',
      kelasList: db.kelasList || MASTER_KELAS,
      kelompokList: db.kelompokList || MASTER_KELOMPOK,
      kategoriList: db.kategoriList || MASTER_KATEGORI
    });
  }

  // Proteksi semua endpoint /api/* setelah titik ini
  if (pathname.startsWith('/api/')) {
    if (!currentUser) {
      return sendJSON(res, 401, { success: false, message: 'Akses ditolak. Silakan login terlebih dahulu.' });
    }
  }

  const db = await loadDatabaseOrReply(res);
  if (!db) return;

  // ==========================================
  // DASHBOARD AGGREGATE
  // ==========================================
  if (method === 'GET' && pathname === '/api/dashboard') {
    let { bulan, tahun, kelas, kelompok } = query;
    const now = new Date();
    bulan = bulan || String(now.getMonth() + 1).padStart(2, '0');
    tahun = tahun || String(now.getFullYear());

    // Batasi jika Guru biasa
    if (currentUser.role === 'guru') {
      kelas = currentUser.kelas;
    }

    // Filter siswa
    let siswaFiltered = db.siswa;
    if (kelas && kelas !== 'ALL') {
      siswaFiltered = siswaFiltered.filter(s => s.kelas === kelas);
    }
    if (kelompok && kelompok !== 'ALL') {
      siswaFiltered = siswaFiltered.filter(s => s.kelompok === kelompok);
    }

    // Filter presensi per bulan
    const prefixTanggal = `${tahun}-${bulan}`;
    let presensiFiltered = db.presensi.filter(p => p.tanggal && p.tanggal.startsWith(prefixTanggal));

    if (kelas && kelas !== 'ALL') {
      presensiFiltered = presensiFiltered.filter(p => p.kelas === kelas);
    }
    if (kelompok && kelompok !== 'ALL') {
      presensiFiltered = presensiFiltered.filter(p => p.kelompok === kelompok);
    }

    const totalPresensiRecord = presensiFiltered.length;
    let hadir = 0, sakit = 0, izin = 0, alpa = 0;

    presensiFiltered.forEach(p => {
      const st = (p.status || '').toLowerCase();
      if (st === 'hadir') hadir++;
      else if (st === 'sakit') sakit++;
      else if (st === 'izin') izin++;
      else if (st === 'alpa') alpa++;
    });

    const persenHadir = totalPresensiRecord > 0 ? Math.round((hadir / totalPresensiRecord) * 100) : 0;
    const persenSakit = totalPresensiRecord > 0 ? Math.round((sakit / totalPresensiRecord) * 100) : 0;
    const persenIzin = totalPresensiRecord > 0 ? Math.round((izin / totalPresensiRecord) * 100) : 0;
    const persenAlpa = totalPresensiRecord > 0 ? Math.round((alpa / totalPresensiRecord) * 100) : 0;

    // Rekap per Tanggal (untuk diagram batang)
    const perTanggalMap = {};
    presensiFiltered.forEach(p => {
      if (!perTanggalMap[p.tanggal]) {
        perTanggalMap[p.tanggal] = { total: 0, hadir: 0, sakit: 0, izin: 0, alpa: 0 };
      }
      perTanggalMap[p.tanggal].total++;
      const st = (p.status || '').toLowerCase();
      if (st === 'hadir') perTanggalMap[p.tanggal].hadir++;
      else if (st === 'sakit') perTanggalMap[p.tanggal].sakit++;
      else if (st === 'izin') perTanggalMap[p.tanggal].izin++;
      else if (st === 'alpa') perTanggalMap[p.tanggal].alpa++;
    });

    const chartTanggal = Object.keys(perTanggalMap).sort().map(tgl => ({
      tanggal: tgl,
      total: perTanggalMap[tgl].total,
      hadir: perTanggalMap[tgl].hadir,
      persen: Math.round((perTanggalMap[tgl].hadir / perTanggalMap[tgl].total) * 100)
    }));

    // Rekap jumlah kehadiran per kelompok pada periode terpilih
    const kelompokMap = {};
    presensiFiltered.forEach(p => {
      const namaKelompok = p.kelompok || 'Tanpa Kelompok';
      if (!kelompokMap[namaKelompok]) kelompokMap[namaKelompok] = { kelompok: namaKelompok, total: 0, hadir: 0 };
      kelompokMap[namaKelompok].total++;
      if ((p.status || '').toLowerCase() === 'hadir') kelompokMap[namaKelompok].hadir++;
    });
    const chartKelompokList = [...new Set([
      ...(kelompok && kelompok !== 'ALL' ? [kelompok] : (db.kelompokList || MASTER_KELOMPOK)),
      ...Object.keys(kelompokMap)
    ])];
    const chartKelompok = chartKelompokList.map(namaKelompok => {
      const item = kelompokMap[namaKelompok] || { total: 0, hadir: 0 };
      return {
        kelompok: namaKelompok,
        total: item.total,
        hadir: item.hadir,
        persen: item.total > 0 ? Math.round((item.hadir / item.total) * 100) : 0
      };
    });

    // Rekap Per Siswa
    const perSiswa = siswaFiltered.map(s => {
      const siswaPresensi = presensiFiltered.filter(p => p.siswaId === s.id);
      const totalSesi = siswaPresensi.length;
      const sHadir = siswaPresensi.filter(p => (p.status || '').toLowerCase() === 'hadir').length;
      const sSakit = siswaPresensi.filter(p => (p.status || '').toLowerCase() === 'sakit').length;
      const sIzin = siswaPresensi.filter(p => (p.status || '').toLowerCase() === 'izin').length;
      const sAlpa = siswaPresensi.filter(p => (p.status || '').toLowerCase() === 'alpa').length;
      const persen = totalSesi > 0 ? Math.round((sHadir / totalSesi) * 100) : 0;

      // Hitung pencapaian target materi siswa
      const targetKelas = db.targetMateri.filter(t => t.kelas === s.kelas);
      const targetIds = targetKelas.map(t => t.id);
      const tuntasCount = db.penilaian.filter(pen => pen.siswaId === s.id && targetIds.includes(pen.targetId) && pen.status === 'Tuntas').length;
      const targetPersen = targetKelas.length > 0 ? Math.round((tuntasCount / targetKelas.length) * 100) : 0;

      return {
        id: s.id,
        nama: s.nama,
        kelas: s.kelas,
        kelompok: s.kelompok,
        totalSesi,
        hadir: sHadir,
        sakit: sSakit,
        izin: sIzin,
        alpa: sAlpa,
        persenHadir: persen,
        targetPersen,
        targetTuntas: tuntasCount,
        totalTarget: targetKelas.length
      };
    });

    // Rekap Pencapaian Target Kelas & Kelompok
    const targetKelasTotal = db.targetMateri.filter(t => !kelas || kelas === 'ALL' || t.kelas === kelas).length;
    let targetTercapaiTotal = 0;
    siswaFiltered.forEach(s => {
      const tKelas = db.targetMateri.filter(t => t.kelas === s.kelas);
      const tIds = tKelas.map(t => t.id);
      targetTercapaiTotal += db.penilaian.filter(pen => pen.siswaId === s.id && tIds.includes(pen.targetId) && pen.status === 'Tuntas').length;
    });

    const targetMaxPossible = siswaFiltered.reduce((acc, s) => {
      return acc + db.targetMateri.filter(t => t.kelas === s.kelas).length;
    }, 0);

    const persenTargetGlobal = targetMaxPossible > 0 ? Math.round((targetTercapaiTotal / targetMaxPossible) * 100) : 0;

    return sendJSON(res, 200, {
      success: true,
      filter: { bulan, tahun, kelas: kelas || 'ALL', kelompok: kelompok || 'ALL' },
      ringkasan: {
        totalSiswa: siswaFiltered.length,
        totalPresensiRecord,
        hadir, sakit, izin, alpa,
        persenHadir, persenSakit, persenIzin, persenAlpa,
        persenTargetGlobal
      },
      chartTanggal,
      chartKelompok,
      chartKelompokList,
      perSiswa
    });
  }

  // ==========================================
  // JURNAL KELAS
  // ==========================================
  if (pathname === '/api/jurnal') {
    if (method === 'GET') {
      let { kelas, q, tanggal } = query;
      if (currentUser.role === 'guru') {
        kelas = currentUser.kelas;
      }

      let list = db.jurnal;
      if (kelas && kelas !== 'ALL') {
        list = list.filter(j => j.kelas === kelas);
      }
      if (tanggal) {
        list = list.filter(j => j.tanggal === tanggal);
      }
      if (q) {
        const queryLower = q.toLowerCase();
        list = list.filter(j => (j.materi && j.materi.toLowerCase().includes(queryLower)) ||
                                (j.guru && j.guru.toLowerCase().includes(queryLower)) ||
                                (j.catatan && j.catatan.toLowerCase().includes(queryLower)));
      }

      // Urutkan tanggal terbaru
      list.sort((a, b) => new Date(b.tanggal || 0) - new Date(a.tanggal || 0));
      return sendJSON(res, 200, { success: true, data: list });
    }

    if (method === 'POST') {
      const body = await parseRequestBody(req);
      const { tanggal, kelas, guru, materi, kehadiran, catatan } = body;

      if (!tanggal || !kelas || !materi) {
        return sendJSON(res, 400, { success: false, message: 'Tanggal, kelas, dan materi wajib diisi' });
      }

      if (currentUser.role === 'guru' && kelas !== currentUser.kelas) {
        return sendJSON(res, 403, { success: false, message: 'Anda hanya boleh mengisi jurnal untuk kelas Anda' });
      }

      const newJurnal = {
        id: generateId('jur'),
        tanggal,
        kelas,
        guru: guru || currentUser.nama,
        materi,
        kehadiran: Number(kehadiran) || 0,
        catatan: catatan || '',
        createdAt: new Date().toISOString()
      };

      db.jurnal.unshift(newJurnal);
      if (!await saveDatabaseOrReply(db, res)) return;
      return sendJSON(res, 201, { success: true, message: 'Jurnal berhasil disimpan', data: newJurnal });
    }
  }

  if (pathname === '/api/jurnal-bulk-delete' && method === 'POST') {
    const body = await parseRequestBody(req);
    const { ids } = body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return sendJSON(res, 400, { success: false, message: 'Daftar ID tidak valid' });
    }

    // Jika Guru, hanya boleh hapus jurnal kelasnya
    db.jurnal = db.jurnal.filter(j => {
      if (ids.includes(j.id)) {
        if (currentUser.role === 'guru' && j.kelas !== currentUser.kelas) {
          return true; // Jangan hapus jika bukan kelasnya
        }
        return false;
      }
      return true;
    });

    if (!await saveDatabaseOrReply(db, res)) return;
    return sendJSON(res, 200, { success: true, message: 'Jurnal terpilih berhasil dihapus' });
  }

  if (pathname === '/api/jurnal' && query.id) {
    const id = query.id;

    if (method === 'PUT') {
      const body = await parseRequestBody(req);
      const index = db.jurnal.findIndex(j => j.id === id);
      if (index === -1) {
        return sendJSON(res, 404, { success: false, message: 'Jurnal tidak ditemukan' });
      }

      if (currentUser.role === 'guru' && db.jurnal[index].kelas !== currentUser.kelas) {
        return sendJSON(res, 403, { success: false, message: 'Anda tidak memiliki hak mengubah jurnal kelas ini' });
      }

      db.jurnal[index] = {
        ...db.jurnal[index],
        tanggal: body.tanggal || db.jurnal[index].tanggal,
        kelas: currentUser.role === 'guru' ? currentUser.kelas : (body.kelas || db.jurnal[index].kelas),
        guru: body.guru || db.jurnal[index].guru,
        materi: body.materi || db.jurnal[index].materi,
        kehadiran: body.kehadiran !== undefined ? Number(body.kehadiran) : db.jurnal[index].kehadiran,
        catatan: body.catatan !== undefined ? body.catatan : db.jurnal[index].catatan,
        updatedAt: new Date().toISOString()
      };

      if (!await saveDatabaseOrReply(db, res)) return;
      return sendJSON(res, 200, { success: true, message: 'Jurnal berhasil diperbarui', data: db.jurnal[index] });
    }

    if (method === 'DELETE') {
      const index = db.jurnal.findIndex(j => j.id === id);
      if (index === -1) {
        return sendJSON(res, 404, { success: false, message: 'Jurnal tidak ditemukan' });
      }

      if (currentUser.role === 'guru' && db.jurnal[index].kelas !== currentUser.kelas) {
        return sendJSON(res, 403, { success: false, message: 'Anda tidak berhak menghapus jurnal kelas ini' });
      }

      db.jurnal.splice(index, 1);
      if (!await saveDatabaseOrReply(db, res)) return;
      return sendJSON(res, 200, { success: true, message: 'Jurnal berhasil dihapus' });
    }
  }

  // ==========================================
  // PRESENSI SISWA
  // ==========================================
  if (pathname === '/api/presensi') {
    if (method === 'GET') {
      let { tanggal, kelas, kelompok, bulan, tahun, siswaId, semester, tahunAjaran } = query;
      if (currentUser.role === 'guru') {
        kelas = currentUser.kelas;
      }

      let list = db.presensi;
      if (tanggal) {
        list = list.filter(p => p.tanggal === tanggal);
      } else if (bulan && tahun) {
        const prefix = `${tahun}-${bulan}`;
        list = list.filter(p => p.tanggal && p.tanggal.startsWith(prefix));
      }

      if (siswaId) {
        list = list.filter(p => p.siswaId === siswaId);
      }

      if (semester && tahunAjaran) {
        const [startYear, endYear] = tahunAjaran.split('-').map(Number);
        let startDate = null;
        let endDate = null;

        if (semester === '1') {
          startDate = `${startYear}-07-01`;
          endDate = `${endYear}-01-01`;
        } else if (semester === '2') {
          startDate = `${endYear}-01-01`;
          endDate = `${endYear}-07-01`;
        }

        if (startDate && endDate) {
          list = list.filter(p => {
            if (!p.tanggal) return false;
            return p.tanggal >= startDate && p.tanggal < endDate;
          });
        }
      }

      if (kelas && kelas !== 'ALL') {
        list = list.filter(p => p.kelas === kelas);
      }
      if (kelompok && kelompok !== 'ALL') {
        list = list.filter(p => p.kelompok === kelompok);
      }

      list.sort((a, b) => new Date(b.tanggal || 0) - new Date(a.tanggal || 0));
      return sendJSON(res, 200, { success: true, data: list });
    }
  }

  // Input Presensi Massal (Hari ini / Tanggal tertentu untuk 1 kelas)
  if (pathname === '/api/presensi-batch' && method === 'POST') {
    const body = await parseRequestBody(req);
    const { tanggal, kelas, items } = body;

    if (!tanggal || !kelas || !Array.isArray(items)) {
      return sendJSON(res, 400, { success: false, message: 'Data presensi tidak lengkap' });
    }

    if (currentUser.role === 'guru' && kelas !== currentUser.kelas) {
      return sendJSON(res, 403, { success: false, message: 'Anda hanya boleh menginput presensi di kelas Anda' });
    }

    // Update jika sudah ada untuk tanggal & siswa yang sama, atau tambahkan jika baru
    items.forEach(item => {
      const existingIdx = db.presensi.findIndex(p => p.tanggal === tanggal && p.siswaId === item.siswaId);
      const record = {
        id: existingIdx >= 0 ? db.presensi[existingIdx].id : generateId('pre'),
        tanggal,
        kelas,
        siswaId: item.siswaId,
        nama: item.nama,
        kelompok: item.kelompok || 'Baitu Taqwa',
        status: item.status || 'Hadir',
        catatan: item.catatan || '',
        updatedAt: new Date().toISOString()
      };

      if (existingIdx >= 0) {
        db.presensi[existingIdx] = record;
      } else {
        db.presensi.push(record);
      }
    });

    if (!await saveDatabaseOrReply(db, res)) return;
    return sendJSON(res, 200, { success: true, message: 'Presensi kelas berhasil disimpan' });
  }

  if (pathname === '/api/presensi-bulk-delete' && method === 'POST') {
    const body = await parseRequestBody(req);
    const { ids } = body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return sendJSON(res, 400, { success: false, message: 'Daftar ID tidak valid' });
    }

    db.presensi = db.presensi.filter(p => {
      if (ids.includes(p.id)) {
        if (currentUser.role === 'guru' && p.kelas !== currentUser.kelas) {
          return true;
        }
        return false;
      }
      return true;
    });

    if (!await saveDatabaseOrReply(db, res)) return;
    return sendJSON(res, 200, { success: true, message: 'Presensi terpilih berhasil dihapus' });
  }

  if (pathname === '/api/presensi' && query.id) {
    const id = query.id;

    if (method === 'PUT') {
      const body = await parseRequestBody(req);
      const index = db.presensi.findIndex(p => p.id === id);
      if (index === -1) {
        return sendJSON(res, 404, { success: false, message: 'Data presensi tidak ditemukan' });
      }

      if (currentUser.role === 'guru' && db.presensi[index].kelas !== currentUser.kelas) {
        return sendJSON(res, 403, { success: false, message: 'Akses ditolak' });
      }

      db.presensi[index] = {
        ...db.presensi[index],
        status: body.status || db.presensi[index].status,
        catatan: body.catatan !== undefined ? body.catatan : db.presensi[index].catatan,
        updatedAt: new Date().toISOString()
      };

      if (!await saveDatabaseOrReply(db, res)) return;
      return sendJSON(res, 200, { success: true, message: 'Presensi berhasil diperbarui', data: db.presensi[index] });
    }

    if (method === 'DELETE') {
      const index = db.presensi.findIndex(p => p.id === id);
      if (index === -1) {
        return sendJSON(res, 404, { success: false, message: 'Data presensi tidak ditemukan' });
      }

      if (currentUser.role === 'guru' && db.presensi[index].kelas !== currentUser.kelas) {
        return sendJSON(res, 403, { success: false, message: 'Akses ditolak' });
      }

      db.presensi.splice(index, 1);
      if (!await saveDatabaseOrReply(db, res)) return;
      return sendJSON(res, 200, { success: true, message: 'Presensi berhasil dihapus' });
    }
  }

  // ==========================================
  // DATABASE SISWA
  // ==========================================
  if (pathname === '/api/siswa') {
    if (method === 'GET') {
      let { kelas, kelompok, q } = query;
      if (currentUser.role === 'guru') {
        kelas = currentUser.kelas;
      }

      let list = db.siswa;
      if (kelas && kelas !== 'ALL') {
        list = list.filter(s => s.kelas === kelas);
      }
      if (kelompok && kelompok !== 'ALL') {
        list = list.filter(s => s.kelompok === kelompok);
      }
      if (q) {
        const ql = q.toLowerCase();
        list = list.filter(s => s.nama.toLowerCase().includes(ql) || (s.ttl && s.ttl.toLowerCase().includes(ql)));
      }

      return sendJSON(res, 200, { success: true, data: list });
    }

    if (method === 'POST') {
      const body = await parseRequestBody(req);
      let { nama, ttl, kelas, kelompok, jk, hp } = body;

      if (!nama || !kelas || !kelompok) {
        return sendJSON(res, 400, { success: false, message: 'Nama, kelas, dan kelompok wajib diisi' });
      }

      if (currentUser.role === 'guru' && kelas !== currentUser.kelas) {
        return sendJSON(res, 403, { success: false, message: 'Guru hanya dapat menambahkan siswa ke kelas yang diampu' });
      }

      const newSiswa = {
        id: generateId('sis'),
        nama: nama.trim(),
        ttl: ttl ? ttl.trim() : '-',
        kelas,
        kelompok,
        jk: jk || 'L',
        hp: hp || '',
        createdAt: new Date().toISOString()
      };

      db.siswa.push(newSiswa);
      if (!await saveDatabaseOrReply(db, res)) return;
      return sendJSON(res, 201, { success: true, message: 'Siswa berhasil ditambahkan', data: newSiswa });
    }
  }

  // Bulk Import Siswa via Excel/CSV
  if (pathname === '/api/siswa-bulk-import' && method === 'POST') {
    const body = await parseRequestBody(req);
    const { items } = body;

    if (!Array.isArray(items) || items.length === 0) {
      return sendJSON(res, 400, { success: false, message: 'Data siswa untuk diimpor tidak ditemukan' });
    }

    let addedCount = 0;
    items.forEach(item => {
      let sKelas = item.kelas ? item.kelas.trim() : (currentUser.role === 'guru' ? currentUser.kelas : 'PAUD A');
      if (currentUser.role === 'guru') {
        sKelas = currentUser.kelas; // Paksa kelas guru jika role guru
      }
      let sKelompok = item.kelompok ? item.kelompok.trim() : 'Baitu Taqwa';

      if (item.nama && item.nama.trim()) {
        const newS = {
          id: generateId('sis'),
          nama: item.nama.trim(),
          ttl: item.ttl ? item.ttl.trim() : '-',
          kelas: sKelas,
          kelompok: sKelompok,
          jk: item.jk || 'L',
          hp: item.hp || '',
          createdAt: new Date().toISOString()
        };
        db.siswa.push(newS);
        addedCount++;
      }
    });

    if (!await saveDatabaseOrReply(db, res)) return;
    return sendJSON(res, 200, { success: true, message: `Berhasil mengimpor ${addedCount} data siswa` });
  }

  if (pathname === '/api/siswa-bulk-delete' && method === 'POST') {
    const body = await parseRequestBody(req);
    const { ids } = body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return sendJSON(res, 400, { success: false, message: 'Daftar ID tidak valid' });
    }

    db.siswa = db.siswa.filter(s => {
      if (ids.includes(s.id)) {
        if (currentUser.role === 'guru' && s.kelas !== currentUser.kelas) {
          return true;
        }
        return false;
      }
      return true;
    });

    if (!await saveDatabaseOrReply(db, res)) return;
    return sendJSON(res, 200, { success: true, message: 'Data siswa terpilih berhasil dihapus' });
  }

  if (pathname === '/api/siswa' && query.id) {
    const id = query.id;

    if (method === 'PUT') {
      const body = await parseRequestBody(req);
      const index = db.siswa.findIndex(s => s.id === id);
      if (index === -1) {
        return sendJSON(res, 404, { success: false, message: 'Siswa tidak ditemukan' });
      }

      if (currentUser.role === 'guru' && db.siswa[index].kelas !== currentUser.kelas) {
        return sendJSON(res, 403, { success: false, message: 'Akses ditolak' });
      }

      db.siswa[index] = {
        ...db.siswa[index],
        nama: body.nama ? body.nama.trim() : db.siswa[index].nama,
        ttl: body.ttl ? body.ttl.trim() : db.siswa[index].ttl,
        kelas: currentUser.role === 'guru' ? currentUser.kelas : (body.kelas || db.siswa[index].kelas),
        kelompok: body.kelompok || db.siswa[index].kelompok,
        jk: body.jk || db.siswa[index].jk,
        hp: body.hp !== undefined ? body.hp : db.siswa[index].hp,
        updatedAt: new Date().toISOString()
      };

      if (!await saveDatabaseOrReply(db, res)) return;
      return sendJSON(res, 200, { success: true, message: 'Data siswa berhasil diperbarui', data: db.siswa[index] });
    }

    if (method === 'DELETE') {
      const index = db.siswa.findIndex(s => s.id === id);
      if (index === -1) {
        return sendJSON(res, 404, { success: false, message: 'Siswa tidak ditemukan' });
      }

      if (currentUser.role === 'guru' && db.siswa[index].kelas !== currentUser.kelas) {
        return sendJSON(res, 403, { success: false, message: 'Akses ditolak' });
      }

      db.siswa.splice(index, 1);
      if (!await saveDatabaseOrReply(db, res)) return;
      return sendJSON(res, 200, { success: true, message: 'Siswa berhasil dihapus' });
    }
  }

  // ==========================================
  // TARGET MATERI & PENILAIAN
  // ==========================================
  if (pathname === '/api/target-materi') {
    if (method === 'GET') {
      let { kelas, kategori, semester = '1', tahunAjaran = '2026-2027' } = query;
      if (currentUser.role === 'guru') {
        kelas = currentUser.kelas;
      }

      let list = db.targetMateri;
      if (kelas && kelas !== 'ALL') {
        list = list.filter(t => t.kelas === kelas);
      }
      if (kategori && kategori !== 'ALL') {
        list = list.filter(t => t.kategori === kategori);
      }
      list = list.filter(t => t.semester === semester && t.tahunAjaran === tahunAjaran);

      return sendJSON(res, 200, { success: true, data: list });
    }

    if (method === 'POST') {
      const body = await parseRequestBody(req);
      const { kelas, kategori, judul, uraian, semester = '1', tahunAjaran = '2026-2027' } = body;

      if (!kelas || !kategori || !judul) {
        return sendJSON(res, 400, { success: false, message: 'Kelas, kategori, dan judul target wajib diisi' });
      }

      if (currentUser.role === 'guru' && kelas !== currentUser.kelas) {
        return sendJSON(res, 403, { success: false, message: 'Guru hanya dapat menginput target di kelas yang diampu' });
      }

      const newTarget = {
        id: generateId('tgt'),
        kelas,
        kategori,
        judul: judul.trim(),
        uraian: uraian ? uraian.trim() : '',
        semester,
        tahunAjaran,
        createdAt: new Date().toISOString()
      };

      db.targetMateri.push(newTarget);
      if (!await saveDatabaseOrReply(db, res)) return;
      return sendJSON(res, 201, { success: true, message: 'Target materi berhasil ditambahkan', data: newTarget });
    }
  }

  // Bulk Import Target Materi
  if (pathname === '/api/target-materi-bulk-import' && method === 'POST') {
    const body = await parseRequestBody(req);
    const { items } = body;

    if (!Array.isArray(items) || items.length === 0) {
      return sendJSON(res, 400, { success: false, message: 'Data target tidak ditemukan' });
    }

    let count = 0;
    items.forEach(it => {
      let tKelas = it.kelas ? it.kelas.trim() : (currentUser.role === 'guru' ? currentUser.kelas : 'PAUD A');
      if (currentUser.role === 'guru') tKelas = currentUser.kelas;
      const tKategori = it.kategori ? it.kategori.trim() : 'Bacaan/Tilawah';
      const tSemester = it.semester || '1';
      const tTahunAjaran = it.tahunAjaran || '2026-2027';

      if (it.judul && it.judul.trim()) {
        db.targetMateri.push({
          id: generateId('tgt'),
          kelas: tKelas,
          kategori: tKategori,
          judul: it.judul.trim(),
          uraian: it.uraian ? it.uraian.trim() : '',
          semester: tSemester,
          tahunAjaran: tTahunAjaran,
          createdAt: new Date().toISOString()
        });
        count++;
      }
    });

    if (!await saveDatabaseOrReply(db, res)) return;
    return sendJSON(res, 200, { success: true, message: `Berhasil mengimpor ${count} target materi` });
  }

  if (pathname === '/api/target-materi-bulk-delete' && method === 'POST') {
    const body = await parseRequestBody(req);
    const { ids } = body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return sendJSON(res, 400, { success: false, message: 'Daftar ID tidak valid' });
    }

    db.targetMateri = db.targetMateri.filter(t => {
      if (ids.includes(t.id)) {
        if (currentUser.role === 'guru' && t.kelas !== currentUser.kelas) return true;
        return false;
      }
      return true;
    });

    if (!await saveDatabaseOrReply(db, res)) return;
    return sendJSON(res, 200, { success: true, message: 'Target materi terpilih berhasil dihapus' });
  }

  if (pathname === '/api/target-materi' && query.id) {
    const id = query.id;

    if (method === 'PUT') {
      const body = await parseRequestBody(req);
      const index = db.targetMateri.findIndex(t => t.id === id);
      if (index === -1) {
        return sendJSON(res, 404, { success: false, message: 'Target materi tidak ditemukan' });
      }

      if (currentUser.role === 'guru' && db.targetMateri[index].kelas !== currentUser.kelas) {
        return sendJSON(res, 403, { success: false, message: 'Akses ditolak' });
      }

      db.targetMateri[index] = {
        ...db.targetMateri[index],
        kelas: currentUser.role === 'guru' ? currentUser.kelas : (body.kelas || db.targetMateri[index].kelas),
        kategori: body.kategori || db.targetMateri[index].kategori,
        judul: body.judul ? body.judul.trim() : db.targetMateri[index].judul,
        uraian: body.uraian !== undefined ? body.uraian.trim() : db.targetMateri[index].uraian,
        semester: body.semester || db.targetMateri[index].semester,
        tahunAjaran: body.tahunAjaran || db.targetMateri[index].tahunAjaran,
        updatedAt: new Date().toISOString()
      };

      if (!await saveDatabaseOrReply(db, res)) return;
      return sendJSON(res, 200, { success: true, message: 'Target materi berhasil diperbarui', data: db.targetMateri[index] });
    }

    if (method === 'DELETE') {
      const index = db.targetMateri.findIndex(t => t.id === id);
      if (index === -1) {
        return sendJSON(res, 404, { success: false, message: 'Target materi tidak ditemukan' });
      }

      if (currentUser.role === 'guru' && db.targetMateri[index].kelas !== currentUser.kelas) {
        return sendJSON(res, 403, { success: false, message: 'Akses ditolak' });
      }

      db.targetMateri.splice(index, 1);
      if (!await saveDatabaseOrReply(db, res)) return;
      return sendJSON(res, 200, { success: true, message: 'Target materi berhasil dihapus' });
    }
  }

  // ==========================================
  // CAPAIAN / PENILAIAN SISWA
  // ==========================================
  if (pathname === '/api/penilaian') {
    if (method === 'GET') {
      let { kelas, siswaId, semester = '1', tahunAjaran = '2026-2027' } = query;
      if (currentUser.role === 'guru') {
        kelas = currentUser.kelas;
      }

      if (siswaId) {
        const selectedStudent = db.siswa.find(s => s.id === siswaId);
        if (selectedStudent) kelas = selectedStudent.kelas;
      }

      // Ambil list siswa yang relevan
      let siswaList = db.siswa;
      if (kelas && kelas !== 'ALL') siswaList = siswaList.filter(s => s.kelas === kelas);
      if (siswaId) siswaList = siswaList.filter(s => s.id === siswaId);

      const targetList = db.targetMateri.filter(t =>
        (!kelas || kelas === 'ALL' || t.kelas === kelas) &&
        t.semester === semester &&
        t.tahunAjaran === tahunAjaran
      );

      return sendJSON(res, 200, {
        success: true,
        siswaList,
        targetList,
        penilaian: db.penilaian.filter(p =>
          p.semester === semester && p.tahunAjaran === tahunAjaran
        )
      });
    }

    // Update status penilaian satuan atau batch
    if (method === 'POST') {
      const body = await parseRequestBody(req);
      const { siswaId, semester = '1', tahunAjaran = '2026-2027' } = body;
      const items = Array.isArray(body.items) ? body.items : [body];

      if (!siswaId || items.length === 0 || items.some(item => !item.targetId || !item.status)) {
        return sendJSON(res, 400, { success: false, message: 'Siswa, target materi, dan status wajib diisi' });
      }

      const s = db.siswa.find(x => x.id === siswaId);
      if (!s) return sendJSON(res, 404, { success: false, message: 'Siswa tidak ditemukan' });

      if (currentUser.role === 'guru' && s.kelas !== currentUser.kelas) {
        return sendJSON(res, 403, { success: false, message: 'Akses ditolak' });
      }

      const records = items.map(item => {
        const existingIdx = db.penilaian.findIndex(p =>
          p.siswaId === siswaId &&
          p.targetId === item.targetId &&
          p.semester === semester &&
          p.tahunAjaran === tahunAjaran
        );
        const record = {
          id: existingIdx >= 0 ? db.penilaian[existingIdx].id : generateId('pen'),
          siswaId,
          targetId: item.targetId,
          status: item.status,
          nilai: Number(item.nilai) || 0,
          catatan: item.catatan || '',
          semester,
          tahunAjaran,
          tanggal: new Date().toISOString().substring(0, 10),
          updatedAt: new Date().toISOString()
        };

        if (existingIdx >= 0) {
          db.penilaian[existingIdx] = record;
        } else {
          db.penilaian.push(record);
        }

        return record;
      });

      if (!await saveDatabaseOrReply(db, res)) return;
      return sendJSON(res, 200, {
        success: true,
        message: 'Penilaian berhasil disimpan',
        data: Array.isArray(body.items) ? records : records[0]
      });
    }
  }

  // ==========================================
  // NILAI RAPOR PER SUBJEK (7 KATEGORI)
  // ==========================================
  if (pathname === '/api/nilai-rapor') {
    if (method === 'GET') {
      let { siswaId, semester = '1', tahunAjaran = '2026-2027' } = query;
      let siswaList = db.siswa;

      if (siswaId) {
        siswaList = siswaList.filter(s => s.id === siswaId);
      }
      if (currentUser.role === 'guru') {
        siswaList = siswaList.filter(s => s.kelas === currentUser.kelas);
      }

      return sendJSON(res, 200, {
        success: true,
        siswaList,
        kategoriList: MASTER_KATEGORI,
        nilaiRapor: db.nilaiRapor.filter(n =>
          (!siswaId || n.siswaId === siswaId) &&
          n.semester === semester &&
          n.tahunAjaran === tahunAjaran
        )
      });
    }

    if (method === 'POST') {
      const body = await parseRequestBody(req);
      const {
        siswaId,
        kategori,
        uh1,
        uh2,
        pts,
        pas,
        semester = '1',
        tahunAjaran = '2026-2027'
      } = body;

      if (!siswaId || !MASTER_KATEGORI.includes(kategori)) {
        return sendJSON(res, 400, { success: false, message: 'Siswa dan subjek rapor wajib diisi' });
      }

      const s = db.siswa.find(x => x.id === siswaId);
      if (!s) return sendJSON(res, 404, { success: false, message: 'Siswa tidak ditemukan' });
      if (currentUser.role === 'guru' && s.kelas !== currentUser.kelas) {
        return sendJSON(res, 403, { success: false, message: 'Akses ditolak' });
      }

      const scores = [uh1, uh2, pts, pas].map(value => Math.max(0, Math.min(100, Number(value) || 0)));
      const rataRata = Math.round((scores.reduce((sum, value) => sum + value, 0) / 4) * 100) / 100;
      const huruf = rataRata >= 91 ? 'A' : rataRata >= 81 ? 'B' : rataRata >= 71 ? 'C' : 'D';
      const existingIdx = db.nilaiRapor.findIndex(n =>
        n.siswaId === siswaId &&
        n.kategori === kategori &&
        n.semester === semester &&
        n.tahunAjaran === tahunAjaran
      );
      const record = {
        id: existingIdx >= 0 ? db.nilaiRapor[existingIdx].id : generateId('rapor'),
        siswaId,
        kategori,
        uh1: scores[0],
        uh2: scores[1],
        pts: scores[2],
        pas: scores[3],
        rataRata,
        huruf,
        semester,
        tahunAjaran,
        updatedAt: new Date().toISOString()
      };

      if (existingIdx >= 0) {
        db.nilaiRapor[existingIdx] = record;
      } else {
        db.nilaiRapor.push(record);
      }

      if (!await saveDatabaseOrReply(db, res)) return;
      return sendJSON(res, 200, { success: true, message: 'Nilai rapor berhasil disimpan', data: record });
    }
  }

  // ==========================================
  // KELOLA AKUN GURU (KHUSUS ADMIN)
  // ==========================================
  if (pathname === '/api/guru') {
    if (currentUser.role !== 'admin') {
      return sendJSON(res, 403, { success: false, message: 'Akses terbatas untuk Super Admin' });
    }

    if (method === 'GET') {
      const teachers = db.users
        .filter(u => u.role === 'guru')
        .map(u => ({
          id: u.id,
          username: u.username,
          nama: u.nama,
          role: u.role,
          kelas: u.kelas,
          createdAt: u.createdAt
        }));
      return sendJSON(res, 200, { success: true, data: teachers });
    }

    if (method === 'POST') {
      const body = await parseRequestBody(req);
      const { username, password, nama, kelas } = body;

      if (!username || !password || !nama || !kelas) {
        return sendJSON(res, 400, { success: false, message: 'Username, password, nama, dan kelas binaan wajib diisi' });
      }

      const existing = db.users.find(u => u.username.toLowerCase() === username.trim().toLowerCase());
      if (existing) {
        return sendJSON(res, 400, { success: false, message: 'Username sudah digunakan oleh akun lain' });
      }

      const newGuru = {
        id: generateId('usr_guru'),
        username: username.trim().toLowerCase(),
        password: password.trim(),
        nama: nama.trim(),
        role: 'guru',
        kelas,
        createdAt: new Date().toISOString()
      };

      db.users.push(newGuru);
      if (!await saveDatabaseOrReply(db, res)) return;
      return sendJSON(res, 201, {
        success: true,
        message: 'Akun guru berhasil dibuat',
        data: { id: newGuru.id, username: newGuru.username, nama: newGuru.nama, kelas: newGuru.kelas }
      });
    }
  }

  if (pathname === '/api/guru' && query.id) {
    if (currentUser.role !== 'admin') {
      return sendJSON(res, 403, { success: false, message: 'Akses terbatas untuk Super Admin' });
    }

    const id = query.id;

    if (method === 'PUT') {
      const body = await parseRequestBody(req);
      const index = db.users.findIndex(u => u.id === id && u.role === 'guru');
      if (index === -1) {
        return sendJSON(res, 404, { success: false, message: 'Akun guru tidak ditemukan' });
      }

      if (body.password && body.password.trim()) {
        db.users[index].password = body.password.trim();
      }
      if (body.nama && body.nama.trim()) {
        db.users[index].nama = body.nama.trim();
      }
      if (body.kelas && MASTER_KELAS.includes(body.kelas)) {
        db.users[index].kelas = body.kelas;
      }

      db.users[index].updatedAt = new Date().toISOString();
      if (!await saveDatabaseOrReply(db, res)) return;
      return sendJSON(res, 200, {
        success: true,
        message: 'Akun guru berhasil diperbarui',
        data: {
          id: db.users[index].id,
          username: db.users[index].username,
          nama: db.users[index].nama,
          kelas: db.users[index].kelas
        }
      });
    }

    if (method === 'DELETE') {
      const index = db.users.findIndex(u => u.id === id && u.role === 'guru');
      if (index === -1) {
        return sendJSON(res, 404, { success: false, message: 'Akun guru tidak ditemukan' });
      }

      db.users.splice(index, 1);
      if (!await saveDatabaseOrReply(db, res)) return;
      return sendJSON(res, 200, { success: true, message: 'Akun guru berhasil dihapus' });
    }
  }

  // 404 Not Found
  return sendJSON(res, 404, { success: false, message: 'Endpoint tidak ditemukan' });
}

module.exports = handleRequest;

if (require.main === module) {
  const server = http.createServer(handleRequest);
  server.listen(PORT, () => {
    console.log('================================================================');
    console.log(`TPQ BAITUSSALAM HUDA MANSURIN - SISTEM PENGELOLAAN TPQ`);
    console.log(`Server aktif berjalan di: http://localhost:${PORT}`);
    console.log(`Waktu mulai: ${new Date().toLocaleString('id-ID')}`);
    console.log('================================================================');
  });
}

