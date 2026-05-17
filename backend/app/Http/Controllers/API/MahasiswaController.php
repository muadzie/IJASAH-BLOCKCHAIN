<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Mahasiswa;
use App\Models\Prodi;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class MahasiswaController extends Controller
{
    public function index(Request $request)
    {
        $query = Mahasiswa::with('prodi.fakultas', 'ijazah', 'user');

        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('nama_lengkap', 'like', "%{$request->search}%")
                  ->orWhere('nim', 'like', "%{$request->search}%")
                  ->orWhere('email', 'like', "%{$request->search}%");
            });
        }

        if ($request->prodi_id) {
            $query->where('prodi_id', $request->prodi_id);
        }

        if ($request->status) {
            $query->where('status', $request->status);
        }

        if ($request->tahun_masuk) {
            $query->where('tahun_masuk', $request->tahun_masuk);
        }

        $mahasiswa = $query->orderBy('created_at', 'desc')->paginate($request->per_page ?? 15);

        return response()->json($mahasiswa);
    }

    public function store(Request $request)
    {
        $request->validate([
            'nim' => 'required|string|max:20|unique:mahasiswa,nim',
            'nama_lengkap' => 'required|string|max:255',
            'tempat_lahir' => 'nullable|string|max:100',
            'tanggal_lahir' => 'nullable|date',
            'jenis_kelamin' => 'nullable|in:L,P',
            'prodi_id' => 'required|exists:prodi,id',
            'tahun_masuk' => 'nullable|string|size:4',
            'tahun_lulus' => 'nullable|string|size:4',
            'ipk' => 'nullable|numeric|min:0|max:4',
            'judul_skripsi' => 'nullable|string',
            'email' => 'required|email|unique:mahasiswa,email',
            'no_hp' => 'nullable|string|max:20',
            'status' => 'nullable|in:aktif,lulus,dropout',
            'foto' => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
            'create_user' => 'nullable|boolean',
        ]);

        DB::beginTransaction();

        try {
            $user = null;
            if ($request->create_user) {
                $user = User::create([
                    'name' => $request->nama_lengkap,
                    'email' => $request->email,
                    'password' => Hash::make($request->nim),
                    'role' => 'mahasiswa',
                ]);
                $user->assignRole('mahasiswa');
            }

            $data = [
                'nim' => $request->nim,
                'nama_lengkap' => $request->nama_lengkap,
                'tempat_lahir' => $request->tempat_lahir,
                'tanggal_lahir' => $request->tanggal_lahir,
                'jenis_kelamin' => $request->jenis_kelamin,
                'prodi_id' => $request->prodi_id,
                'tahun_masuk' => $request->tahun_masuk,
                'tahun_lulus' => $request->tahun_lulus,
                'ipk' => $request->ipk,
                'judul_skripsi' => $request->judul_skripsi,
                'email' => $request->email,
                'no_hp' => $request->no_hp,
                'status' => $request->status ?? 'aktif',
                'user_id' => $user->id ?? null,
            ];

            if ($request->hasFile('foto')) {
                $data['foto'] = $request->file('foto')->store('foto_mahasiswa', 'public');
            }

            $mahasiswa = Mahasiswa::create($data);

            DB::commit();

            return response()->json([
                'success' => true,
                'mahasiswa' => $mahasiswa->load('prodi.fakultas'),
                'message' => 'Mahasiswa created successfully',
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function show($id)
    {
        $mahasiswa = Mahasiswa::with('prodi.fakultas', 'ijazah', 'ijazah.issuer', 'user')->findOrFail($id);
        return response()->json($mahasiswa);
    }

    public function update(Request $request, $id)
    {
        $mahasiswa = Mahasiswa::findOrFail($id);

        $request->validate([
            'nim' => 'required|string|max:20|unique:mahasiswa,nim,' . $id,
            'nama_lengkap' => 'required|string|max:255',
            'tempat_lahir' => 'nullable|string|max:100',
            'tanggal_lahir' => 'nullable|date',
            'jenis_kelamin' => 'nullable|in:L,P',
            'prodi_id' => 'required|exists:prodi,id',
            'tahun_masuk' => 'nullable|string|size:4',
            'tahun_lulus' => 'nullable|string|size:4',
            'ipk' => 'nullable|numeric|min:0|max:4',
            'judul_skripsi' => 'nullable|string',
            'email' => 'required|email|unique:mahasiswa,email,' . $id,
            'no_hp' => 'nullable|string|max:20',
            'status' => 'nullable|in:aktif,lulus,dropout',
            'foto' => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
        ]);

        $data = $request->except('foto');

        if ($request->hasFile('foto')) {
            $data['foto'] = $request->file('foto')->store('foto_mahasiswa', 'public');
        }

        $mahasiswa->update($data);

        return response()->json([
            'success' => true,
            'mahasiswa' => $mahasiswa->fresh()->load('prodi.fakultas'),
            'message' => 'Mahasiswa updated successfully',
        ]);
    }

    public function destroy($id)
    {
        $mahasiswa = Mahasiswa::findOrFail($id);

        if ($mahasiswa->ijazah) {
            return response()->json(['error' => 'Cannot delete student with existing certificate'], 422);
        }

        $mahasiswa->delete();

        return response()->json([
            'success' => true,
            'message' => 'Mahasiswa deleted successfully',
        ]);
    }

    public function import(Request $request)
    {
        $request->validate([
            'data' => 'required|array',
            'data.*.nim' => 'required|string|max:20',
            'data.*.nama_lengkap' => 'required|string|max:255',
            'data.*.email' => 'required|email',
            'data.*.prodi_kode' => 'required|string|exists:prodi,kode',
            'data.*.tahun_masuk' => 'nullable|string|size:4',
            'data.*.tahun_lulus' => 'nullable|string|size:4',
            'data.*.ipk' => 'nullable|numeric|min:0|max:4',
            'data.*.status' => 'nullable|in:aktif,lulus,dropout',
            'data.*.tempat_lahir' => 'nullable|string|max:100',
            'data.*.tanggal_lahir' => 'nullable|date',
            'data.*.jenis_kelamin' => 'nullable|in:L,P',
            'data.*.no_hp' => 'nullable|string|max:20',
        ]);

        $imported = 0;
        $errors = [];

        foreach ($request->data as $index => $item) {
            try {
                $prodi = Prodi::where('kode', $item['prodi_kode'])->first();

                Mahasiswa::updateOrCreate(
                    ['nim' => $item['nim']],
                    [
                        'nama_lengkap' => $item['nama_lengkap'],
                        'email' => $item['email'],
                        'prodi_id' => $prodi->id,
                        'tahun_masuk' => $item['tahun_masuk'] ?? null,
                        'tahun_lulus' => $item['tahun_lulus'] ?? null,
                        'ipk' => $item['ipk'] ?? null,
                        'tempat_lahir' => $item['tempat_lahir'] ?? null,
                        'tanggal_lahir' => $item['tanggal_lahir'] ?? null,
                        'jenis_kelamin' => $item['jenis_kelamin'] ?? null,
                        'no_hp' => $item['no_hp'] ?? null,
                        'status' => $item['status'] ?? 'aktif',
                    ]
                );
                $imported++;
            } catch (\Exception $e) {
                $errors[] = "Row {$index}: {$e->getMessage()}";
            }
        }

        return response()->json([
            'success' => true,
            'imported' => $imported,
            'errors' => $errors,
            'message' => "Successfully imported {$imported} students",
        ]);
    }

    public function batchDelete(Request $request)
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'string|exists:mahasiswa,id',
        ]);

        $deleted = 0;
        $errors = [];

        foreach ($request->ids as $id) {
            try {
                $mahasiswa = Mahasiswa::find($id);
                if ($mahasiswa && !$mahasiswa->ijazah) {
                    $mahasiswa->delete();
                    $deleted++;
                } else {
                    $errors[] = "Mahasiswa {$id} memiliki sertifikat, tidak bisa dihapus";
                }
            } catch (\Exception $e) {
                $errors[] = "Mahasiswa {$id}: {$e->getMessage()}";
            }
        }

        return response()->json([
            'success' => true,
            'deleted' => $deleted,
            'errors' => $errors,
            'message' => "{$deleted} mahasiswa berhasil dihapus",
        ]);
    }
}
