<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Mahasiswa;
use App\Models\Ijazah;
use App\Models\VerificationLog;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function getStats(Request $request)
    {
        $user = $request->user();
        $role = $user->role;

        if ($role === 'mahasiswa') {
            $mahasiswa = $user->mahasiswa;
            $ijazah = $mahasiswa?->ijazah;

            return response()->json([
                'role' => 'mahasiswa',
                'profile' => $mahasiswa ? [
                    'id' => $mahasiswa->id,
                    'nim' => $mahasiswa->nim,
                    'nama_lengkap' => $mahasiswa->nama_lengkap,
                    'tempat_lahir' => $mahasiswa->tempat_lahir,
                    'tanggal_lahir' => $mahasiswa->tanggal_lahir?->format('d F Y'),
                    'jenis_kelamin' => $mahasiswa->jenis_kelamin,
                    'prodi' => $mahasiswa->prodi?->nama,
                    'fakultas' => $mahasiswa->prodi?->fakultas?->nama,
                    'tahun_masuk' => $mahasiswa->tahun_masuk,
                    'tahun_lulus' => $mahasiswa->tahun_lulus,
                    'ipk' => $mahasiswa->ipk,
                    'status' => $mahasiswa->status,
                    'email' => $mahasiswa->email,
                    'no_hp' => $mahasiswa->no_hp,
                ] : null,
                'certificate' => $ijazah ? [
                    'id' => $ijazah->id,
                    'nomor_ijazah' => $ijazah->nomor_ijazah,
                    'hash_sha256' => $ijazah->hash_sha256,
                    'status' => $ijazah->status,
                    'issued_at' => $ijazah->issued_at?->format('d F Y'),
                    'blockchain_verified' => !is_null($ijazah->blockchain_tx_hash),
                ] : null,
                'stats' => [
                    'total_verifications' => VerificationLog::where('certificate_hash', $ijazah?->hash_sha256)->count(),
                ]
            ]);
        }

        $totalAlumni = Mahasiswa::where('status', 'lulus')->count();
        $totalMahasiswa = Mahasiswa::count();
        $totalCertificates = Ijazah::count();
        $totalIssued = Ijazah::where('status', 'issued')->count();
        $totalDraft = Ijazah::where('status', 'draft')->count();
        $totalRevoked = Ijazah::where('status', 'revoked')->count();
        $totalVerifications = VerificationLog::count();
        $totalUsers = User::count();
        $validVerifications = VerificationLog::where('is_valid', true)->count();

        $certificatesByMonth = Ijazah::select(
                DB::raw('MONTH(created_at) as month'),
                DB::raw('YEAR(created_at) as year'),
                DB::raw('count(*) as total')
            )
            ->groupBy('year', 'month')
            ->orderBy('year', 'desc')
            ->orderBy('month', 'desc')
            ->limit(12)
            ->get();

        $verificationsByDay = VerificationLog::select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('count(*) as total'),
                DB::raw('SUM(CASE WHEN is_valid = 1 THEN 1 ELSE 0 END) as valid')
            )
            ->whereDate('created_at', '>=', now()->subDays(30))
            ->groupBy('date')
            ->orderBy('date', 'desc')
            ->get();

        $recentActivities = DB::table('activity_logs')
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        $topProdi = Mahasiswa::select('prodi.nama', DB::raw('count(*) as total'))
            ->join('prodi', 'mahasiswa.prodi_id', '=', 'prodi.id')
            ->where('mahasiswa.status', 'lulus')
            ->groupBy('prodi.nama')
            ->orderBy('total', 'desc')
            ->limit(5)
            ->get();

        $mahasiswaByStatus = [
            'aktif' => Mahasiswa::where('status', 'aktif')->count(),
            'lulus' => $totalAlumni,
            'dropout' => Mahasiswa::where('status', 'dropout')->count(),
        ];

        return response()->json([
            'role' => $role,
            'total_alumni' => $totalAlumni,
            'total_mahasiswa' => $totalMahasiswa,
            'total_certificates' => $totalCertificates,
            'total_issued' => $totalIssued,
            'total_draft' => $totalDraft,
            'total_revoked' => $totalRevoked,
            'total_verifications' => $totalVerifications,
            'total_users' => $totalUsers,
            'valid_verifications' => $validVerifications,
            'invalid_verifications' => $totalVerifications - $validVerifications,
            'valid_percentage' => $totalVerifications > 0 ? round(($validVerifications / $totalVerifications) * 100, 2) : 0,
            'mahasiswa_by_status' => $mahasiswaByStatus,
            'certificates_by_month' => $certificatesByMonth,
            'verifications_by_day' => $verificationsByDay,
            'recent_activities' => $recentActivities,
            'top_prodi' => $topProdi,
            'today_verifications' => $role === 'verifikator'
                ? VerificationLog::whereDate('created_at', today())->count()
                : VerificationLog::whereDate('created_at', today())->count(),
        ]);
    }
}
