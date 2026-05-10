<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Fakultas;
use App\Models\Prodi;
use App\Models\User;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class AdminController extends Controller
{
    public function getFakultas()
    {
        $fakultas = Fakultas::with('prodis')->orderBy('nama')->get();
        return response()->json($fakultas);
    }

    public function getProdi(Request $request)
    {
        $query = Prodi::with('fakultas');
        if ($request->fakultas_id) {
            $query->where('fakultas_id', $request->fakultas_id);
        }
        $prodi = $query->orderBy('nama')->get();
        return response()->json($prodi);
    }

    public function getProdiByFakultas($fakultasId)
    {
        $prodi = Prodi::where('fakultas_id', $fakultasId)->orderBy('nama')->get();
        return response()->json($prodi);
    }

    public function getUsers(Request $request)
    {
        $query = User::with('mahasiswa');
        if ($request->role) {
            $query->where('role', $request->role);
        }
        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%")
                  ->orWhere('email', 'like', "%{$request->search}%");
            });
        }
        $users = $query->orderBy('created_at', 'desc')->paginate($request->per_page ?? 15);
        return response()->json($users);
    }

    public function createUser(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8',
            'role' => 'required|in:super_admin,admin_akademik,mahasiswa,verifikator',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => $request->role,
        ]);

        $user->assignRole($request->role);

        return response()->json([
            'success' => true,
            'user' => $user,
            'message' => 'User created successfully',
        ], 201);
    }

    public function updateUserRole(Request $request, $id)
    {
        $request->validate([
            'role' => 'required|in:super_admin,admin_akademik,mahasiswa,verifikator',
        ]);

        $user = User::findOrFail($id);
        $user->update(['role' => $request->role]);
        $user->syncRoles([$request->role]);

        return response()->json([
            'success' => true,
            'user' => $user,
            'message' => 'User role updated successfully',
        ]);
    }

    public function deleteUser($id)
    {
        $user = User::findOrFail($id);

        if ($user->id === request()->user()->id) {
            return response()->json(['error' => 'Cannot delete yourself'], 422);
        }

        $user->delete();

        return response()->json([
            'success' => true,
            'message' => 'User deleted successfully',
        ]);
    }

    public function getSystemInfo()
    {
        return response()->json([
            'php_version' => phpversion(),
            'laravel_version' => app()->version(),
            'environment' => app()->environment(),
            'debug_mode' => config('app.debug'),
            'database' => config('database.default'),
            'cache_driver' => config('cache.default'),
            'queue_driver' => config('queue.default'),
            'session_driver' => config('session.driver'),
            'blockchain_mock_mode' => env('BLOCKCHAIN_MOCK_MODE', true),
            'app_url' => config('app.url'),
            'frontend_url' => env('APP_FRONTEND_URL'),
        ]);
    }

    public function getActivityLogs(Request $request)
    {
        $query = ActivityLog::with('user')->orderBy('created_at', 'desc');

        if ($request->filled('action')) {
            $query->where('action', $request->action);
        }

        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        return response()->json(
            $query->paginate($request->per_page ?? 20)
        );
    }

    // Fakultas management
    public function storeFakultas(Request $request)
    {
        $request->validate([
            'kode' => 'required|string|max:10|unique:fakultas,kode',
            'nama' => 'required|string|max:255',
        ]);

        $fakultas = Fakultas::create($request->only(['kode', 'nama']));

        ActivityLog::create([
            'user_id' => $request->user()->id,
            'action' => 'create_fakultas',
            'description' => "Created fakultas: {$fakultas->nama}",
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json($fakultas, 201);
    }

    public function updateFakultas(Request $request, $id)
    {
        $fakultas = Fakultas::findOrFail($id);

        $request->validate([
            'kode' => "sometimes|string|max:10|unique:fakultas,kode,{$id}",
            'nama' => 'sometimes|string|max:255',
        ]);

        $fakultas->update($request->only(['kode', 'nama']));

        return response()->json($fakultas);
    }

    public function destroyFakultas($id)
    {
        $fakultas = Fakultas::findOrFail($id);

        if ($fakultas->prodis()->exists()) {
            return response()->json(['error' => 'Cannot delete fakultas with existing prodi'], 422);
        }

        $fakultas->delete();

        return response()->json(['success' => true, 'message' => 'Fakultas deleted successfully']);
    }

    // Prodi management
    public function storeProdi(Request $request)
    {
        $request->validate([
            'fakultas_id' => 'required|exists:fakultas,id',
            'kode' => 'required|string|max:10|unique:prodi,kode',
            'nama' => 'required|string|max:255',
            'jenjang' => 'required|in:D3,D4,S1,S2,S3',
        ]);

        $prodi = Prodi::create($request->only(['fakultas_id', 'kode', 'nama', 'jenjang']));

        ActivityLog::create([
            'user_id' => $request->user()->id,
            'action' => 'create_prodi',
            'description' => "Created prodi: {$prodi->nama} ({$prodi->jenjang})",
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json($prodi->load('fakultas'), 201);
    }

    public function updateProdi(Request $request, $id)
    {
        $prodi = Prodi::findOrFail($id);

        $request->validate([
            'fakultas_id' => 'sometimes|exists:fakultas,id',
            'kode' => "sometimes|string|max:10|unique:prodi,kode,{$id}",
            'nama' => 'sometimes|string|max:255',
            'jenjang' => 'sometimes|in:D3,D4,S1,S2,S3',
        ]);

        $prodi->update($request->only(['fakultas_id', 'kode', 'nama', 'jenjang']));

        return response()->json($prodi->load('fakultas'));
    }

    public function destroyProdi($id)
    {
        $prodi = Prodi::findOrFail($id);

        if ($prodi->mahasiswas()->exists()) {
            return response()->json(['error' => 'Cannot delete prodi with existing mahasiswa'], 422);
        }

        $prodi->delete();

        return response()->json(['success' => true, 'message' => 'Prodi deleted successfully']);
    }
}
