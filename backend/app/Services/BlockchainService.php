<?php

namespace App\Services;

use App\Models\Ijazah;
use App\Models\BlockchainTransaction;
use Illuminate\Support\Facades\Log;
use Web3\Web3;
use Web3\Contract;
use Web3\Providers\HttpProvider;
use Web3\RequestManagers\HttpRequestManager;

class BlockchainService
{
    protected string $rpcUrl;
    protected string $contractAddress;
    protected string $privateKey;
    protected int $chainId;
    protected string $adminAddress;
    protected bool $mockMode;
    protected ?Web3 $web3 = null;
    protected ?Contract $contract = null;

    protected array $contractAbi;
    protected string $nodeScriptPath;

    public function __construct()
    {
        $this->rpcUrl = env('BLOCKCHAIN_RPC_URL', 'https://rpc.sepolia.org');
        $this->contractAddress = env('BLOCKCHAIN_CONTRACT_ADDRESS', '');
        $this->privateKey = env('BLOCKCHAIN_ADMIN_PRIVATE_KEY', '');
        $this->adminAddress = env('BLOCKCHAIN_ADMIN_ADDRESS', '');
        $this->chainId = (int) env('BLOCKCHAIN_CHAIN_ID', 11155111);
        $this->mockMode = env('BLOCKCHAIN_MOCK_MODE', 'true') === 'true';

        $this->contractAbi = json_decode('[
            {
                "inputs": [{"internalType":"bytes32","name":"_hash","type":"bytes32"},{"internalType":"string","name":"_nim","type":"string"},{"internalType":"string","name":"_nama","type":"string"},{"internalType":"string","name":"_nomorIjazah","type":"string"},{"internalType":"uint256","name":"_tahunLulus","type":"uint256"}],
                "name":"storeCertificate",
                "outputs":[],
                "stateMutability":"nonpayable",
                "type":"function"
            },
            {
                "inputs": [{"internalType":"bytes32","name":"_hash","type":"bytes32"}],
                "name":"verifyCertificate",
                "outputs":[
                    {"internalType":"bool","name":"isValid","type":"bool"},
                    {"internalType":"string","name":"nim","type":"string"},
                    {"internalType":"string","name":"nama","type":"string"},
                    {"internalType":"string","name":"nomorIjazah","type":"string"},
                    {"internalType":"uint256","name":"tahunLulus","type":"uint256"},
                    {"internalType":"uint256","name":"timestamp","type":"uint256"},
                    {"internalType":"bool","name":"isRevoked","type":"bool"},
                    {"internalType":"address","name":"issuedBy","type":"address"}
                ],
                "stateMutability":"view",
                "type":"function"
            },
            {
                "inputs": [{"internalType":"bytes32","name":"_hash","type":"bytes32"}],
                "name":"revokeCertificate",
                "outputs":[],
                "stateMutability":"nonpayable",
                "type":"function"
            },
            {
                "inputs": [{"internalType":"bytes32","name":"_hash","type":"bytes32"}],
                "name":"isCertificateRevoked",
                "outputs":[{"internalType":"bool","name":"","type":"bool"}],
                "stateMutability":"view",
                "type":"function"
            },
            {
                "inputs": [],
                "name":"getTotalCertificates",
                "outputs":[{"internalType":"uint256","name":"","type":"uint256"}],
                "stateMutability":"view",
                "type":"function"
            },
            {
                "anonymous":false,"inputs":[{"indexed":true,"internalType":"bytes32","name":"hash","type":"bytes32"},{"indexed":false,"internalType":"string","name":"nim","type":"string"},{"indexed":false,"internalType":"string","name":"nama","type":"string"},{"indexed":false,"internalType":"uint256","name":"timestamp","type":"uint256"},{"indexed":true,"internalType":"address","name":"issuedBy","type":"address"}],
                "name":"CertificateStored","type":"event"
            },
            {
                "anonymous":false,"inputs":[{"indexed":true,"internalType":"bytes32","name":"hash","type":"bytes32"},{"indexed":true,"internalType":"address","name":"revokedBy","type":"address"},{"indexed":false,"internalType":"uint256","name":"timestamp","type":"uint256"}],
                "name":"CertificateRevoked","type":"event"
            }
        ]', true);

        $this->nodeScriptPath = base_path('scripts/sign-and-send.cjs');
    }

    private function initWeb3(): void
    {
        if ($this->web3 === null && !$this->mockMode && $this->rpcUrl) {
            try {
                $cafile = 'C:\laragon\etc\ssl\cacert.pem';
                if (file_exists($cafile)) {
                    putenv("CURL_CA_BUNDLE=$cafile");
                }

                $provider = new HttpProvider(new HttpRequestManager($this->rpcUrl, 30));
                $this->web3 = new Web3($provider);

                if ($this->contractAddress) {
                    $this->contract = (new Contract($provider, $this->contractAbi))
                        ->at($this->contractAddress);
                }
            } catch (\Exception $e) {
                Log::warning('Web3 init failed, falling back to mock: ' . $e->getMessage());
                $this->mockMode = true;
            }
        }
    }

    private function sendViaNodeScript(string $functionName, array $functionArgs): array
    {
        $payload = json_encode([
            'rpcUrl' => $this->rpcUrl,
            'privateKey' => $this->privateKey,
            'contractAddress' => $this->contractAddress,
            'abi' => $this->contractAbi,
            'functionName' => $functionName,
            'functionArgs' => $functionArgs,
            'chainId' => $this->chainId,
            'gasLimit' => 3000000,
        ]);

        $descriptorspec = [
            0 => ['pipe', 'r'],
            1 => ['pipe', 'w'],
            2 => ['pipe', 'w'],
        ];

        $proc = proc_open(
            sprintf('node "%s" %s', $this->nodeScriptPath, escapeshellarg($functionName)),
            $descriptorspec,
            $pipes
        );

        if (!is_resource($proc)) {
            return ['success' => false, 'error' => 'Failed to start Node.js process'];
        }

        fwrite($pipes[0], $payload);
        fclose($pipes[0]);

        $output = stream_get_contents($pipes[1]);
        $errorOutput = stream_get_contents($pipes[2]);
        fclose($pipes[1]);
        fclose($pipes[2]);

        $returnCode = proc_close($proc);

        if ($returnCode !== 0 && empty($output)) {
            Log::error('Node.js script error: ' . $errorOutput);
            return ['success' => false, 'error' => 'Node.js script failed: ' . ($errorOutput ?: 'Unknown error')];
        }

        $result = json_decode($output, true);
        if (!$result) {
            return ['success' => false, 'error' => 'Invalid response from Node.js script: ' . substr($output, 0, 200)];
        }

        return $result;
    }

    public function storeCertificate(string $hash, string $nim, string $nama, string $nomorIjazah, int $tahunLulus): array
    {
        if ($this->mockMode) {
            return $this->mockStoreCertificate($hash, $nim, $nama, $nomorIjazah, $tahunLulus);
        }

        try {
            $result = $this->sendViaNodeScript('storeCertificate', [
                '0x' . $hash,
                $nim,
                $nama,
                $nomorIjazah,
                $tahunLulus,
            ]);

            if ($result['success']) {
                return [
                    'success' => true,
                    'tx_hash' => $result['tx_hash'],
                    'block_number' => $result['block_number'] ?? null,
                    'message' => 'Sertifikat berhasil disimpan ke Sepolia Testnet',
                    'network' => 'Sepolia Testnet',
                    'explorer_url' => "https://sepolia.etherscan.io/tx/{$result['tx_hash']}",
                ];
            }

            Log::error('Sepolia storeCertificate failed: ' . ($result['error'] ?? 'Unknown'));
            return ['success' => false, 'error' => $result['error'] ?? 'Transaction failed'];
        } catch (\Exception $e) {
            Log::error('Sepolia storeCertificate exception: ' . $e->getMessage());
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }

    public function verifyCertificate(string $hash): array
    {
        if ($this->mockMode) {
            return $this->mockVerifyCertificate($hash);
        }

        $this->initWeb3();
        if (!$this->contract) {
            return $this->mockVerifyCertificate($hash);
        }

        try {
            $result = [];

            $this->contract->call(
                'verifyCertificate',
                '0x' . $hash,
                function ($err, $data) use (&$result) {
                    if ($err !== null) {
                        throw new \Exception($err->getMessage());
                    }
                    $result = [
                        'isValid' => $data[0],
                        'nim' => $data[1],
                        'nama' => $data[2],
                        'nomorIjazah' => $data[3],
                        'tahunLulus' => $data[4]->toString(),
                        'timestamp' => $data[5]->toString(),
                        'isRevoked' => $data[6],
                        'issuedBy' => $data[7],
                    ];
                }
            );

            if (empty($result)) {
                return ['isValid' => false];
            }

            $result['isRevoked'] = $this->isRevokedOnChain($hash);

            return $result;

        } catch (\Exception $e) {
            Log::error('Sepolia verifyCertificate failed: ' . $e->getMessage());
            return $this->mockVerifyCertificate($hash);
        }
    }

    public function revokeCertificate(string $hash): array
    {
        if ($this->mockMode) {
            return $this->mockRevokeCertificate($hash);
        }

        try {
            $result = $this->sendViaNodeScript('revokeCertificate', [
                '0x' . $hash,
            ]);

            if ($result['success']) {
                return [
                    'success' => true,
                    'tx_hash' => $result['tx_hash'],
                    'message' => 'Sertifikat berhasil dicabut di Sepolia',
                    'explorer_url' => "https://sepolia.etherscan.io/tx/{$result['tx_hash']}",
                ];
            }

            Log::error('Sepolia revoke failed: ' . ($result['error'] ?? 'Unknown'));
            return ['success' => false, 'error' => $result['error'] ?? 'Transaction failed'];
        } catch (\Exception $e) {
            Log::error('Sepolia revoke exception: ' . $e->getMessage());
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }

    public function isRevokedOnChain(string $hash): bool
    {
        if ($this->mockMode) {
            $ijazah = Ijazah::where('hash_sha256', $hash)->first();
            return $ijazah && $ijazah->status === 'revoked';
        }

        $this->initWeb3();
        if (!$this->contract) {
            return false;
        }

        try {
            $revoked = false;
            $this->contract->call(
                'isCertificateRevoked',
                '0x' . $hash,
                function ($err, $data) use (&$revoked) {
                    if ($err === null && isset($data[0])) {
                        $revoked = $data[0];
                    }
                }
            );
            return $revoked;
        } catch (\Exception $e) {
            return false;
        }
    }

    public function getTotalOnChain(): int
    {
        if ($this->mockMode) {
            return Ijazah::count();
        }

        $this->initWeb3();
        if (!$this->contract) {
            return 0;
        }

        try {
            $total = 0;
            $this->contract->call(
                'getTotalCertificates',
                function ($err, $data) use (&$total) {
                    if ($err === null && isset($data[0])) {
                        $total = (int) $data[0]->toString();
                    }
                }
            );
            return $total;
        } catch (\Exception $e) {
            return 0;
        }
    }

    public function getBalance(): array
    {
        if ($this->mockMode || !$this->adminAddress) {
            return ['balance' => '0', 'balance_eth' => '0'];
        }

        $this->initWeb3();
        if (!$this->web3) {
            return ['balance' => '0', 'balance_eth' => '0'];
        }

        try {
            $balance = '0';
            $this->web3->eth->getBalance($this->adminAddress, function ($err, $data) use (&$balance) {
                if ($err === null) {
                    $balance = $data->toString();
                }
            });

            $ethBalance = bcdiv($balance, '1000000000000000000', 6);

            return [
                'balance' => $balance,
                'balance_eth' => $ethBalance,
                'address' => $this->adminAddress,
                'explorer_url' => "https://sepolia.etherscan.io/address/{$this->adminAddress}",
            ];
        } catch (\Exception $e) {
            return ['balance' => '0', 'balance_eth' => '0'];
        }
    }

    public function getNetworkInfo(): array
    {
        return [
            'network' => 'Sepolia Testnet',
            'chain_id' => $this->chainId,
            'rpc_url' => $this->rpcUrl,
            'contract_address' => $this->contractAddress,
            'mock_mode' => $this->mockMode,
            'explorer_url' => 'https://sepolia.etherscan.io',
            'faucet_url' => 'https://sepoliafaucet.com',
        ];
    }

    public function getTransactionStatus(string $txHash): array
    {
        if ($this->mockMode) {
            $transaction = BlockchainTransaction::where('tx_hash', $txHash)->first();
            if ($transaction) {
                return [
                    'hash' => $txHash,
                    'confirmed' => $transaction->status === 'confirmed',
                    'block_number' => $transaction->block_number,
                    'status' => $transaction->status,
                    'explorer_url' => "https://sepolia.etherscan.io/tx/{$txHash}",
                ];
            }
            return ['hash' => $txHash, 'confirmed' => false, 'explorer_url' => "https://sepolia.etherscan.io/tx/{$txHash}"];
        }

        $this->initWeb3();
        if (!$this->web3) {
            return ['hash' => $txHash, 'confirmed' => false, 'explorer_url' => "https://sepolia.etherscan.io/tx/{$txHash}"];
        }

        try {
            $receipt = null;
            $this->web3->eth->getTransactionReceipt($txHash, function ($err, $data) use (&$receipt) {
                if ($err === null) {
                    $receipt = $data;
                }
            });

            if ($receipt) {
                return [
                    'hash' => $txHash,
                    'confirmed' => true,
                    'block_number' => $receipt->blockNumber->toString(),
                    'status' => $receipt->status ? 'confirmed' : 'failed',
                    'gas_used' => $receipt->gasUsed->toString(),
                    'explorer_url' => "https://sepolia.etherscan.io/tx/{$txHash}",
                ];
            }

            return ['hash' => $txHash, 'confirmed' => false, 'explorer_url' => "https://sepolia.etherscan.io/tx/{$txHash}"];
        } catch (\Exception $e) {
            return ['hash' => $txHash, 'confirmed' => false, 'explorer_url' => "https://sepolia.etherscan.io/tx/{$txHash}"];
        }
    }

    // ==================== MOCK METHODS ====================

    private function mockStoreCertificate(string $hash, string $nim, string $nama, string $nomorIjazah, int $tahunLulus): array
    {
        $txHash = '0x' . bin2hex(random_bytes(32));

        $ijazah = Ijazah::where('hash_sha256', $hash)->first();

        BlockchainTransaction::create([
            'ijazah_id' => $ijazah?->id,
            'tx_hash' => $txHash,
            'block_number' => rand(5000000, 9999999),
            'from_address' => $this->adminAddress ?: '0x_mock_admin',
            'to_address' => $this->contractAddress ?: '0x_mock_contract',
            'type' => 'issue',
            'payload' => [
                'student_name' => $nama,
                'student_nim' => $nim,
                'hash' => $hash,
                'nomor_ijazah' => $nomorIjazah,
                'tahun_lulus' => $tahunLulus,
            ],
            'status' => 'confirmed',
        ]);

        if ($ijazah) {
            $ijazah->update([
                'blockchain_tx_hash' => $txHash,
                'blockchain_block' => (string) rand(5000000, 9999999),
                'blockchain_timestamp' => now(),
                'status' => 'issued',
                'issued_at' => now(),
            ]);
        }

        return [
            'success' => true,
            'tx_hash' => $txHash,
            'message' => 'Sertifikat berhasil disimpan (mock)',
            'network' => 'Sepolia Testnet (Mock)',
            'explorer_url' => "https://sepolia.etherscan.io/tx/{$txHash}",
        ];
    }

    private function mockVerifyCertificate(string $hash): array
    {
        $ijazah = Ijazah::where('hash_sha256', $hash)->with('mahasiswa')->first();

        if ($ijazah) {
            return [
                'isValid' => $ijazah->status !== 'revoked',
                'nim' => $ijazah->mahasiswa->nim,
                'nama' => $ijazah->mahasiswa->nama_lengkap,
                'nomorIjazah' => $ijazah->nomor_ijazah,
                'tahunLulus' => $ijazah->mahasiswa->tahun_lulus ?? '2024',
                'timestamp' => $ijazah->issued_at?->timestamp ?? now()->timestamp,
                'isRevoked' => $ijazah->status === 'revoked',
                'issuedBy' => $this->adminAddress ?: '0x_mock_admin',
            ];
        }

        return ['isValid' => false];
    }

    private function mockRevokeCertificate(string $hash): array
    {
        $txHash = '0x' . bin2hex(random_bytes(32));

        $ijazah = Ijazah::where('hash_sha256', $hash)->first();
        if ($ijazah) {
            $ijazah->update(['status' => 'revoked']);
        }

        return [
            'success' => true,
            'tx_hash' => $txHash,
            'message' => 'Sertifikat berhasil dicabut (mock)',
            'explorer_url' => "https://sepolia.etherscan.io/tx/{$txHash}",
        ];
    }
}
