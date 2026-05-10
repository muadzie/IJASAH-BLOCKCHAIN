<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Ijazah - {{ $mahasiswa->nama_lengkap }}</title>
    <style>
        @page { margin: 0; }
        body {
            font-family: 'Times New Roman', Times, serif;
            margin: 0;
            padding: 0;
            background: white;
        }
        .container {
            width: 190mm;
            min-height: 277mm;
            margin: 0 auto;
            padding: 20mm 15mm;
            border: 8px double #1a365d;
            box-sizing: border-box;
            position: relative;
        }
        .header {
            text-align: center;
            margin-bottom: 10mm;
            border-bottom: 3px solid #1a365d;
            padding-bottom: 5mm;
        }
        .header h1 {
            font-size: 28pt;
            color: #1a365d;
            margin: 0 0 5px 0;
            letter-spacing: 3px;
            text-transform: uppercase;
        }
        .header h2 {
            font-size: 16pt;
            color: #2d3748;
            margin: 0;
        }
        .header p {
            font-size: 12pt;
            color: #4a5568;
            margin: 3px 0;
        }
        .title {
            text-align: center;
            margin: 8mm 0;
        }
        .title h3 {
            font-size: 22pt;
            color: #1a365d;
            margin: 0;
            text-transform: uppercase;
            text-decoration: underline;
        }
        .title p {
            font-size: 14pt;
            color: #4a5568;
            margin: 5px 0 0 0;
            font-style: italic;
        }
        .body-text {
            margin: 10mm 5mm;
            text-align: justify;
            font-size: 13pt;
            line-height: 1.8;
        }
        .body-text p {
            margin: 5mm 0;
        }
        .student-info {
            margin: 8mm 5mm;
            font-size: 13pt;
            line-height: 2;
        }
        .student-info table {
            width: 100%;
        }
        .student-info td {
            padding: 2px 5px;
            vertical-align: top;
        }
        .student-info .label {
            width: 120px;
            font-weight: bold;
        }
        .student-info .separator {
            width: 20px;
            text-align: center;
        }
        .footer {
            margin-top: 10mm;
            display: flex;
            justify-content: space-between;
            align-items: end;
        }
        .footer-left {
            width: 40%;
        }
        .footer-right {
            width: 40%;
            text-align: center;
        }
        .qr-code {
            width: 120px;
            height: 120px;
        }
        .verification-note {
            font-size: 8pt;
            color: #718096;
            margin-top: 3px;
        }
        .signature {
            margin-top: 15mm;
            text-align: right;
        }
        .signature p {
            margin: 2px 0;
            font-size: 12pt;
        }
        .signature .name {
            margin-top: 20mm;
            font-weight: bold;
            text-decoration: underline;
        }
        .watermark {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-30deg);
            font-size: 60pt;
            color: rgba(26, 54, 93, 0.05);
            font-weight: bold;
            pointer-events: none;
            z-index: -1;
        }
        .stamp {
            position: absolute;
            bottom: 30mm;
            right: 20mm;
            width: 150px;
            height: 150px;
            border: 3px solid #1a365d;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            text-align: center;
            font-size: 9pt;
            color: #1a365d;
            opacity: 0.4;
            transform: rotate(-15deg);
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="watermark">IJAZAH</div>

        <div class="header">
            <h1>UNIVERSITAS SUBANG</h1>
            <h2>KEMENTERIAN PENDIDIKAN, KEBUDAYAAN, RISET DAN TEKNOLOGI</h2>
            <p>Jl. R.A. Kartono No. 31, Subang, Jawa Barat 41211</p>
        </div>

        <div class="title">
            <h3>IJAZAH</h3>
            <p>Nomor: {{ $ijazah->nomor_ijazah }}</p>
        </div>

        <div class="body-text">
            <p>Berdasarkan Peraturan Menteri Pendidikan, Kebudayaan, Riset dan Teknologi Republik Indonesia, dengan ini menyatakan bahwa:</p>
        </div>

        <div class="student-info">
            <table>
                <tr>
                    <td class="label">Nama</td>
                    <td class="separator">:</td>
                    <td><strong>{{ $mahasiswa->nama_lengkap }}</strong></td>
                </tr>
                <tr>
                    <td class="label">Tempat/Tgl. Lahir</td>
                    <td class="separator">:</td>
                    <td>{{ $mahasiswa->tempat_lahir }}{{ $mahasiswa->tanggal_lahir ? ', ' . $mahasiswa->tanggal_lahir->format('d F Y') : '' }}</td>
                </tr>
                <tr>
                    <td class="label">NIM</td>
                    <td class="separator">:</td>
                    <td>{{ $mahasiswa->nim }}</td>
                </tr>
                <tr>
                    <td class="label">Program Studi</td>
                    <td class="separator">:</td>
                    <td>{{ $prodi->nama }}</td>
                </tr>
                <tr>
                    <td class="label">Jenjang</td>
                    <td class="separator">:</td>
                    <td>{{ $prodi->jenjang }}</td>
                </tr>
                <tr>
                    <td class="label">Fakultas</td>
                    <td class="separator">:</td>
                    <td>{{ $fakultas->nama }}</td>
                </tr>
                <tr>
                    <td class="label">IPK</td>
                    <td class="separator">:</td>
                    <td>{{ number_format($mahasiswa->ipk, 2) }}</td>
                </tr>
                <tr>
                    <td class="label">Tahun Masuk</td>
                    <td class="separator">:</td>
                    <td>{{ $mahasiswa->tahun_masuk }}</td>
                </tr>
                <tr>
                    <td class="label">Tahun Lulus</td>
                    <td class="separator">:</td>
                    <td>{{ $mahasiswa->tahun_lulus }}</td>
                </tr>
            </table>
        </div>

        <div class="body-text">
            <p>Lulus dan berhak menyandang gelar {{ $mahasiswa->nama_lengkap_with_gelar }} berdasarkan Surat Keputusan Rektor Universitas Subang dengan segala hak dan kewajiban yang melekat.</p>
            <p>Ijazah ini telah diterbitkan secara digital dan diverifikasi melalui teknologi blockchain. Keaslian ijazah dapat diverifikasi melalui sistem verifikasi online Universitas Subang.</p>
        </div>

        <div class="footer">
            <div class="footer-left">
                <img class="qr-code" src="{{ $qrCode }}" alt="QR Code">
                <div class="verification-note">
                    Scan untuk verifikasi<br>
                    atau kunjungi: {{ $verificationUrl }}
                </div>
            </div>
            <div class="footer-right">
                <p>Subang, {{ $ijazah->issued_at?->format('d F Y') }}</p>
                <p>Rektor Universitas Subang,</p>
                <div class="signature">
                    <p class="name">Prof. Dr. H. Ahmad Kosasih, M.Pd.</p>
                    <p>NIP. 19651234 199003 1 001</p>
                </div>
            </div>
        </div>

        <div class="stamp">
            UNIVERSITAS<br>SUBANG
        </div>
    </div>
</body>
</html>
