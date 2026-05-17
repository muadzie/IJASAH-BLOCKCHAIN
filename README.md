<<<<<<< HEAD
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
=======
# Ijazah Blockchain - Universitas Subang (Sepolia Testnet)

Sistem verifikasi ijazah digital berbasis **Ethereum Sepolia Testnet** untuk Universitas Subang (UNSUB).

## ⚠️ PENTING: TESTNET, BUKAN MAINNET!

- **Network**: Sepolia Testnet (Chain ID: 11155111)
- **Gas**: SepoliaETH gratis dari faucet
- **Tidak ada uang sungguhan** yang digunakan
- Untuk production, deploy ulang ke Ethereum Mainnet

## Teknologi

| Komponen | Teknologi |
|----------|-----------|
| Backend | Laravel 13 + PHP 8.3 |
| Frontend | Next.js 16 + React 19 + TypeScript |
| Database | MySQL 8.0 |
| Blockchain | Ethereum Sepolia Testnet |
| Smart Contract | Solidity ^0.8.19 |
| Library Blockchain | web3p/web3.php (backend), ethers.js v6 (frontend) |
| Block Explorer | https://sepolia.etherscan.io |

## Konsep

Sistem ini **bukan** untuk generate ijazah baru, tetapi untuk:

1. **Upload** file PDF ijazah yang sudah ada dari kampus
2. **Auto-hitung** SHA-256 hash dari file PDF
3. **Simpan hash** ke smart contract di Sepolia Testnet
4. **Verifikasi** keaslian dengan mencocokkan hash ke Sepolia
5. **QR Code** berisi link verifikasi ke Sepolia Etherscan

## Alur Sistem

```
Upload PDF → Hitung SHA-256 → Store ke Smart Contract (Sepolia) → Storage Lokal
                              ↓
                    QR Code → Link Verifikasi
                              ↓
                    Publik bisa verifikasi via Hash/File/QR
```

## Smart Contract

`contracts/IjazahStorage.sol` - Smart contract untuk:

- `storeCertificate()` - Menyimpan hash + metadata ke Sepolia
- `verifyCertificate()` - Verifikasi dari Sepolia (read-only)
- `revokeCertificate()` - Mencabut sertifikat di Sepolia

## Persyaratan

- PHP ^8.3
- Composer
- Node.js ^18
- MySQL 8.0+
- MetaMask (untuk admin upload)
- SepoliaETH dari faucet (untuk gas)

## Instalasi

### 1. Backend

```bash
cd backend
composer install
cp .env.example .env
# Edit .env: database, blockchain config
php artisan key:generate
php artisan migrate --seed
php artisan storage:link
php artisan serve
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

### 3. Deploy Smart Contract ke Sepolia

```bash
# Install Foundry (https://book.getfoundry.sh)
forge create --rpc-url https://rpc.sepolia.org \
  --private-key YOUR_PRIVATE_KEY \
  contracts/IjazahStorage.sol:IjazahStorage
```

Update `.env` dengan contract address setelah deploy.

### 4. Dapatkan SepoliaETH (gratis)

- https://sepoliafaucet.com (Alchemy)
- https://faucet.quicknode.com/ethereum/sepolia
- https://sepolia-faucet.pk910.de (PoW faucet)

## Akun Demo

| Role | Email | Password |
|------|-------|----------|
| Super Admin | admin@unsub.ac.id | admin123 |

## API Endpoints

### Public (Verifikasi via Sepolia)
- `POST /api/verify/hash` - Verifikasi hash ke smart contract Sepolia
- `POST /api/verify/file` - Upload PDF, auto-hash, verifikasi ke Sepolia
- `GET /api/verify/{hash}` - Verifikasi via URL (QR code)
- `GET /api/verify/stats` - Statistik
- `GET /api/verify/etherscan/{txHash}` - Redirect ke Sepolia Etherscan

### Admin (Upload ke Sepolia)
- `POST /api/ijazah/upload` - Upload PDF + simpan hash ke Sepolia
- `GET /api/ijazah` - List ijazah
- `GET /api/ijazah/{id}` - Detail + link Sepolia Etherscan
- `POST /api/ijazah/{id}/revoke` - Revoke di Sepolia
- `GET /api/ijazah/blockchain/stats` - Statistik Sepolia
- `GET /api/ijazah/blockchain/balance` - Cek balance SepoliaETH

## Struktur Proyek

```
ijazah-blockchain-unsub/
├── contracts/
│   └── IjazahStorage.sol       # Smart Contract untuk Sepolia
├── backend/                     # Laravel API
│   ├── app/
│   │   ├── Http/Controllers/API/
│   │   │   ├── IjazahController.php     # Upload & manajemen
│   │   │   ├── VerificationController.php # Verifikasi via Sepolia
│   │   │   ├── AuthController.php
│   │   │   └── ...
│   │   └── Services/
│   │       └── BlockchainService.php     # Sepolia integration
│   └── routes/api.php
├── frontend/                    # Next.js App
│   ├── app/
│   │   ├── dashboard/sertifikat/  # Upload page (MetaMask)
│   │   ├── verify/                # Verification pages
│   │   └── ...
│   └── hooks/
│       └── useWallet.ts          # MetaMask wallet hook
└── database/
    └── schema.sql
```

## Lisensi

MIT
>>>>>>> cf740bb (update)
