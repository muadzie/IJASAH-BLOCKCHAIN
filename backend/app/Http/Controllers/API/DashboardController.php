<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Mahasiswa;
use App\Models\Ijazah;
use App\Models\VerificationLog;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function getStats()
    {
        $totalAlumni = Mahasiswa::where('status', 'lulus')->count();
        $totalCertificates = Ijazah::where('status', 'issued')->count();
        $totalVerifications = VerificationLog::count();
        $totalUsers = User::count();
        $validVerifications = VerificationLog::where('is_valid', true)->count();
        
        $certificatesByMonth = Ijazah::select(
                DB::raw('MONTH(issued_at) as month'),
                DB::raw('YEAR(issued_at) as year'),
                DB::raw('count(*) as total')
            )
            ->where('status', 'issued')
            ->whereNotNull('issued_at')
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
        
        return response()->json([
            'total_alumni' => $totalAlumni,
            'total_certificates' => $totalCertificates,
            'total_verifications' => $totalVerifications,
            'total_users' => $totalUsers,
            'valid_verifications' => $validVerifications,
            'invalid_verifications' => $totalVerifications - $validVerifications,
            'valid_percentage' => $totalVerifications > 0 ? round(($validVerifications / $totalVerifications) * 100, 2) : 0,
            'certificates_by_month' => $certificatesByMonth,
            'verifications_by_day' => $verificationsByDay,
            'recent_activities' => $recentActivities,
            'top_prodi' => $topProdi
        ]);
    }
}