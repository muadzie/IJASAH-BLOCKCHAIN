<?php

namespace Database\Seeders;

use App\Models\Fakultas;
use App\Models\Prodi;
use App\Models\User;
use App\Models\Mahasiswa;
use App\Models\Ijazah;
use App\Models\BlockchainTransaction;
use App\Models\ActivityLog;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class InitialDataSeeder extends Seeder
{
    public function run(): void
    {
        $fakultasData = [
            ['id' => Str::uuid()->toString(), 'kode' => 'FIK', 'nama' => 'Fakultas Ilmu Komputer'],
            ['id' => Str::uuid()->toString(), 'kode' => 'FE', 'nama' => 'Fakultas Ekonomi'],
            ['id' => Str::uuid()->toString(), 'kode' => 'FH', 'nama' => 'Fakultas Hukum'],
            ['id' => Str::uuid()->toString(), 'kode' => 'FISIP', 'nama' => 'Fakultas Ilmu Sosial dan Ilmu Politik'],
            ['id' => Str::uuid()->toString(), 'kode' => 'FKIP', 'nama' => 'Fakultas Keguruan dan Ilmu Pendidikan'],
        ];

        foreach ($fakultasData as $data) {
            Fakultas::create($data);
        }

        $prodiData = [
            ['fakultas_kode' => 'FIK', 'kode' => 'TI', 'nama' => 'Teknik Informatika', 'jenjang' => 'S1'],
            ['fakultas_kode' => 'FIK', 'kode' => 'SI', 'nama' => 'Sistem Informasi', 'jenjang' => 'S1'],
            ['fakultas_kode' => 'FIK', 'kode' => 'TK', 'nama' => 'Teknik Komputer', 'jenjang' => 'S1'],
            ['fakultas_kode' => 'FE', 'kode' => 'MAN', 'nama' => 'Manajemen', 'jenjang' => 'S1'],
            ['fakultas_kode' => 'FE', 'kode' => 'AK', 'nama' => 'Akuntansi', 'jenjang' => 'S1'],
            ['fakultas_kode' => 'FE', 'kode' => 'EP', 'nama' => 'Ekonomi Pembangunan', 'jenjang' => 'S1'],
            ['fakultas_kode' => 'FH', 'kode' => 'IH', 'nama' => 'Ilmu Hukum', 'jenjang' => 'S1'],
            ['fakultas_kode' => 'FISIP', 'kode' => 'AN', 'nama' => 'Administrasi Negara', 'jenjang' => 'S1'],
            ['fakultas_kode' => 'FISIP', 'kode' => 'HI', 'nama' => 'Hubungan Internasional', 'jenjang' => 'S1'],
            ['fakultas_kode' => 'FKIP', 'kode' => 'PGSD', 'nama' => 'Pendidikan Guru SD', 'jenjang' => 'S1'],
        ];

        foreach ($prodiData as $data) {
            $fakultas = Fakultas::where('kode', $data['fakultas_kode'])->first();
            Prodi::create([
                'fakultas_id' => $fakultas->id,
                'kode' => $data['kode'],
                'nama' => $data['nama'],
                'jenjang' => $data['jenjang'],
            ]);
        }

        $superAdmin = User::create([
            'name' => 'Super Admin',
            'email' => 'admin@unsub.ac.id',
            'password' => Hash::make('admin123'),
            'role' => 'super_admin',
        ]);
        $superAdmin->assignRole('super_admin');

        $adminAkademik = User::create([
            'name' => 'Admin Akademik',
            'email' => 'akademik@unsub.ac.id',
            'password' => Hash::make('akademik123'),
            'role' => 'admin_akademik',
        ]);
        $adminAkademik->assignRole('admin_akademik');

        $verifikator = User::create([
            'name' => 'Verifikator',
            'email' => 'verifikator@unsub.ac.id',
            'password' => Hash::make('verifikator123'),
            'role' => 'verifikator',
        ]);
        $verifikator->assignRole('verifikator');

        $tiProdi = Prodi::where('kode', 'TI')->first();
        $siProdi = Prodi::where('kode', 'SI')->first();

        $mahasiswaUser = User::create([
            'name' => 'Mahasiswa TI',
            'email' => 'mahasiswa@unsub.ac.id',
            'password' => Hash::make('mahasiswa123'),
            'role' => 'mahasiswa',
        ]);
        $mahasiswaUser->assignRole('mahasiswa');

        Mahasiswa::create([
            'nim' => '20200121001',
            'nama_lengkap' => 'Ahmad Fauzi',
            'tempat_lahir' => 'Subang',
            'tanggal_lahir' => '2001-05-15',
            'jenis_kelamin' => 'L',
            'prodi_id' => $tiProdi->id,
            'tahun_masuk' => '2020',
            'email' => 'mahasiswa@unsub.ac.id',
            'no_hp' => '081234567890',
            'status' => 'lulus',
            'ipk' => 3.75,
            'judul_skripsi' => 'Implementasi Blockchain untuk Verifikasi Ijazah Digital',
            'tahun_lulus' => '2024',
            'user_id' => $mahasiswaUser->id,
        ]);

        Mahasiswa::create([
            'nim' => '20200121002',
            'nama_lengkap' => 'Siti Nurhaliza',
            'tempat_lahir' => 'Bandung',
            'tanggal_lahir' => '2002-08-20',
            'jenis_kelamin' => 'P',
            'prodi_id' => $siProdi->id,
            'tahun_masuk' => '2020',
            'email' => 'siti.nurhaliza@unsub.ac.id',
            'no_hp' => '081234567891',
            'status' => 'lulus',
            'ipk' => 3.85,
            'judul_skripsi' => 'Sistem Informasi Manajemen Aset Berbasis Web',
            'tahun_lulus' => '2024',
            'user_id' => null,
        ]);

        Mahasiswa::create([
            'nim' => '20210121003',
            'nama_lengkap' => 'Budi Santoso',
            'tempat_lahir' => 'Jakarta',
            'tanggal_lahir' => '2003-01-10',
            'jenis_kelamin' => 'L',
            'prodi_id' => $tiProdi->id,
            'tahun_masuk' => '2021',
            'email' => 'budi.santoso@unsub.ac.id',
            'status' => 'aktif',
            'user_id' => null,
        ]);

        // Create demo certificates
        $mahasiswa1 = Mahasiswa::where('nim', '20200121001')->first();
        $mahasiswa2 = Mahasiswa::where('nim', '20200121002')->first();

        $hash1 = hash('sha256', json_encode([
            'nim' => $mahasiswa1->nim,
            'nama' => $mahasiswa1->nama_lengkap,
            'prodi' => $tiProdi->nama,
            'ipk' => 3.75,
            'nomor_ijazah' => "UNSUB/TI/2024/A1B2C3",
            'tanggal_lulus' => '2024-09-15',
            'timestamp' => now()->subDays(30)->timestamp
        ]));

        $hash2 = hash('sha256', json_encode([
            'nim' => $mahasiswa2->nim,
            'nama' => $mahasiswa2->nama_lengkap,
            'prodi' => $siProdi->nama,
            'ipk' => 3.85,
            'nomor_ijazah' => "UNSUB/SI/2024/D4E5F6",
            'tanggal_lulus' => '2024-09-20',
            'timestamp' => now()->subDays(15)->timestamp
        ]));

        $cert1 = Ijazah::create([
            'mahasiswa_id' => $mahasiswa1->id,
            'nomor_ijazah' => 'UNSUB/TI/2024/A1B2C3',
            'hash_sha256' => $hash1,
            'qr_code_path' => 'qr_codes/UNSUB/TI/2024/A1B2C3.svg',
            'status' => 'issued',
            'issued_by' => $adminAkademik->id,
            'blockchain_tx_hash' => '0x' . bin2hex(random_bytes(32)),
            'blockchain_block' => (string) rand(10000000, 99999999),
            'blockchain_timestamp' => now()->subDays(28),
            'issued_at' => now()->subDays(28),
            'file_path' => 'ijazah/UNSUB/TI/2024/A1B2C3.pdf',
            'notes' => 'Demo certificate - published to blockchain',
        ]);

        $cert2 = Ijazah::create([
            'mahasiswa_id' => $mahasiswa2->id,
            'nomor_ijazah' => 'UNSUB/SI/2024/D4E5F6',
            'hash_sha256' => $hash2,
            'qr_code_path' => null,
            'status' => 'draft',
            'issued_by' => $adminAkademik->id,
            'blockchain_tx_hash' => null,
            'blockchain_block' => null,
            'blockchain_timestamp' => null,
            'issued_at' => null,
            'file_path' => null,
            'notes' => 'Demo certificate - draft mode',
        ]);

        BlockchainTransaction::create([
            'ijazah_id' => $cert1->id,
            'tx_hash' => $cert1->blockchain_tx_hash,
            'block_number' => (int) $cert1->blockchain_block,
            'from_address' => '0x_mock_admin_address',
            'to_address' => '0x_mock_contract_address',
            'type' => 'issue',
            'payload' => [
                'student_name' => $mahasiswa1->nama_lengkap,
                'student_nim' => $mahasiswa1->nim,
                'hash' => $hash1,
                'diploma_number' => $cert1->nomor_ijazah
            ],
            'status' => 'confirmed',
        ]);

        ActivityLog::create([
            'user_id' => $adminAkademik->id,
            'action' => 'generate_certificate',
            'description' => "Generated certificate for {$mahasiswa1->nama_lengkap} ({$mahasiswa1->nim})",
            'ip_address' => '127.0.0.1',
            'user_agent' => 'Seeder',
        ]);

        ActivityLog::create([
            'user_id' => $adminAkademik->id,
            'action' => 'publish_certificate',
            'description' => "Published certificate {$cert1->nomor_ijazah} to blockchain",
            'ip_address' => '127.0.0.1',
            'user_agent' => 'Seeder',
        ]);

        ActivityLog::create([
            'user_id' => $adminAkademik->id,
            'action' => 'generate_certificate',
            'description' => "Generated certificate for {$mahasiswa2->nama_lengkap} ({$mahasiswa2->nim})",
            'ip_address' => '127.0.0.1',
            'user_agent' => 'Seeder',
        ]);
    }
}
