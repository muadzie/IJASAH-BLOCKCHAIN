<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\AuthController;
use App\Http\Controllers\API\VerificationController;
use App\Http\Controllers\API\CertificateController;
use App\Http\Controllers\API\DashboardController;
use App\Http\Controllers\API\MahasiswaController;
use App\Http\Controllers\API\AdminController;

// Public routes
Route::post('/auth/login', [AuthController::class, 'login']);
Route::post('/verify/hash', [VerificationController::class, 'verifyByHash']);
Route::post('/verify/file', [VerificationController::class, 'verifyByFile']);
Route::get('/verify/stats', [VerificationController::class, 'getVerificationStats']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // Auth
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::post('/auth/change-password', [AuthController::class, 'changePassword']);
    
    // Dashboard
    Route::get('/dashboard/stats', [DashboardController::class, 'getStats']);
    
    // Certificates
    Route::get('/certificates/{id}/download', [CertificateController::class, 'download']);
    Route::get('/certificates/mahasiswa/{mahasiswaId}', [CertificateController::class, 'getByMahasiswa']);
    
    // Admin only routes
    Route::middleware('role:super_admin,admin_akademik')->group(function () {
        Route::post('/certificates/generate', [CertificateController::class, 'generate']);
        Route::post('/certificates/{id}/publish', [CertificateController::class, 'publishToBlockchain']);
        Route::post('/certificates/{id}/revoke', [CertificateController::class, 'revoke']);
        
        // Mahasiswa management
        Route::get('/mahasiswa', [MahasiswaController::class, 'index']);
        Route::post('/mahasiswa', [MahasiswaController::class, 'store']);
        Route::get('/mahasiswa/{id}', [MahasiswaController::class, 'show']);
        Route::put('/mahasiswa/{id}', [MahasiswaController::class, 'update']);
        Route::delete('/mahasiswa/{id}', [MahasiswaController::class, 'destroy']);
        Route::post('/mahasiswa/import', [MahasiswaController::class, 'import']);
        
        // Get lists for dropdown
        Route::get('/fakultas', [AdminController::class, 'getFakultas']);
        Route::get('/prodi', [AdminController::class, 'getProdi']);
        Route::get('/prodi/by-fakultas/{fakultasId}', [AdminController::class, 'getProdiByFakultas']);
    });
    
    // Super admin only routes
    Route::middleware('role:super_admin')->group(function () {
        // User management
        Route::get('/users', [AdminController::class, 'getUsers']);
        Route::post('/users', [AdminController::class, 'createUser']);
        Route::put('/users/{id}/role', [AdminController::class, 'updateUserRole']);
        Route::delete('/users/{id}', [AdminController::class, 'deleteUser']);
        
        // System settings
        Route::get('/system/info', [AdminController::class, 'getSystemInfo']);
        Route::post('/system/clear-cache', [AdminController::class, 'clearCache']);
    });
});