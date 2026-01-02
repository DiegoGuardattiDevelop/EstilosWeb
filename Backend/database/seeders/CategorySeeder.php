<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Category; // Asegúrate de importar el modelo Category
use Illuminate\Support\Str; // Para usar Str::slug()

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Opcional: Vaciar la tabla antes de sembrar para asegurar un estado limpio
        // Esto es útil en desarrollo, pero ten cuidado en producción.
        // Category::truncate(); 

        // Colección Masculina
        Category::create([
            'name' => 'Masculino',
            'slug' => Str::slug('Masculino'),
            'image_url' => 'http://127.0.0.1:8000/storage/categories/Masculino.png',
            'description_short' => 'Estilo y comodidad para el hombre moderno.',
            'description_long' => 'Descubre lo último en moda para caballeros. Prendas versátiles para cada ocasión, desde casual hasta formal con acabados premium y diseños contemporáneos.',
            'color' => '#B6C7E3', // Color de fondo principal
            'text_color' => '#0B1938', // Color de texto
        ]);

        // Colección Femenina
        Category::create([
            'name' => 'Femenino',
            'slug' => Str::slug('Femenino'),
            'image_url' => 'http://127.0.0.1:8000/storage/categories/Femenino.png',
            'description_short' => 'Tendencias que inspiran y prendas que empoderan.',
            'description_long' => 'Explora nuestra selección de ropa femenina. Encuentra diseños únicos y elegantes para cada momento, desde lo casual hasta lo más sofisticado.',
            'color' => '#D8C5E0',
            'text_color' => '#212121',
        ]);

        // Colección Blancos
        Category::create([
            'name' => 'Blancos',
            'slug' => Str::slug('Blancos'),
            'image_url' => 'http://127.0.0.1:8000/storage/categories/Blancos.png',
            'description_short' => 'Confort y calidad en textiles para el hogar.',
            'description_long' => 'Todo para tu hogar: sábanas, toallas y más. Calidad y suavidad que envuelven tus espacios con materiales premium y diseños atemporales.',
            'color' => '#DEDEBA',
            'text_color' => '#2E2E27',
        ]);

        // Lencería
        Category::create([
            'name' => 'Lenceria',
            'slug' => Str::slug('Lenceria'),
            'image_url' => 'http://127.0.0.1:8000/storage/categories/Lenceria.png',
            'description_short' => 'Comodidad y diseño en cada detalle íntimo.',
            'description_long' => 'La intimidad que mereces. Descubre nuestra lencería y ropa interior con diseños que te encantarán, combinando elegancia y comodidad.',
            'color' => '#E8C1CF',
            'text_color' => '#261F22',
        ]);

        // Colección Niños
        Category::create([
            'name' => 'Niños',
            'slug' => Str::slug('Niños'),
            'image_url' => 'http://127.0.0.1:8000/storage/categories/Niños.png',
            'description_short' => 'Diversión y estilo para los más pequeños.',
            'description_long' => 'Prendas duraderas y coloridas para los reyes y reinas del hogar. ¡Moda para jugar y crecer con materiales seguros y diseños divertidos!',
            'color' => '#D9D980',
            'text_color' => '#2B2528',
        ]);

        // Novedades
        Category::create([
            'name' => 'Novedades',
            'slug' => Str::slug('Novedades'),
            'image_url' => 'http://127.0.0.1:8000/storage/categories/Novedades.png',
            'description_short' => 'Las últimas tendencias y lanzamientos exclusivos.',
            'description_long' => 'Mantente al día con las últimas tendencias. Descubre los productos más recientes y las colecciones de temporada que marcan la diferencia.',
            'color' => '#9BDE9B',
            'text_color' => '#1A261A',
        ]);

        // Outlet
        Category::create([
            'name' => 'Outlet',
            'slug' => Str::slug('Outlet'),
            'image_url' => 'http://127.0.0.1:8000/storage/categories/Outlet.png',
            'description_short' => 'Grandes descuentos en productos seleccionados.',
            'description_long' => 'Aprovecha ofertas increíbles en productos de calidad. Encuentra tus prendas favoritas a precios especiales sin comprometer el estilo.',
            'color' => '#CEBAE3',
            'text_color' => '#18161A',
        ]);
    }
}