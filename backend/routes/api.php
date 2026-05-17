<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\AuthController;
use App\Http\Controllers\API\VerificationController;
use App\Http\Controllers\API\IjazahController;
use App\Http\Controllers\API\DashboardController;
use App\Http\Controllers\API\MahasiswaController;
use App\Http\Controllers\API\AdminController;
use App\Http\Controllers\API\VerificationLogController;

/*
|--------------------------------------------------------------------------
| API Routes - Ijazah Blockchain UNSUB (Sepolia Testnet)
|--------------------------------------------------------------------------
*/

// Public routes (no auth required)
Route::post('/auth/login', [AuthController::class, 'login']);

// Public Verification (baca dari Sepolia Testnet)
Route::post('/verify/hash', [VerificationController::class, 'verifyByHash']);
Route::post('/verify/file', [VerificationController::class, 'verifyByFile']);
Route::get('/verify/stats', [VerificationController::class, 'getVerificationStats']);
Route::get('/verify/{hash}', [VerificationController::class, 'verifyByHashUrl']);
Route::get('/verify/etherscan/{txHash}', [VerificationController::class, 'redirectToEtherscan']);

// Protected routes (Sanctum auth)
Route::middleware('auth:sanctum')->group(function () {
    // Auth
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::post('/auth/change-password', [AuthController::class, 'changePassword']);

    // Dashboard
    Route::get('/dashboard/stats', [DashboardController::class, 'getStats']);

    // Ijazah Management (Upload existing PDF -> Sepolia)
    Route::get('/ijazah', [IjazahController::class, 'index']);
    Route::post('/ijazah/upload', [IjazahController::class, 'upload']);
    Route::get('/ijazah/{id}', [IjazahController::class, 'show']);
    Route::post('/ijazah/{id}/revoke', [IjazahController::class, 'revoke']);
    Route::get('/ijazah/{id}/download', [IjazahController::class, 'download']);

    // Blockchain stats
    Route::get('/ijazah/blockchain/stats', [IjazahController::class, 'blockchainStats']);
    Route::get('/ijazah/blockchain/balance', [IjazahController::class, 'balance']);

    // Backward compat: certificate routes
    Route::get('/certificates', [IjazahController::class, 'index']);
    Route::get('/certificates/{id}/download', [IjazahController::class, 'download']);

    // Verification logs
    Route::get('/verification-logs', [VerificationLogController::class, 'index']);
    Route::get('/verification-logs/today', [VerificationLogController::class, 'todayStats']);

    // Admin & Akademik only
    Route::middleware('role:super_admin,admin_akademik')->group(function () {
        // Legacy certificate management (backward compat)
        Route::post('/certificates/generate', [IjazahController::class, 'upload']);
        Route::put('/certificates/{id}', function ($id) {
            return response()->json(['message' => 'Use POST /api/ijazah/upload instead']);
        });
        Route::post('/certificates/{id}/publish', function ($id) {
            return response()->json(['message' => 'Certificates are published on upload']);
        });
        Route::post('/certificates/{id}/revoke', [IjazahController::class, 'revoke']);

        // Mahasiswa management
        Route::get('/mahasiswa', [MahasiswaController::class, 'index']);
        Route::post('/mahasiswa', [MahasiswaController::class, 'store']);
        Route::get('/mahasiswa/{id}', [MahasiswaController::class, 'show']);
        Route::put('/mahasiswa/{id}', [MahasiswaController::class, 'update']);
        Route::delete('/mahasiswa/{id}', [MahasiswaController::class, 'destroy']);
        Route::post('/mahasiswa/import', [MahasiswaController::class, 'import']);
        Route::post('/mahasiswa/batch-delete', [MahasiswaController::class, 'batchDelete']);

        // Reference data
        Route::get('/fakultas', [AdminController::class, 'getFakultas']);
        Route::get('/prodi', [AdminController::class, 'getProdi']);
        Route::get('/prodi/by-fakultas/{fakultasId}', [AdminController::class, 'getProdiByFakultas']);
    });

    // Super admin only
    Route::middleware('role:super_admin')->group(function () {
        Route::get('/users', [AdminController::class, 'getUsers']);
        Route::post('/users', [AdminController::class, 'createUser']);
        Route::put('/users/{id}/role', [AdminController::class, 'updateUserRole']);
        Route::delete('/users/{id}', [AdminController::class, 'deleteUser']);
        Route::get('/system/info', [AdminController::class, 'getSystemInfo']);
        Route::post('/system/clear-cache', [AdminController::class, 'clearCache']);
        Route::get('/activity-logs', [AdminController::class, 'getActivityLogs']);
        Route::post('/fakultas', [AdminController::class, 'storeFakultas']);
        Route::put('/fakultas/{id}', [AdminController::class, 'updateFakultas']);
        Route::delete('/fakultas/{id}', [AdminController::class, 'destroyFakultas']);
        Route::post('/prodi', [AdminController::class, 'storeProdi']);
        Route::put('/prodi/{id}', [AdminController::class, 'updateProdi']);
        Route::delete('/prodi/{id}', [AdminController::class, 'destroyProdi']);
    });
});
