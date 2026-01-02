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
        Schema::table('categories', function (Blueprint $table) {
            // 'slug' para URLs amigables, debe ser único
            $table->string('slug')->unique()->after('name'); 
            // 'description_short' para resúmenes, puede ser nulo
            $table->string('description_short')->nullable()->after('image_url');
            // 'description_long' para descripciones completas, puede ser nulo
            $table->text('description_long')->nullable()->after('description_short');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('categories', function (Blueprint $table) {
            // Al revertir, elimina las columnas en el orden inverso
            $table->dropColumn(['description_long', 'description_short', 'slug']);
        });
    }
};