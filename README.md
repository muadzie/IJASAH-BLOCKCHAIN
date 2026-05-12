# 🎓 IJAZAH DIGITAL BERBASIS BLOCKCHAIN
## Sistem Verifikasi Ijazah Digital

<p align="center">
  <img src="https://img.shields.io/badge/Blockchain-Ethereum-3C3CFF?style=for-the-badge&logo=ethereum&logoColor=white">
  <img src="https://img.shields.io/badge/Framework-Laravel-red?style=for-the-badge&logo=laravel&logoColor=white">
  <img src="https://img.shields.io/badge/Frontend-Next.js-black?style=for-the-badge&logo=next.js&logoColor=white">
  <img src="https://img.shields.io/badge/Database-MySQL-blue?style=for-the-badge&logo=mysql&logoColor=white">
</p>

<p align="center">
  Sistem modern untuk penerbitan, penyimpanan, dan verifikasi ijazah digital berbasis teknologi blockchain Ethereum.
</p>

---

# 📌 Tentang Proyek

**Ijazah Digital Berbasis Blockchain** merupakan sistem digitalisasi ijazah yang dikembangkan untuk mendukung proses penerbitan dan verifikasi ijazah secara aman, transparan, dan terintegrasi dengan teknologi blockchain.

Sistem ini dirancang untuk membantu institusi pendidikan dalam:

- Mengurangi risiko pemalsuan ijazah
- Mempermudah proses verifikasi dokumen akademik
- Menyediakan validasi data secara publik dan real-time
- Meningkatkan keamanan dan integritas data akademik

Implementasi blockchain memungkinkan setiap ijazah memiliki identitas digital unik yang tersimpan secara permanen dan dapat diverifikasi kapan saja.

---

# ✨ Fitur Utama

## 📄 Manajemen Ijazah Digital
- Pengelolaan data mahasiswa dan ijazah
- Generate hash dokumen otomatis
- Export PDF ijazah
- Generate QR Code verifikasi

## ⛓️ Integrasi Blockchain Ethereum
- Penyimpanan hash ijazah ke blockchain
- Dukungan Sepolia Testnet & Mainnet
- Validasi transaksi blockchain

## 🔍 Verifikasi Publik
Sistem menyediakan beberapa metode verifikasi:
- Verifikasi melalui hash
- Upload file PDF ijazah
- Scan QR Code
- Validasi data blockchain

## 👥 Role-Based Access Control (RBAC)
Hak akses pengguna dibagi menjadi:
- Super Admin
- Admin Akademik
- Verifikator
- Mahasiswa

## 📊 Dashboard Monitoring
- Statistik penerbitan ijazah
- Monitoring aktivitas sistem
- Audit trail pengguna
- Riwayat transaksi blockchain

---

# 🛠️ Teknologi yang Digunakan

## Frontend
- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- Axios
- React Query

## Backend
- Laravel 13
- PHP 8.3
- Laravel Sanctum
- Spatie Permission
- DomPDF
- QR Code Generator

## Database
- MySQL 8.0

## Blockchain
- Ethereum
- Sepolia Testnet
- web3p/web3.php

---

# 📂 Struktur Project

```bash
unsub-blockchain-ijazah/
│
├── backend/
│   ├── app/
│   ├── routes/
│   ├── database/
│   └── storage/
│
├── frontend/
│   ├── app/
│   ├── components/
│   ├── public/
│   └── services/
│
└── README.md
```

---

# ⚙️ Instalasi Project

## 📋 Prasyarat

Pastikan software berikut sudah terinstall:

- Node.js 20+
- PHP 8.3+
- Composer
- MySQL 8+
- Git

---

# 🚀 Clone Repository

```bash
git clone https://github.com/username/unsub-blockchain-ijazah.git
cd unsub-blockchain-ijazah
```

---

# 🔧 Setup Backend

Masuk ke folder backend:

```bash
cd backend
```

Copy file environment:

```bash
cp .env.example .env
```

Install dependency Laravel:

```bash
composer install
```

Generate application key:

```bash
php artisan key:generate
```

---

# 🗄️ Konfigurasi Database

Edit file `.env`

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=ijazah_blockchain
DB_USERNAME=root
DB_PASSWORD=
```

---

# 📦 Migrasi Database

```bash
php artisan migrate --seed
```

Buat symbolic link storage:

```bash
php artisan storage:link
```

Jalankan backend server:

```bash
php artisan serve
```

---

# 💻 Setup Frontend

Masuk ke folder frontend:

```bash
cd frontend
```

Copy environment file:

```bash
cp .env.example .env.local
```

Install dependency frontend:

```bash
npm install
```

Jalankan frontend:

```bash
npm run dev
```

---

# ⛓️ Konfigurasi Blockchain (Opsional)

Untuk mode development, sistem menggunakan **Mock Mode** secara default.

Jika ingin menggunakan jaringan Ethereum asli, edit konfigurasi berikut pada file `.env` backend:

```env
BLOCKCHAIN_RPC_URL=https://sepolia.infura.io/v3/YOUR_API_KEY
BLOCKCHAIN_CONTRACT_ADDRESS=0xXXXXXXXXXXXX
BLOCKCHAIN_MOCK_MODE=false
```

---

# 🔐 Keamanan Sistem

- Hash ijazah terenkripsi
- Validasi berbasis blockchain
- Role-based access control
- Audit log aktivitas pengguna
- Proteksi autentikasi menggunakan Laravel Sanctum

---

# 📸 Preview Sistem

> Tambahkan screenshot sistem di sini

```md
![Dashboard](public/images/dashboard.png)
```

---

# 👨‍💻 Developer

### Ilham Muadz Fakhrizi

Pengembang Sistem Ijazah Digital Berbasis Blockchain  


📧 Email: ilhammuadz133@gmail.com

---

# 📄 Lisensi

Hak Cipta © 2026 Ilham Mu'adz Fakhrizi

Seluruh hak cipta dilindungi undang-undang.  
Dilarang menyalin, mendistribusikan, atau memodifikasi sebagian maupun seluruh kode sumber aplikasi tanpa izin tertulis dari pengembang.

---

# ⭐ Dukungan

Jika proyek ini membantu, silakan berikan:

🌟 Star Repository  
🍴 Fork Project  
🛠️ Contribution & Feedback

---
