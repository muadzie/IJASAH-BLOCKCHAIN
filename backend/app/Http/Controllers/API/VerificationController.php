<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Ijazah;
use App\Models\VerificationLog;
use App\Services\BlockchainService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class VerificationController extends Controller
{
    protected BlockchainService $blockchainService;

    public function __construct(BlockchainService $blockchainService)
    {
        $this->blockchainService = $blockchainService;
    }

    public function verifyByHash(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'hash' => 'required|string|size:64',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $hash = $request->hash;

        $blockchainResult = $this->blockchainService->verifyCertificate($hash);

        $ijazah = Ijazah::where('hash_sha256', $hash)->with('mahasiswa')->first();

        $isValid = $blockchainResult['isValid'] ?? false;
        $isRevoked = $blockchainResult['isRevoked'] ?? ($ijazah?->status === 'revoked');

        $result = [
            'valid' => $isValid && !$isRevoked,
            'blockchain_verified' => $isValid,
            'local_found' => !is_null($ijazah),
            'revoked' => $isRevoked,
            'verification_method' => 'hash',
        ];

        if ($isValid && !$isRevoked) {
            $result['certificate_data'] = [
                'student_name' => $blockchainResult['nama'] ?? $ijazah?->mahasiswa?->nama_lengkap,
                'nim' => $blockchainResult['nim'] ?? $ijazah?->mahasiswa?->nim,
                'diploma_number' => $blockchainResult['nomorIjazah'] ?? $ijazah?->nomor_ijazah,
                'program_study' => $blockchainResult['prodi'] ?? $ijazah?->mahasiswa?->prodi?->nama ?? '-',
                'graduation_year' => $blockchainResult['tahunLulus'] ?? $ijazah?->mahasiswa?->tahun_lulus ?? '-',
                'ipk' => $ijazah?->mahasiswa?->ipk ? number_format($ijazah->mahasiswa->ipk, 2) : '-',
                'fakultas' => $ijazah?->mahasiswa?->prodi?->fakultas?->nama ?? '-',
            ];
        }

        if ($isRevoked) {
            $result['revoked_message'] = 'Ijazah ini telah dicabut/direvoke';
        }

        $result['blockchain_info'] = [
            'network' => 'Sepolia Testnet',
            'explorer_url' => $ijazah?->blockchain_tx_hash
                ? "https://sepolia.etherscan.io/tx/{$ijazah->blockchain_tx_hash}"
                : null,
            'tx_hash' => $ijazah?->blockchain_tx_hash,
            'block_number' => $ijazah?->blockchain_block,
        ];

        VerificationLog::create([
            'ijazah_id' => $ijazah?->id,
            'certificate_hash' => $hash,
            'verification_method' => 'hash',
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'verification_result' => $result,
            'is_valid' => $isValid && !$isRevoked,
        ]);

        return response()->json($result);
    }

    public function verifyByFile(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'certificate' => 'required|file|mimes:pdf|max:10240',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $file = $request->file('certificate');
        $pdfHash = hash_file('sha256', $file->path());

        $blockchainResult = $this->blockchainService->verifyCertificate($pdfHash);

        $ijazah = Ijazah::where('hash_sha256', $pdfHash)->with('mahasiswa')->first();

        $isValid = $blockchainResult['isValid'] ?? false;
        $isRevoked = $blockchainResult['isRevoked'] ?? ($ijazah?->status === 'revoked');

        $result = [
            'valid' => $isValid && !$isRevoked,
            'hash' => $pdfHash,
            'file_name' => $file->getClientOriginalName(),
            'file_size' => $file->getSize(),
            'blockchain_verified' => $isValid,
            'revoked' => $isRevoked,
            'verification_method' => 'file_upload',
        ];

        if ($isValid && !$isRevoked) {
            $result['certificate_data'] = [
                'student_name' => $blockchainResult['nama'] ?? $ijazah?->mahasiswa?->nama_lengkap ?? '-',
                'nim' => $blockchainResult['nim'] ?? $ijazah?->mahasiswa?->nim ?? '-',
                'diploma_number' => $blockchainResult['nomorIjazah'] ?? $ijazah?->nomor_ijazah ?? '-',
                'program_study' => $blockchainResult['prodi'] ?? $ijazah?->mahasiswa?->prodi?->nama ?? '-',
                'graduation_year' => $blockchainResult['tahunLulus'] ?? $ijazah?->mahasiswa?->tahun_lulus ?? '-',
                'ipk' => $ijazah?->mahasiswa?->ipk ? number_format($ijazah->mahasiswa->ipk, 2) : '-',
                'fakultas' => $ijazah?->mahasiswa?->prodi?->fakultas?->nama ?? '-',
            ];
        }

        $result['blockchain_info'] = [
            'network' => 'Sepolia Testnet',
            'explorer_url' => $ijazah?->blockchain_tx_hash
                ? "https://sepolia.etherscan.io/tx/{$ijazah->blockchain_tx_hash}"
                : null,
            'tx_hash' => $ijazah?->blockchain_tx_hash,
            'block_number' => $ijazah?->blockchain_block,
        ];

        VerificationLog::create([
            'ijazah_id' => $ijazah?->id,
            'certificate_hash' => $pdfHash,
            'verification_method' => 'file_upload',
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'verification_result' => $result,
            'is_valid' => $isValid && !$isRevoked,
        ]);

        return response()->json($result);
    }

    public function verifyByHashUrl($hash)
    {
        $validator = Validator::make(['hash' => $hash], [
            'hash' => 'required|string|size:64',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => 'Hash tidak valid, harus 64 karakter hex'], 400);
        }

        $request = request();
        $blockchainResult = $this->blockchainService->verifyCertificate($hash);

        $ijazah = Ijazah::where('hash_sha256', $hash)->with('mahasiswa')->first();

        $isValid = $blockchainResult['isValid'] ?? false;
        $isRevoked = $blockchainResult['isRevoked'] ?? ($ijazah?->status === 'revoked');

        $result = [
            'valid' => $isValid && !$isRevoked,
            'blockchain_verified' => $isValid,
            'local_found' => !is_null($ijazah),
            'revoked' => $isRevoked,
            'verification_method' => 'qr_code',
        ];

        if ($isValid && !$isRevoked) {
            $result['certificate_data'] = [
                'student_name' => $blockchainResult['nama'] ?? $ijazah?->mahasiswa?->nama_lengkap,
                'nim' => $blockchainResult['nim'] ?? $ijazah?->mahasiswa?->nim,
                'diploma_number' => $blockchainResult['nomorIjazah'] ?? $ijazah?->nomor_ijazah,
                'program_study' => $ijazah?->mahasiswa?->prodi?->nama ?? '-',
                'graduation_year' => $blockchainResult['tahunLulus'] ?? $ijazah?->mahasiswa?->tahun_lulus ?? '-',
                'fakultas' => $ijazah?->mahasiswa?->prodi?->fakultas?->nama ?? '-',
            ];
        }

        $result['blockchain_info'] = [
            'network' => 'Sepolia Testnet',
            'explorer_url' => $ijazah?->blockchain_tx_hash
                ? "https://sepolia.etherscan.io/tx/{$ijazah->blockchain_tx_hash}"
                : null,
            'tx_hash' => $ijazah?->blockchain_tx_hash,
        ];

        VerificationLog::create([
            'ijazah_id' => $ijazah?->id,
            'certificate_hash' => $hash,
            'verification_method' => 'qr_code',
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'verification_result' => $result,
            'is_valid' => $isValid && !$isRevoked,
        ]);

        return response()->json($result);
    }

    public function getVerificationStats()
    {
        $totalVerifications = VerificationLog::count();
        $validVerifications = VerificationLog::where('is_valid', true)->count();
        $todayVerifications = VerificationLog::whereDate('created_at', today())->count();
        $totalCertificates = Ijazah::where('status', 'issued')->count();
        $totalOnChain = $this->blockchainService->getTotalOnChain();

        return response()->json([
            'total_alumni' => Ijazah::count(),
            'total_certificates' => $totalCertificates,
            'total_on_chain' => $totalOnChain,
            'total_verifications' => $totalVerifications,
            'valid_verifications' => $validVerifications,
            'invalid_verifications' => $totalVerifications - $validVerifications,
            'today_verifications' => $todayVerifications,
            'valid_percentage' => $totalVerifications > 0
                ? round(($validVerifications / $totalVerifications) * 100, 2)
                : 0,
            'network' => 'Sepolia Testnet',
            'chain_id' => 11155111,
        ]);
    }

    public function redirectToEtherscan($txHash)
    {
        return redirect("https://sepolia.etherscan.io/tx/{$txHash}");
    }
}
