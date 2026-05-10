<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Mahasiswa;
use App\Models\Ijazah;
use App\Services\CertificateService;
use App\Services\BlockchainService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;

class CertificateController extends Controller
{
    protected $certificateService;
    protected $blockchainService;

    public function __construct(CertificateService $certificateService, BlockchainService $blockchainService)
    {
        $this->certificateService = $certificateService;
        $this->blockchainService = $blockchainService;
    }

    public function index(Request $request)
    {
        $ijazah = Ijazah::with('mahasiswa.prodi', 'issuer')
            ->orderBy('created_at', 'desc')
            ->paginate($request->per_page ?? 15);

        return response()->json($ijazah);
    }

    public function generate(Request $request)
    {
        $request->validate([
            'mahasiswa_id' => 'required|exists:mahasiswa,id',
            'ipk' => 'required|numeric|min:0|max:4',
            'tanggal_lulus' => 'required|date'
        ]);

        $mahasiswa = Mahasiswa::findOrFail($request->mahasiswa_id);
        
        if ($mahasiswa->ijazah) {
            return response()->json(['error' => 'Mahasiswa already has a certificate'], 422);
        }

        DB::beginTransaction();

        try {
            $hash = $this->certificateService->generateHash($mahasiswa, [
                'ipk' => $request->ipk,
                'tanggal_lulus' => $request->tanggal_lulus
            ]);

            $nomorIjazah = $this->certificateService->generateDiplomaNumber($mahasiswa);
            $qrCodePath = $this->certificateService->generateQRCode($hash, $nomorIjazah);

            $ijazah = Ijazah::create([
                'mahasiswa_id' => $mahasiswa->id,
                'nomor_ijazah' => $nomorIjazah,
                'hash_sha256' => $hash,
                'qr_code_path' => $qrCodePath,
                'status' => 'draft',
                'issued_by' => $request->user()->id,
                'notes' => $request->notes
            ]);

            $mahasiswa->update([
                'ipk' => $request->ipk,
                'tahun_lulus' => date('Y', strtotime($request->tanggal_lulus)),
                'status' => 'lulus'
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'certificate' => $ijazah->load('mahasiswa.prodi'),
                'message' => 'Certificate generated successfully'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function publishToBlockchain($id, Request $request)
    {
        $ijazah = Ijazah::findOrFail($id);
        
        if ($ijazah->status !== 'draft') {
            return response()->json(['error' => 'Certificate already published'], 422);
        }

        $result = $this->blockchainService->issueCertificate($ijazah);
        
        if ($result['success']) {
            $pdfPath = $this->certificateService->generatePDFCertificate($ijazah);
            $ijazah->update(['file_path' => $pdfPath]);
            
            return response()->json([
                'success' => true,
                'certificate' => $ijazah,
                'blockchain' => $result
            ]);
        }
        
        return response()->json(['error' => $result['error']], 500);
    }

    public function download($id)
    {
        $ijazah = Ijazah::findOrFail($id);

        if (!$ijazah->file_path || !Storage::disk('public')->exists($ijazah->file_path)) {
            if ($ijazah->status === 'issued') {
                $pdfPath = $this->certificateService->generatePDFCertificate($ijazah);
                $ijazah->update(['file_path' => $pdfPath]);
            } else {
                return response()->json(['error' => 'File not found. Publish certificate first.'], 404);
            }
        }
        
        return Storage::disk('public')->download($ijazah->file_path, "Ijazah_{$ijazah->mahasiswa->nim}.pdf");
    }

    public function getByMahasiswa($mahasiswaId)
    {
        $ijazah = Ijazah::where('mahasiswa_id', $mahasiswaId)
            ->with('issuer')
            ->first();
            
        if (!$ijazah) {
            return response()->json(['error' => 'Certificate not found'], 404);
        }
        
        return response()->json($ijazah);
    }

    public function update(Request $request, $id)
    {
        $ijazah = Ijazah::findOrFail($id);

        $request->validate([
            'nomor_ijazah' => 'sometimes|string|max:50|unique:ijazah,nomor_ijazah,' . $id,
            'notes' => 'nullable|string',
            'issued_at' => 'nullable|date',
        ]);

        if ($request->filled('nomor_ijazah')) {
            $ijazah->update(['nomor_ijazah' => $request->nomor_ijazah]);
        }

        if ($request->has('notes')) {
            $ijazah->update(['notes' => $request->notes]);
        }

        if ($request->filled('issued_at')) {
            $ijazah->update(['issued_at' => $request->issued_at]);
        }

        return response()->json([
            'success' => true,
            'certificate' => $ijazah->fresh()->load('mahasiswa.prodi', 'issuer'),
            'message' => 'Certificate updated successfully'
        ]);
    }

    public function revoke($id, Request $request)
    {
        $ijazah = Ijazah::findOrFail($id);
        
        if ($ijazah->status === 'revoked') {
            return response()->json(['error' => 'Certificate already revoked'], 422);
        }
        
        $ijazah->update([
            'status' => 'revoked',
            'notes' => $request->notes ?? 'Revoked by ' . $request->user()->name
        ]);
        
        return response()->json([
            'success' => true,
            'message' => 'Certificate revoked successfully'
        ]);
    }
}