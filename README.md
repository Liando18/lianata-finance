<div align="center">
  <img src="/public/logo-lianata-finance.png" alt="Lianata Finance" width="80" height="80" />
  <h1 align="center">Lianata Finance</h1>
  <p align="center">
    Aplikasi manajemen keuangan untuk pribadi, UMKM, dan bisnis
    <br />
    Catat, pantau, dan kendalikan keuanganmu dalam satu platform
  </p>
  <p align="center">
    <strong>Dikembangkan oleh Aprilian Gevindo & Hesti Ananta</strong>
  </p>
</div>

---

## Tentang Lianata Finance

Lianata Finance adalah aplikasi web manajemen keuangan yang dirancang untuk membantu individu, pelaku UMKM, dan bisnis dalam mengelola keuangan secara efektif. Aplikasi ini menyediakan alat untuk mencatat pemasukan dan pengeluaran, memantau pola belanja, merencanakan anggaran, melacak utang, serta mendeteksi anomali keuangan menggunakan kecerdasan buatan (machine learning).

## Tujuan

Memberikan solusi keuangan yang mudah diakses, bebas biaya, dan berbasis data — membantu pengguna mengambil keputusan finansial yang lebih baik setiap hari.

## Fitur Unggulan

### 🔐 Autentikasi & Keamanan

- Registrasi multi-langkah dengan verifikasi OTP email
- Login email/password dan Google OAuth
- Role-based access control: **User**, **Admin**, **Owner**
- Sistem aktivitas log untuk audit trail

### 📊 Dashboard Interaktif

- Statistik keuangan real-time
- Grafik pemasukan & pengeluaran per bulan
- Transaksi terbaru
- Saldo dompet terpusat

### 💰 Manajemen Keuangan

- **Transaksi** — Catat pemasukan & pengeluaran
- **Dompet** — Kelola saldo berbagai akun
- **Kategori** — Atur transaksi berdasarkan jenis
- **Anggaran** — Rencanakan batas pengeluaran
- **Utang** — Pantau tagihan dan jatuh tempo
- **Tagihan Berulang** — Otomatis catat transaksi periodik
- **Laporan** — Lihat rekap keuangan secara menyeluruh

### 🤖 Kecerdasan Buatan

- **Segmentasi Pengguna** — Klasifikasi pengguna ke dalam tipe _Hemat_, _Konsumtif_, atau _Impulsif_ menggunakan algoritma K-Means
- **Deteksi Anomali** — Identifikasi transaksi mencurigakan dengan Isolation Forest

## Teknologi

| Lapisan              | Teknologi                                   |
| -------------------- | ------------------------------------------- |
| **Framework**        | Next.js 16 (App Router, Turbopack)          |
| **Bahasa**           | TypeScript                                  |
| **UI**               | React 19, Tailwind CSS v4, Framer Motion    |
| **Database**         | PostgreSQL (Neon) via Drizzle ORM           |
| **NoSQL**            | MongoDB (Atlas) — log aktivitas & anomali   |
| **Autentikasi**      | Better Auth (email/password + Google OAuth) |
| **Email**            | nodemailer — OTP, reset password            |
| **Machine Learning** | K-Means Clustering, Isolation Forest        |
| **Notifikasi**       | sonner (toast)                              |

## Cara Memulai

```bash
# Clone repositori
git clone https://github.com/username/lianata-finance.git

# Masuk ke direktori
cd lianata-finance

# Install dependensi
npm install

# Salin file environment
cp .env.example .env.local
# Isi konfigurasi database, auth, email di .env.local

# Setup database
npm run db:migrate

# Jalankan development server
npm run dev
```

## Lingkungan Pengembangan

| Variabel               | Keterangan                       |
| ---------------------- | -------------------------------- |
| `DATABASE_URL`         | Koneksi PostgreSQL Neon (pooler) |
| `MONGODB_URI`          | Koneksi MongoDB Atlas            |
| `BETTER_AUTH_SECRET`   | Secret key untuk Better Auth     |
| `BETTER_AUTH_URL`      | URL aplikasi                     |
| `GOOGLE_CLIENT_ID`     | Client ID Google OAuth           |
| `GOOGLE_CLIENT_SECRET` | Client Secret Google OAuth       |
| `GMAIL_APP_PASSWORD`   | App password Gmail untuk SMTP    |
| `EMAIL_FROM`           | Alamat email pengirim            |

## Developer

- **Aprilian Gevindo** — Pengembang utama
- **Hesti Ananta** — Pengembang utama

---

<div align="center">
  <p>Lianata Finance — Aplikasi manajemen keuangan gratis untuk semua.</p>
</div>
