<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\VerificationLog;
use Illuminate\Http\Request;

class VerificationLogController extends Controller
{
    public function index(Request $request)
    {
        $query = VerificationLog::with('ijazah.mahasiswa')
            ->orderBy('created_at', 'desc');

        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        if ($request->filled('method')) {
            $query->where('verification_method', $request->method);
        }

        if ($request->has('valid')) {
            $query->where('is_valid', filter_var($request->valid, FILTER_VALIDATE_BOOLEAN));
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('certificate_hash', 'like', "%{$search}%")
                  ->orWhereHas('ijazah.mahasiswa', function ($mq) use ($search) {
                      $mq->where('nama_lengkap', 'like', "%{$search}%")
                         ->orWhere('nim', 'like', "%{$search}%");
                  });
            });
        }

        return response()->json(
            $query->paginate($request->per_page ?? 15)
        );
    }

    public function todayStats()
    {
        $today = now()->today();

        return response()->json([
            'total' => VerificationLog::whereDate('created_at', $today)->count(),
            'valid' => VerificationLog::whereDate('created_at', $today)->where('is_valid', true)->count(),
            'invalid' => VerificationLog::whereDate('created_at', $today)->where('is_valid', false)->count(),
            'by_method' => [
                'hash' => VerificationLog::whereDate('created_at', $today)->where('verification_method', 'hash')->count(),
                'file_upload' => VerificationLog::whereDate('created_at', $today)->where('verification_method', 'file_upload')->count(),
                'qr_code' => VerificationLog::whereDate('created_at', $today)->where('verification_method', 'qr_code')->count(),
            ],
        ]);
    }
}
