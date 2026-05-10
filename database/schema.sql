-- Ijazah Blockchain - Universitas Subang
-- Database Schema untuk MySQL 8.0+

CREATE DATABASE IF NOT EXISTS ijazah_blockchain;
USE ijazah_blockchain;

-- Tabel fakultas
CREATE TABLE IF NOT EXISTS fakultas (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    kode VARCHAR(10) UNIQUE NOT NULL,
    nama VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabel prodi
CREATE TABLE IF NOT EXISTS prodi (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    fakultas_id CHAR(36) NOT NULL,
    kode VARCHAR(10) UNIQUE NOT NULL,
    nama VARCHAR(255) NOT NULL,
    jenjang ENUM('D3', 'D4', 'S1', 'S2', 'S3') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (fakultas_id) REFERENCES fakultas(id) ON DELETE CASCADE
);

-- Tabel users
CREATE TABLE IF NOT EXISTS users (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    email_verified_at TIMESTAMP NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('super_admin', 'admin_akademik', 'mahasiswa', 'verifikator') DEFAULT 'mahasiswa',
    two_factor_secret TEXT NULL,
    two_factor_recovery_codes TEXT NULL,
    remember_token VARCHAR(100) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabel mahasiswa
CREATE TABLE IF NOT EXISTS mahasiswa (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    nim VARCHAR(20) UNIQUE NOT NULL,
    nama_lengkap VARCHAR(255) NOT NULL,
    tempat_lahir VARCHAR(100),
    tanggal_lahir DATE,
    jenis_kelamin ENUM('L', 'P'),
    prodi_id CHAR(36) NOT NULL,
    tahun_masuk VARCHAR(4),
    tahun_lulus VARCHAR(4),
    ipk DECIMAL(4,2) DEFAULT NULL,
    judul_skripsi TEXT,
    email VARCHAR(255) UNIQUE NOT NULL,
    no_hp VARCHAR(20),
    foto TEXT,
    status ENUM('aktif', 'lulus', 'dropout') DEFAULT 'aktif',
    user_id CHAR(36) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (prodi_id) REFERENCES prodi(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Tabel ijazah
CREATE TABLE IF NOT EXISTS ijazah (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    mahasiswa_id CHAR(36) NOT NULL,
    nomor_ijazah VARCHAR(50) UNIQUE NOT NULL,
    hash_sha256 VARCHAR(64) UNIQUE NOT NULL,
    pdf_hash VARCHAR(64) NULL,
    qr_code_path VARCHAR(255),
    file_path VARCHAR(255),
    blockchain_tx_hash VARCHAR(66),
    blockchain_block VARCHAR(20),
    blockchain_timestamp TIMESTAMP NULL,
    status ENUM('draft', 'pending', 'issued', 'revoked') DEFAULT 'draft',
    issued_by CHAR(36),
    issued_at TIMESTAMP NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (mahasiswa_id) REFERENCES mahasiswa(id),
    FOREIGN KEY (issued_by) REFERENCES users(id)
);

-- Tabel blockchain_transactions
CREATE TABLE IF NOT EXISTS blockchain_transactions (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    ijazah_id CHAR(36),
    tx_hash VARCHAR(66) NOT NULL,
    block_hash VARCHAR(66),
    block_number BIGINT,
    from_address VARCHAR(42),
    to_address VARCHAR(42),
    gas_used BIGINT,
    type ENUM('issue', 'verify', 'revoke') NOT NULL,
    payload JSON,
    status ENUM('pending', 'confirmed', 'failed') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (ijazah_id) REFERENCES ijazah(id) ON DELETE SET NULL
);

-- Tabel verification_logs
CREATE TABLE IF NOT EXISTS verification_logs (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    ijazah_id CHAR(36),
    certificate_hash VARCHAR(64),
    verification_method ENUM('hash', 'file_upload', 'qr_code') NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    verification_result JSON,
    is_valid BOOLEAN,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ijazah_id) REFERENCES ijazah(id) ON DELETE SET NULL
);

-- Tabel activity_logs
CREATE TABLE IF NOT EXISTS activity_logs (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id CHAR(36),
    action VARCHAR(100),
    description TEXT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    metadata JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Tabel personal_access_tokens (Laravel Sanctum)
CREATE TABLE IF NOT EXISTS personal_access_tokens (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    tokenable_type VARCHAR(255) NOT NULL,
    tokenable_id CHAR(36) NOT NULL,
    name VARCHAR(255) NOT NULL,
    token VARCHAR(64) UNIQUE NOT NULL,
    abilities TEXT NULL,
    last_used_at TIMESTAMP NULL,
    expires_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_tokenable (tokenable_type, tokenable_id)
);

-- Tabel cache (gunakan backtick karena `key` reserved word)
CREATE TABLE IF NOT EXISTS `cache` (
    `key` VARCHAR(255) PRIMARY KEY,
    value MEDIUMTEXT NOT NULL,
    expiration INT NOT NULL
);

CREATE TABLE IF NOT EXISTS cache_locks (
    `key` VARCHAR(255) PRIMARY KEY,
    owner VARCHAR(255) NOT NULL,
    expiration INT NOT NULL
);

CREATE TABLE IF NOT EXISTS jobs (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    queue VARCHAR(255) NOT NULL,
    payload LONGTEXT NOT NULL,
    attempts TINYINT UNSIGNED NOT NULL,
    reserved_at INT UNSIGNED NULL,
    available_at INT UNSIGNED NOT NULL,
    created_at INT UNSIGNED NOT NULL,
    INDEX idx_queue (queue)
);

CREATE TABLE IF NOT EXISTS job_batches (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    total_jobs INT NOT NULL,
    pending_jobs INT NOT NULL,
    failed_jobs INT NOT NULL,
    failed_job_ids TEXT NOT NULL,
    options MEDIUMTEXT NULL,
    cancelled_at INT UNSIGNED NULL,
    created_at INT UNSIGNED NOT NULL,
    finished_at INT UNSIGNED NULL
);

CREATE TABLE IF NOT EXISTS failed_jobs (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    uuid VARCHAR(255) UNIQUE NOT NULL,
    connection TEXT NOT NULL,
    queue TEXT NOT NULL,
    payload LONGTEXT NOT NULL,
    exception LONGTEXT NOT NULL,
    failed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabel permission (Spatie)
CREATE TABLE IF NOT EXISTS permissions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    guard_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE INDEX idx_name_guard (name, guard_name)
);

CREATE TABLE IF NOT EXISTS roles (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    guard_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE INDEX idx_name_guard (name, guard_name)
);

CREATE TABLE IF NOT EXISTS model_has_roles (
    role_id BIGINT NOT NULL,
    model_type VARCHAR(255) NOT NULL,
    model_id CHAR(36) NOT NULL,
    PRIMARY KEY (role_id, model_id, model_type),
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    INDEX idx_model (model_type, model_id)
);

CREATE TABLE IF NOT EXISTS model_has_permissions (
    permission_id BIGINT NOT NULL,
    model_type VARCHAR(255) NOT NULL,
    model_id CHAR(36) NOT NULL,
    PRIMARY KEY (permission_id, model_id, model_type),
    FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE,
    INDEX idx_model (model_type, model_id)
);

CREATE TABLE IF NOT EXISTS role_has_permissions (
    permission_id BIGINT NOT NULL,
    role_id BIGINT NOT NULL,
    PRIMARY KEY (permission_id, role_id),
    FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
);

-- Index untuk performa
CREATE INDEX idx_mahasiswa_nim ON mahasiswa(nim);
CREATE INDEX idx_mahasiswa_email ON mahasiswa(email);
CREATE INDEX idx_ijazah_hash ON ijazah(hash_sha256);
CREATE INDEX idx_ijazah_nomor ON ijazah(nomor_ijazah);
CREATE INDEX idx_verification_logs_hash ON verification_logs(certificate_hash);
CREATE INDEX idx_verification_logs_created ON verification_logs(created_at);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- Insert data awal
INSERT INTO fakultas (id, kode, nama) VALUES
(UUID(), 'FIK', 'Fakultas Ilmu Komputer'),
(UUID(), 'FE', 'Fakultas Ekonomi'),
(UUID(), 'FH', 'Fakultas Hukum');

INSERT INTO prodi (id, fakultas_id, kode, nama, jenjang)
SELECT UUID(), f.id, 'TI', 'Teknik Informatika', 'S1' FROM fakultas f WHERE f.kode = 'FIK'
UNION ALL
SELECT UUID(), f.id, 'SI', 'Sistem Informasi', 'S1' FROM fakultas f WHERE f.kode = 'FIK'
UNION ALL
SELECT UUID(), f.id, 'MAN', 'Manajemen', 'S1' FROM fakultas f WHERE f.kode = 'FE';

-- Insert user super admin (password: admin123)
INSERT INTO users (id, name, email, password, role) VALUES
(UUID(), 'Super Admin', 'admin@unsub.ac.id', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'super_admin');

-- Insert roles (Spatie)
INSERT INTO roles (name, guard_name) VALUES
('super_admin', 'web'),
('admin_akademik', 'web'),
('mahasiswa', 'web'),
('verifikator', 'web');

-- Assign super admin role
INSERT INTO model_has_roles (role_id, model_type, model_id)
SELECT r.id, 'App\\Models\\User', u.id
FROM roles r, users u
WHERE r.name = 'super_admin' AND u.email = 'admin@unsub.ac.id';
