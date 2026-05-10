<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('prodi', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('fakultas_id');
            $table->string('kode', 10)->unique();
            $table->string('nama', 255);
            $table->enum('jenjang', ['D3', 'D4', 'S1', 'S2', 'S3']);
            $table->timestamps();
            $table->foreign('fakultas_id')->references('id')->on('fakultas')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('prodi');
    }
};
