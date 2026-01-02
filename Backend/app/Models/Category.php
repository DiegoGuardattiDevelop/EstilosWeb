<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'slug',              // <-- ¡Añadir esta línea!
        'image_url',
        'description_short', // <-- ¡Añadir esta línea!
        'description_long',  // <-- ¡Añadir esta línea!
        'color',
        'text_color',
        // Si 'description' (a secas) ya no se usa y es reemplazado por short/long,
        // podrías considerarlo para eliminarlo de aquí y de la migración original,
        // pero por ahora lo dejamos si existe para evitar romper lo que ya tienes.
        // 'description', // Puedes mantenerlo o eliminarlo si solo usas short/long
    ];

    // Puedes agregar otras relaciones o métodos aquí si los tienes
}