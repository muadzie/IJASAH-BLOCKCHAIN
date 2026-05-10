# IJAZAH DIGITAL BERBASIS BLOCKCHAIN
## Universitas Subang (UNSUB)

**Pengembang:** Ilham Muadz Fakhrizi  
**Tahun:** 2026

---

## Tentang Proyek

Sistem Ijazah Digital Berbasis Blockchain untuk Universitas Subang (UNSUB) adalah solusi digitalisasi penerbitan ijazah yang terintegrasi dengan teknologi blockchain Ethereum. Sistem ini memungkinkan penerbitan ijazah yang aman, verifikasi publik yang cepat, dan pencegahan pemalsuan ijazah.

**Fitur Utama:**
- Manajemen mahasiswa dan ijazah
- Penerbitan ijazah ke blockchain Ethereum
- Verifikasi ijazah publik (via hash, upload PDF, atau QR Code)
- Dashboard statistik real-time
- Role-Based Access Control (Super Admin, Admin Akademik, Verifikator, Mahasiswa)
- Audit trail lengkap

---

## Teknologi

**Frontend:**
- Next.js 16 (App Router)
- React 19 & TypeScript
- Tailwind CSS
- React Query & Axios

**Backend:**
- PHP 8.3 & Laravel 13
- Laravel Sanctum (autentikasi)
- Spatie Permission (RBAC)
- DomPDF & QR Code Generator

**Database:**
- MySQL 8.0

**Blockchain:**
- Ethereum (Sepolia Testnet / Mainnet)
- web3p/web3.php

---

## Instalasi

### Prasyarat

- Node.js (20.x LTS)
- PHP (8.3+)
- Composer
- MySQL (8.0+)
- Git

### Langkah Instalasi

**1. Clone Repository**

git clone https://github.com/ilhamfakhrizi/unsub-blockchain-ijazah.git
cd unsub-blockchain-ijazah

**setup backend**

cd backend
cp .env.example .env
composer install
php artisan key:generate

**setup .env**

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=ijazah_blockchain
DB_USERNAME=root
DB_PASSWORD=

**jalankan migrasi**

php artisan migrate --seed
php artisan storage:link
php artisan serve

**setup frontend**

cd frontend
cp .env.example .env.local
npm install

**Konfigurasi Blockchain (Opsional)**

Untuk mode development, sistem menggunakan Mock Mode secara default. Untuk koneksi ke jaringan nyata, sesuaikan konfigurasi blockchain di file .env backend:
BLOCKCHAIN_RPC_URL=https://sepolia.infura.io/v3/your-api-key
BLOCKCHAIN_CONTRACT_ADDRESS=0x...
BLOCKCHAIN_MOCK_MODE=false

**Kontribusi**
Proyek ini dikembangkan untuk kebutuhan internal Universitas Subang. Untuk saran, masukan, atau pelaporan bug, silakan menghubungi:

Ilham Muadz Fakhrizi
Email: ilham@unsub.ac.id

Lisensi & Hak Cipta
Hak Cipta © 2026 Universitas Subang (UNSUB). Seluruh hak cipta dilindungi undang-undang.

Dilarang menyalin, mendistribusikan, atau memodifikasi sebagian atau seluruh kode sumber aplikasi ini tanpa izin tertulis dari pengembang.
