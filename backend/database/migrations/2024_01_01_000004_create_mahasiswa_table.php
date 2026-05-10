<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('mahasiswa', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('nim', 20)->unique();
            $table->string('nama_lengkap', 255);
            $table->string('tempat_lahir', 100)->nullable();
            $table->date('tanggal_lahir')->nullable();
            $table->enum('jenis_kelamin', ['L', 'P'])->nullable();
            $table->uuid('prodi_id');
            $table->string('tahun_masuk', 4)->nullable();
            $table->string('tahun_lulus', 4)->nullable();
            $table->decimal('ipk', 3, 2)->nullable();
            $table->text('judul_skripsi')->nullable();
            $table->string('email', 255)->unique();
            $table->string('no_hp', 20)->nullable();
            $table->text('foto')->nullable();
            $table->enum('status', ['aktif', 'lulus', 'dropout'])->default('aktif');
            $table->uuid('user_id')->nullable();
            $table->timestamps();
            $table->foreign('prodi_id')->references('id')->on('prodi');
            $table->foreign('user_id')->references('id')->on('users');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('mahasiswa');
    }
};
