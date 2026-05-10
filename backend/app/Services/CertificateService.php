<?php

namespace App\Services;

use App\Models\Mahasiswa;
use App\Models\Ijazah;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Barryvdh\DomPDF\Facade\Pdf;
use Endroid\QrCode\QrCode;
use Endroid\QrCode\Writer\SvgWriter;

class CertificateService
{
    public function generateHash(Mahasiswa $mahasiswa, array $data): string
    {
        $content = json_encode([
            'nim' => $mahasiswa->nim,
            'nama' => $mahasiswa->nama_lengkap,
            'prodi' => $mahasiswa->prodi->nama,
            'ipk' => $data['ipk'],
            'nomor_ijazah' => $this->generateDiplomaNumber($mahasiswa),
            'tanggal_lulus' => $data['tanggal_lulus'],
            'timestamp' => now()->timestamp
        ]);
        
        return hash('sha256', $content);
    }

    public function generateDiplomaNumber(Mahasiswa $mahasiswa): string
    {
        $year = date('Y');
        $random = strtoupper(Str::random(6));
        return "UNSUB/{$mahasiswa->prodi->kode}/{$year}/{$random}";
    }

    public function generateQRCode(string $hash, string $nomorIjazah): string
    {
        $verificationUrl = env('APP_FRONTEND_URL') . "/verify/{$hash}";
        
        $qrCode = new QrCode($verificationUrl);
        $writer = new SvgWriter();
        $result = $writer->write($qrCode);
        
        $filename = "qr_codes/{$nomorIjazah}.svg";
        Storage::disk('public')->put($filename, $result->getString());
        
        return $filename;
    }

    public function generatePDFCertificate(Ijazah $ijazah): string
    {
        $mahasiswa = $ijazah->mahasiswa;

        if (!$ijazah->qr_code_path || !Storage::disk('public')->exists($ijazah->qr_code_path)) {
            $qrPath = $this->generateQRCode($ijazah->hash_sha256, $ijazah->nomor_ijazah);
            $ijazah->update(['qr_code_path' => $qrPath]);
        }

        $qrCodePath = storage_path('app/public/' . $ijazah->qr_code_path);
        $qrCodeBase64 = 'data:image/svg+xml;base64,' . base64_encode(file_get_contents($qrCodePath));
        
        $data = [
            'ijazah' => $ijazah,
            'mahasiswa' => $mahasiswa,
            'prodi' => $mahasiswa->prodi,
            'fakultas' => $mahasiswa->prodi->fakultas,
            'qrCode' => $qrCodeBase64,
            'verificationUrl' => env('APP_FRONTEND_URL') . "/verify/{$ijazah->hash_sha256}",
            'blockchainUrl' => "https://sepolia.etherscan.io/tx/{$ijazah->blockchain_tx_hash}"
        ];
        
        $pdf = Pdf::loadView('certificates.ijazah', $data);
        $pdf->setPaper('a4', 'portrait');
        
        $filename = "ijazah/{$ijazah->nomor_ijazah}.pdf";
        $pdfContent = $pdf->output();
        Storage::disk('public')->put($filename, $pdfContent);
        
        $pdfHash = hash('sha256', $pdfContent);
        $ijazah->update(['pdf_hash' => $pdfHash]);
        
        return $filename;
    }

    public function validateCertificateIntegrity(Ijazah $ijazah, $fileUpload): bool
    {
        $uploadedHash = hash_file('sha256', $fileUpload->path());
        return $uploadedHash === $ijazah->hash_sha256;
    }
}