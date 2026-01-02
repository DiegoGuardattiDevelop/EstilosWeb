<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('categories', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique(); // 'Masculino', 'Femenino', etc.
            $table->string('description')->nullable(); // 'Estilo y comodidad para el hombre moderno.'
            $table->string('image_url')->nullable(); // La URL de la imagen, e.g., '/api/placeholder/180/180'
            $table->string('color')->nullable(); // Color de fondo, e.g., '#B6C7E3'
            $table->string('text_color')->nullable(); // Color del texto, e.g., '#0B1938'
            $table->timestamps(); // created_at y updated_at
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('categories');
    }
};
