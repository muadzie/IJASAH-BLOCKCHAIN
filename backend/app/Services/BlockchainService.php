<?php

namespace App\Services;

use App\Models\Ijazah;
use App\Models\BlockchainTransaction;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Http;

class BlockchainService
{
    protected $rpcUrl;
    protected $contractAddress;
    protected $privateKey;
    protected $chainId;

    public function __construct()
    {
        $this->rpcUrl = env('BLOCKCHAIN_RPC_URL');
        $this->contractAddress = env('BLOCKCHAIN_CONTRACT_ADDRESS');
        $this->privateKey = env('BLOCKCHAIN_PRIVATE_KEY');
        $this->chainId = env('BLOCKCHAIN_CHAIN_ID', 11155111);
    }

    public function issueCertificate(Ijazah $ijazah): array
    {
        try {
            $mahasiswa = $ijazah->mahasiswa;
            
            // Simulasi transaksi blockchain (untuk development)
            // Di production, gunakan ethers.js atau web3.php
            $mockTxHash = '0x' . bin2hex(random_bytes(32));
            
            BlockchainTransaction::create([
                'ijazah_id' => $ijazah->id,
                'tx_hash' => $mockTxHash,
                'type' => 'issue',
                'payload' => [
                    'student_name' => $mahasiswa->nama_lengkap,
                    'student_nim' => $mahasiswa->nim,
                    'hash' => $ijazah->hash_sha256,
                    'diploma_number' => $ijazah->nomor_ijazah
                ],
                'status' => 'confirmed',
                'from_address' => '0x_mock_address',
                'to_address' => $this->contractAddress,
                'block_number' => rand(1000000, 9999999)
            ]);
            
            $ijazah->update([
                'blockchain_tx_hash' => $mockTxHash,
                'blockchain_block' => rand(1000000, 9999999),
                'blockchain_timestamp' => now(),
                'status' => 'issued',
                'issued_at' => now()
            ]);
            
            return [
                'success' => true,
                'tx_hash' => $mockTxHash,
                'message' => 'Certificate issued to blockchain successfully'
            ];
            
        } catch (\Exception $e) {
            Log::error('Blockchain issuance failed: ' . $e->getMessage());
            
            BlockchainTransaction::create([
                'ijazah_id' => $ijazah->id,
                'type' => 'issue',
                'payload' => ['error' => $e->getMessage()],
                'status' => 'failed'
            ]);
            
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }

    public function verifyCertificate(string $hash): array
    {
        // Simulasi verifikasi blockchain
        $ijazah = Ijazah::where('hash_sha256', $hash)->first();
        
        if ($ijazah && $ijazah->blockchain_tx_hash) {
            return [
                'isValid' => true,
                'studentName' => $ijazah->mahasiswa->nama_lengkap,
                'studentNim' => $ijazah->mahasiswa->nim,
                'diplomaNumber' => $ijazah->nomor_ijazah,
                'issuedAt' => $ijazah->issued_at?->timestamp,
                'issuedBy' => $ijazah->issuer?->email ?? '0x_unsub_address',
                'isRevoked' => $ijazah->status === 'revoked'
            ];
        }
        
        return ['isValid' => false];
    }

    public function getTransactionStatus(string $txHash): array
    {
        $transaction = BlockchainTransaction::where('tx_hash', $txHash)->first();
        
        if ($transaction) {
            return [
                'hash' => $txHash,
                'confirmed' => $transaction->status === 'confirmed',
                'block_number' => $transaction->block_number,
                'status' => $transaction->status
            ];
        }
        
        return ['hash' => $txHash, 'confirmed' => false];
    }
}