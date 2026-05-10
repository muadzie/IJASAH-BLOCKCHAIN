<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Ijazah;
use App\Models\Mahasiswa;
use App\Models\VerificationLog;
use App\Services\BlockchainService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class VerificationController extends Controller
{
    protected $blockchainService;

    public function __construct(BlockchainService $blockchainService)
    {
        $this->blockchainService = $blockchainService;
    }

    public function verifyByHash(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'hash' => 'required|string|size:64'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $hash = $request->hash;
        
        $ijazah = Ijazah::where('hash_sha256', $hash)->with('mahasiswa.prodi.fakultas')->first();
        
        $blockchainResult = $this->blockchainService->verifyCertificate($hash);
        
        $result = [
            'valid' => $blockchainResult['isValid'],
            'blockchain_verified' => $blockchainResult['isValid'],
            'local_found' => !is_null($ijazah),
            'details' => $blockchainResult
        ];
        
        if ($blockchainResult['isValid'] && $ijazah) {
            $result['certificate_data'] = [
                'student_name' => $ijazah->mahasiswa->nama_lengkap,
                'nim' => $ijazah->mahasiswa->nim,
                'diploma_number' => $ijazah->nomor_ijazah,
                'program_study' => $ijazah->mahasiswa->prodi->nama,
                'graduation_date' => $ijazah->issued_at?->format('d F Y'),
                'ipk' => $ijazah->mahasiswa->ipk,
                'fakultas' => $ijazah->mahasiswa->prodi->fakultas->nama
            ];
        }
        
        VerificationLog::create([
            'ijazah_id' => $ijazah?->id,
            'certificate_hash' => $hash,
            'verification_method' => 'hash',
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'verification_result' => $result,
            'is_valid' => $blockchainResult['isValid']
        ]);
        
        return response()->json($result);
    }

    public function verifyByFile(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'certificate' => 'required|file|mimes:pdf|max:5120'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $file = $request->file('certificate');
        $pdfHash = hash_file('sha256', $file->path());
        
        $ijazah = Ijazah::where('pdf_hash', $pdfHash)->with('mahasiswa.prodi.fakultas')->first();
        
        $blockchainResult = $ijazah
            ? $this->blockchainService->verifyCertificate($ijazah->hash_sha256)
            : ['isValid' => false];
        
        $result = [
            'valid' => $blockchainResult['isValid'],
            'hash' => $ijazah?->hash_sha256,
            'file_name' => $file->getClientOriginalName(),
            'file_size' => $file->getSize()
        ];
        
        if ($blockchainResult['isValid'] && $ijazah) {
            $result['certificate_data'] = [
                'student_name' => $ijazah->mahasiswa->nama_lengkap,
                'nim' => $ijazah->mahasiswa->nim,
                'diploma_number' => $ijazah->nomor_ijazah,
                'program_study' => $ijazah->mahasiswa->prodi->nama,
                'graduation_date' => $ijazah->issued_at?->format('d F Y'),
                'ipk' => $ijazah->mahasiswa->ipk
            ];
        }
        
        VerificationLog::create([
            'ijazah_id' => $ijazah?->id,
            'certificate_hash' => $pdfHash,
            'verification_method' => 'file_upload',
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'verification_result' => $result,
            'is_valid' => $blockchainResult['isValid']
        ]);
        
        return response()->json($result);
    }

    public function getVerificationStats()
    {
        $totalVerifications = VerificationLog::count();
        $validVerifications = VerificationLog::where('is_valid', true)->count();
        $todayVerifications = VerificationLog::whereDate('created_at', today())->count();
        $totalAlumni = Mahasiswa::where('status', 'lulus')->count();
        $totalCertificates = Ijazah::where('status', 'issued')->count();
        
        return response()->json([
            'total_alumni' => $totalAlumni,
            'total_certificates' => $totalCertificates,
            'total_verifications' => $totalVerifications,
            'valid_verifications' => $validVerifications,
            'invalid_verifications' => $totalVerifications - $validVerifications,
            'today_verifications' => $todayVerifications,
            'valid_percentage' => $totalVerifications > 0 ? round(($validVerifications / $totalVerifications) * 100, 2) : 0
        ]);
    }
}