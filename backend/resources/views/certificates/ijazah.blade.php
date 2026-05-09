<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Ijazah - {{ $mahasiswa->nama_lengkap }}</title>
    <style>
        @page {
            size: A4;
            margin: 2cm;
        }
        body {
            font-family: 'Times New Roman', serif;
            line-height: 1.5;
            color: #1a1a1a;
        }
        .container {
            border: 2px solid #1a365d;
            padding: 40px;
            position: relative;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        .logo {
            font-size: 24px;
            font-weight: bold;
            color: #1a365d;
        }
        .university {
            font-size: 28px;
            font-weight: bold;
            margin: 10px 0;
            letter-spacing: 2px;
        }
        .title {
            font-size: 32px;
            font-weight: bold;
            margin: 30px 0;
            text-align: center;
            text-decoration: underline;
        }
        .content {
            margin: 30px 0;
        }
        .student-name {
            font-size: 24px;
            font-weight: bold;
            text-align: center;
            margin: 20px 0;
            text-transform: uppercase;
        }
        .info-table {
            width: 100%;
            margin: 20px 0;
        }
        .info-table td {
            padding: 8px;
        }
        .label {
            width: 30%;
            font-weight: bold;
        }
        .signature {
            margin-top: 50px;
        }
        .signature-line {
            width: 200px;
            border-top: 1px solid #000;
            margin-top: 40px;
        }
        .qr-code {
            position: absolute;
            bottom: 40px;
            right: 40px;
            width: 100px;
            text-align: center;
        }
        .qr-code img {
            width: 100px;
            height: 100px;
        }
        .footer {
            position: absolute;
            bottom: 40px;
            left: 40px;
            right: 40px;
            font-size: 10px;
            text-align: center;
            color: #666;
        }
        .blockchain-badge {
            position: absolute;
            top: 40px;
            right: 40px;
            font-size: 10px;
            background: #f0f0f0;
            padding: 5px 10px;
            border-radius: 5px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="blockchain-badge">
            ✓ Terverifikasi Blockchain
        </div>
        
        <div class="header">
            <div class="logo">KEMENTERIAN PENDIDIKAN, KEBUDAYAAN, RISET, DAN TEKNOLOGI</div>
            <div class="university">UNIVERSITAS SUBANG</div>
            <div>Jl. Raya Subang - Bandung Km. 20, Subang, Jawa Barat</div>
        </div>
        
        <div class="title">
            IJAZAH
        </div>
        
        <div class="content">
            <p style="text-align: center; font-size: 18px;">Nomor: {{ $ijazah->nomor_ijazah }}</p>
            
            <p style="text-align: justify; margin-top: 30px;">
                Lulusan pendidikan program {{ $prodi->jenjang }} pada {{ $fakultas->nama }}, 
                Universitas Subang, menerangkan bahwa:
            </p>
            
            <div class="student-name">
                {{ $mahasiswa->nama_lengkap }}
            </div>
            
            <table class="info-table">
                <tr>
                    <td class="label">NIM</td>
                    <td>: {{ $mahasiswa->nim }}</td>
                </tr>
                <tr>
                    <td class="label">Tempat / Tanggal Lahir</td>
                    <td>: {{ $mahasiswa->tempat_lahir }}, {{ date('d F Y', strtotime($mahasiswa->tanggal_lahir)) }}</td>
                </tr>
                <tr>
                    <td class="label">Program Studi</td>
                    <td>: {{ $prodi->nama }}</td>
                </tr>
                <tr>
                    <td class="label">IPK</td>
                    <td>: {{ number_format($mahasiswa->ipk, 2) }}</td>
                </tr>
                <tr>
                    <td class="label">Predikat Kelulusan</td>
                    <td>: 
                        @if($mahasiswa->ipk >= 3.51) Cum Laude
                        @elseif($mahasiswa->ipk >= 3.01) Sangat Memuaskan
                        @else Memuaskan
                        @endif
                    </td>
                </tr>
                <tr>
                    <td class="label">Tanggal Lulus</td>
                    <td>: {{ date('d F Y', strtotime($ijazah->issued_at)) }}</td>
                </tr>
            </table>
            
            <p style="text-align: justify; margin-top: 30px;">
                Dinyatakan <strong>LULUS</strong> dari program studi yang telah diikutinya dengan segala hak dan kewajiban yang melekat.
            </p>
        </div>
        
        <div class="signature">
            <div style="float: left; width: 45%;">
                <div>Subang, {{ date('d F Y', strtotime($ijazah->issued_at)) }}</div>
                <div>Rektor,</div>
                <div class="signature-line"></div>
                <div><strong>Prof. Dr. H. Ahmad Syaikhu, M.Si.</strong></div>
                <div>NIP. 196512311990031234</div>
            </div>
            
            <div style="float: right; width: 45%;">
                <div>Dekan {{ $fakultas->nama }},</div>
                <div class="signature-line"></div>
                <div><strong>Dr. Eng. Bambang Supriyanto, S.T., M.T.</strong></div>
                <div>NIP. 197506102003121001</div>
            </div>
        </div>
        
        <div class="qr-code">
            <img src="{{ $qrCode }}" alt="QR Code">
            <div style="font-size: 8px; margin-top: 5px;">Scan untuk verifikasi</div>
        </div>
        
        <div class="footer">
            Ijazah ini terdaftar di Blockchain Ethereum dengan hash: {{ $ijazah->hash_sha256 }}<br>
            Verifikasi online: {{ $verificationUrl }}
        </div>
    </div>
</body>
</html>