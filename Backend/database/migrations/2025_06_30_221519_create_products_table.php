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
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique(); // Para URLs amigables, debe ser único
            $table->text('description')->nullable(); // Descripción más larga, puede ser nula
            $table->decimal('price', 8, 2); // Precio con 8 dígitos en total, 2 decimales
            $table->integer('stock')->default(0); // Cantidad en stock, por defecto 0
            $table->string('image_url')->nullable(); // URL de la imagen principal, puede ser nula

            // Clave foránea para la categoría
            // Asegúrate de que la tabla 'categories' ya exista y su campo 'id' sea del mismo tipo (bigIncrements)
            $table->foreignId('category_id')
                  ->constrained('categories') // Relaciona con la tabla 'categories'
                  ->onDelete('cascade');     // Si se elimina una categoría, sus productos también se eliminan

            $table->timestamps(); // created_at y updated_at automáticos
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};