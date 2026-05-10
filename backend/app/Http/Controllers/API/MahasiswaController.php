<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Mahasiswa;
use App\Models\Prodi;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

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
            'email' => 'required|email|unique:mahasiswa,email',
            'no_hp' => 'nullable|string|max:20',
            'status' => 'nullable|in:aktif,lulus,dropout',
            'create_user' => 'nullable|boolean',
        ]);

        DB::beginTransaction();

        try {
            if ($request->create_user) {
                $user = User::create([
                    'name' => $request->nama_lengkap,
                    'email' => $request->email,
                    'password' => Hash::make($request->nim),
                    'role' => 'mahasiswa',
                ]);
                $user->assignRole('mahasiswa');
            }

            $mahasiswa = Mahasiswa::create([
                'nim' => $request->nim,
                'nama_lengkap' => $request->nama_lengkap,
                'tempat_lahir' => $request->tempat_lahir,
                'tanggal_lahir' => $request->tanggal_lahir,
                'jenis_kelamin' => $request->jenis_kelamin,
                'prodi_id' => $request->prodi_id,
                'tahun_masuk' => $request->tahun_masuk,
                'email' => $request->email,
                'no_hp' => $request->no_hp,
                'status' => $request->status ?? 'aktif',
                'user_id' => $user->id ?? null,
            ]);

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
        ]);

        $mahasiswa->update($request->all());

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
                        'tempat_lahir' => $item['tempat_lahir'] ?? null,
                        'tanggal_lahir' => $item['tanggal_lahir'] ?? null,
                        'jenis_kelamin' => $item['jenis_kelamin'] ?? null,
                        'status' => 'aktif',
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
}
