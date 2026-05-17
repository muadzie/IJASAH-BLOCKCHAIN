<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Ijazah;
use App\Models\Mahasiswa;
use App\Models\Prodi;
use App\Models\Fakultas;
use App\Services\BlockchainService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class IjazahController extends Controller
{
    protected BlockchainService $blockchainService;

    public function __construct(BlockchainService $blockchainService)
    {
        $this->blockchainService = $blockchainService;
    }

    public function index(Request $request)
    {
        $query = Ijazah::with('mahasiswa')
            ->orderBy('created_at', 'desc');

        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('nomor_ijazah', 'like', "%{$request->search}%")
                  ->orWhere('hash_sha256', 'like', "%{$request->search}%")
                  ->orWhereHas('mahasiswa', function ($mq) use ($request) {
                      $mq->where('nama_lengkap', 'like', "%{$request->search}%")
                         ->orWhere('nim', 'like', "%{$request->search}%");
                  });
            });
        }

        if ($request->status) {
            $query->where('status', $request->status);
        }

        if ($request->has('blockchain_verified')) {
            $filter = filter_var($request->blockchain_verified, FILTER_VALIDATE_BOOLEAN);
            $filter ? $query->whereNotNull('blockchain_tx_hash') : $query->whereNull('blockchain_tx_hash');
        }

        $ijazah = $query->paginate($request->per_page ?? 15);

        $ijazah->getCollection()->transform(function ($item) {
            $item->blockchain_explorer_url = $item->blockchain_tx_hash
                ? "https://sepolia.etherscan.io/tx/{$item->blockchain_tx_hash}"
                : null;
            return $item;
        });

        return response()->json($ijazah);
    }

    public function upload(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'nim' => 'required|string|max:20',
            'nama' => 'required|string|max:255',
            'nomor_ijazah' => 'required|string|max:50|unique:ijazah,nomor_ijazah',
            'tahun_lulus' => 'required|integer|min:1950|max:2099',
            'prodi' => 'required|string|max:255',
            'ipk' => 'nullable|numeric|min:0|max:4',
            'file' => 'required|file|mimes:pdf|max:10240',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $file = $request->file('file');
        $fileHash = hash_file('sha256', $file->path());

        $existing = Ijazah::where('hash_sha256', $fileHash)->first();
        if ($existing) {
            return response()->json([
                'error' => 'File ijazah ini sudah pernah diupload sebelumnya',
                'existing' => $existing->load('mahasiswa'),
            ], 409);
        }

        $mahasiswa = Mahasiswa::firstOrCreate(
            ['nim' => $request->nim],
            [
                'nama_lengkap' => $request->nama,
                'prodi_id' => $this->getOrCreateProdi($request->prodi),
                'email' => $request->nim . '@mahasiswa.unsub.ac.id',
                'tahun_masuk' => (string) ((int) $request->tahun_lulus - 4),
                'tahun_lulus' => $request->tahun_lulus,
                'ipk' => $request->ipk,
                'status' => 'lulus',
            ]
        );

        if ($request->filled('ipk')) {
            $mahasiswa->update(['ipk' => $request->ipk]);
        }

        $filePath = $file->store("ijazah/{$request->nim}", 'public');

        $ijazah = Ijazah::create([
            'mahasiswa_id' => $mahasiswa->id,
            'nomor_ijazah' => $request->nomor_ijazah,
            'hash_sha256' => $fileHash,
            'file_path' => $filePath,
            'status' => 'draft',
        ]);

        $blockchainResult = $this->blockchainService->storeCertificate(
            $fileHash,
            $request->nim,
            $request->nama,
            $request->nomor_ijazah,
            (int) $request->tahun_lulus
        );

        if ($blockchainResult['success']) {
            $ijazah->update([
                'blockchain_tx_hash' => $blockchainResult['tx_hash'],
                'blockchain_block' => $blockchainResult['block_number'] ?? null,
                'blockchain_timestamp' => now(),
                'status' => 'issued',
                'issued_at' => now(),
                'issued_by' => $request->user()?->id,
                'pdf_hash' => $fileHash,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Ijazah berhasil diupload dan disimpan ke Sepolia Testnet',
                'ijazah' => $ijazah->fresh(),
                'blockchain' => $blockchainResult,
                'file_hash' => $fileHash,
            ], 201);
        }

        return response()->json([
            'success' => false,
            'message' => 'Ijazah diupload tapi gagal simpan ke blockchain',
            'ijazah' => $ijazah->fresh(),
            'blockchain_error' => $blockchainResult['error'] ?? 'Unknown error',
            'file_hash' => $fileHash,
        ], 500);
    }

    public function show($id)
    {
        $ijazah = Ijazah::with('mahasiswa')->findOrFail($id);

        $data = $ijazah->toArray();
        $data['blockchain_explorer_url'] = $ijazah->blockchain_tx_hash
            ? "https://sepolia.etherscan.io/tx/{$ijazah->blockchain_tx_hash}"
            : null;

        if ($ijazah->blockchain_tx_hash) {
            $data['blockchain_status'] = $this->blockchainService->getTransactionStatus($ijazah->blockchain_tx_hash);
        }

        return response()->json($data);
    }

    public function revoke($id, Request $request)
    {
        $ijazah = Ijazah::findOrFail($id);

        if ($ijazah->status === 'revoked') {
            return response()->json(['error' => 'Ijazah sudah dicabut'], 422);
        }

        if (!$ijazah->blockchain_tx_hash) {
            $ijazah->update([
                'status' => 'revoked',
                'notes' => $request->notes ?? 'Dicabut oleh admin',
            ]);
            return response()->json([
                'success' => true,
                'message' => 'Ijazah berhasil dicabut (local only)',
            ]);
        }

        $blockchainResult = $this->blockchainService->revokeCertificate($ijazah->hash_sha256);

        $ijazah->update([
            'status' => 'revoked',
            'notes' => $request->notes ?? 'Dicabut oleh admin',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Ijazah berhasil dicabut di Sepolia Testnet',
            'blockchain' => $blockchainResult,
        ]);
    }

    public function download($id)
    {
        $ijazah = Ijazah::findOrFail($id);

        if (!$ijazah->file_path || !Storage::disk('public')->exists($ijazah->file_path)) {
            return response()->json(['error' => 'File tidak ditemukan'], 404);
        }

        return Storage::disk('public')->download($ijazah->file_path, "Ijazah_{$ijazah->nomor_ijazah}.pdf");
    }

    public function blockchainStats()
    {
        $networkInfo = $this->blockchainService->getNetworkInfo();
        $balance = $this->blockchainService->getBalance();
        $totalOnChain = $this->blockchainService->getTotalOnChain();

        $lastBlock = Ijazah::whereNotNull('blockchain_block')
            ->orderBy('created_at', 'desc')
            ->first();

        return response()->json([
            'network' => $networkInfo,
            'wallet' => $balance,
            'stats' => [
                'total_uploaded' => Ijazah::count(),
                'total_issued' => Ijazah::where('status', 'issued')->count(),
                'total_revoked' => Ijazah::where('status', 'revoked')->count(),
                'total_on_chain' => $totalOnChain,
                'total_verifications' => \App\Models\VerificationLog::count(),
                'last_blockchain_tx' => $lastBlock?->blockchain_tx_hash,
                'last_block_number' => $lastBlock?->blockchain_block,
            ],
        ]);
    }

    public function balance()
    {
        return response()->json($this->blockchainService->getBalance());
    }

    private function getOrCreateProdi(string $namaProdi): string
    {
        $prodi = Prodi::where('nama', $namaProdi)->first();
        if ($prodi) {
            return $prodi->id;
        }

        $fakultas = Fakultas::first();
        if (!$fakultas) {
            $fakultas = Fakultas::create([
                'kode' => 'UNK',
                'nama' => 'Fakultas Lainnya',
            ]);
        }

        $prodi = Prodi::create([
            'fakultas_id' => $fakultas->id,
            'kode' => strtoupper(substr(preg_replace('/[^a-zA-Z0-9]/', '', $namaProdi), 0, 5)),
            'nama' => $namaProdi,
            'jenjang' => 'S1',
        ]);

        return $prodi->id;
    }
}
