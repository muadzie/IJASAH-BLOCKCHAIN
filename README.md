# IJAZAH DIGITAL BERBASIS BLOCKCHAIN

## 📌 Tentang Proyek

Sistem Ijazah Digital Berbasis Blockchain untuk **Universitas Subang (UNSUB)**. Sebuah solusi inovatif untuk mendigitalisasi proses penerbitan ijazah, mengamankan data keabsahan ijazah menggunakan teknologi blockchain (Ethereum), dan menyediakan mekanisme verifikasi publik yang cepat, transparan, serta anti-pemalsuan.

## 🎯 Tujuan Utama

- Mendigitalisasi proses penerbitan ijazah, dari draft hingga terbit.
- Mengamankan integritas data ijazah dengan menyimpan hash-nya di blockchain.
- Menyediakan layanan verifikasi ijazah secara publik dan instan.
- Mencegah potensi pemalsuan ijazah.
- Menyediakan audit trail yang lengkap untuk setiap aktivitas.

## ✨ Fitur Utama

### Untuk Admin & Petugas Akademik
- **Autentikasi Pengguna:** Login, logout, dan manajemen password dengan token-based authentication (Laravel Sanctum).
- **Manajemen Mahasiswa:** CRUD data mahasiswa, import data massal (Excel/CSV), filter, dan pencarian.
- **Manajemen Ijazah:**
    - Generate ijazah (draft) dengan nomor unik, hash SHA-256, dan QR Code.
    - Publish ijazah ke blockchain Ethereum (dukungan Mock Mode untuk development).
    - Generate PDF ijazah resmi dengan QR Code dan link verifikasi.
    - Revoke ijazah jika diperlukan.
- **Dashboard & Statistik:** Visualisasi data real-time (total alumni, ijazah terbit, jumlah verifikasi) menggunakan Recharts.
- **Audit Trail:** Merekam semua aktivitas pengguna dan verifikasi (IP, user agent, timestamp, hasil).

### Untuk Pengguna Publik
- **Verifikasi Ijazah (Tanpa Login):**
    - **Via Hash:** Masukkan kode hash SHA-256 ijazah.
    - **Via Upload File:** Upload file PDF ijazah untuk diverifikasi.
    - **Via QR Code:** Scan QR Code pada ijazah yang akan langsung mengarahkan ke halaman verifikasi.
- **Hasil Verifikasi:** Menampilkan status keabsahan ijazah (VALID/INVALID/REVOKED) dan detail mahasiswa jika valid.

## 🛠️ Teknologi yang Digunakan

### Frontend (Client-Side)
| Teknologi | Versi | Fungsi |
| :--- | :--- | :--- |
| Next.js (App Router) | 16.2.6 | React framework untuk frontend full-stack. |
| React | 19.2.4 | Library untuk membangun antarmuka pengguna. |
| TypeScript | 5.x | Menambahkan type safety pada kode JavaScript. |
| Tailwind CSS | 4.x | Framework CSS untuk styling utility-first. |
| TanStack React Query | 5.100.9 | Manajemen state server-side dan data fetching. |
| Axios | 1.16.0 | HTTP client untuk komunikasi dengan API backend. |
| React Hook Form & Zod | 7.75.0 & 4.4.3 | Penanganan dan validasi form. |
| Recharts | 3.8.1 | Library untuk chart dan diagram pada dashboard. |

### Backend (Server-Side)
| Teknologi | Versi | Fungsi |
| :--- | :--- | :--- |
| PHP | ^8.3 | Bahasa pemrograman backend. |
| Laravel | 13.x | Framework PHP untuk membangun API dan logika bisnis. |
| Laravel Sanctum | 4.3 | Manajemen autentikasi API (token-based). |
| Spatie Permission | 7.4 | Manajemen Role-Based Access Control (RBAC). |
| Laravel DomPDF | 3.1 | Generate file PDF ijazah. |
| Endroid QR Code | 6.1 | Generate QR Code untuk link verifikasi. |
| web3p/web3.php | 0.1.6 | Library PHP untuk berinteraksi dengan node Ethereum via JSON-RPC. |

### Database & Blockchain
| Teknologi | Fungsi |
| :--- | :--- |
| MySQL 8.0+ | Database relasional untuk menyimpan data master dan transaksional. |
| **Blockchain (Ethereum)** | Menyimpan hash ijazah secara immutable. |
| - Sepolia Testnet | Jaringan development. |
| - Mainnet | Jaringan production. |

### Infrastruktur & Tools
- **Dependency Manager:** Composer (PHP), NPM/Yarn (Node.js)
- **Version Control:** Git
- **Local Environment:** Laragon (Windows) / Docker

## 🗺️ Arsitektur Sistem

Sistem dibangun dengan arsitektur berlapis (Layered Architecture) yang memisahkan tanggung jawab setiap komponen.

1.  **Presentation Layer (Frontend - Next.js):** Menangani tampilan UI, routing, dan interaksi pengguna.
2.  **Application Layer (Backend - Laravel Controllers):** Menerima request, validasi, autentikasi, dan otorisasi.
3.  **Service Layer (Laravel Services):** Tempat semua logika bisnis, seperti interaksi blockchain dan generate PDF.
4.  **Persistence Layer (Eloquent ORM + MySQL):** Mengelola penyimpanan dan pengambilan data dari database.

```text
[Browser / Pengguna] <--> [Next.js Frontend] <--(REST API)--> [Laravel Backend] <--> [MySQL Database]
                                                                   |
                                                                   v
                                                            [Blockchain Service]
                                                                   |
                                                                   v
                                                         [Ethereum Network]
