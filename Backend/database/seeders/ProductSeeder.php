<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Product;
use App\Models\Category;
use Illuminate\Support\Str;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        // Obtener las categorías por slug (las que ya tienes)
        $masculino = Category::where('slug', 'masculino')->first();
        $femenino = Category::where('slug', 'femenino')->first();
        $blancos = Category::where('slug', 'blancos')->first();
        $lenceria = Category::where('slug', 'lenceria')->first();
        $novedades = Category::where('slug', 'novedades')->first();
        $outlet = Category::where('slug', 'outlet')->first();

        $products = [
            // PRODUCTOS MASCULINO
            [
                'name' => 'Camisa Casual Hombre',
                'description' => 'Camisa de algodón 100% para look casual. Perfecta para el día a día y ocasiones informales.',
                'price' => 49.99,
                'stock' => 50,
                'image_url' => 'camisa-masculina-1.jpg',
                'category_id' => $masculino->id,
            ],
            [
                'name' => 'Pantalón Jeans Clásico',
                'description' => 'Jeans ajustados color azul oscuro. Comodidad y estilo en un solo pantalón.',
                'price' => 79.99,
                'stock' => 30,
                'image_url' => 'jeans-masculino-1.jpg',
                'category_id' => $masculino->id,
            ],
            [
                'name' => 'Chaqueta Deportiva',
                'description' => 'Chaqueta ligera para actividades deportivas. Ideal para entrenamientos y uso casual.',
                'price' => 89.99,
                'stock' => 25,
                'image_url' => 'chaqueta-deportiva.jpg',
                'category_id' => $masculino->id,
            ],

            // PRODUCTOS FEMENINO
            [
                'name' => 'Vestido Floral Verano',
                'description' => 'Vestido ligero con estampado floral. Perfecto para los días cálidos de verano.',
                'price' => 59.99,
                'stock' => 40,
                'image_url' => 'vestido-floral.jpg',
                'category_id' => $femenino->id,
            ],
            [
                'name' => 'Blusa Seda Natural',
                'description' => 'Blusa de seda natural color pastel. Elegancia y comodidad en una prenda única.',
                'price' => 45.99,
                'stock' => 35,
                'image_url' => 'blusa-seda.jpg',
                'category_id' => $femenino->id,
            ],
            [
                'name' => 'Falda Tableada',
                'description' => 'Falda tableada midi color negro. Versátil y elegante para cualquier ocasión.',
                'price' => 39.99,
                'stock' => 28,
                'image_url' => 'falda-tableada.jpg',
                'category_id' => $femenino->id,
            ],

            // PRODUCTOS BLANCOS
            [
                'name' => 'Juego de Sábanas Algodón',
                'description' => 'Juego de sábanas 100% algodón egipcio. Suavidad y calidad para tus noches de descanso.',
                'price' => 89.99,
                'stock' => 20,
                'image_url' => 'sabanas-algodon.jpg',
                'category_id' => $blancos->id,
            ],
            [
                'name' => 'Toallas Baño Premium',
                'description' => 'Set de toallas de baño extra suaves. Absorción máxima y durabilidad garantizada.',
                'price' => 69.99,
                'stock' => 15,
                'image_url' => 'toallas-premium.jpg',
                'category_id' => $blancos->id,
            ],
            [
                'name' => 'Cubrelecho Decorativo',
                'description' => 'Cubrelecho tejido diseño moderno. Transforma tu dormitorio con estilo y elegancia.',
                'price' => 120.99,
                'stock' => 12,
                'image_url' => 'cubrelecho-decorativo.jpg',
                'category_id' => $blancos->id,
            ],

            // PRODUCTOS LENCERÍA
            [
                'name' => 'Conjunto Encaje Negro',
                'description' => 'Conjunto de encaje negro premium. Diseño sensual y cómodo para ocasiones especiales.',
                'price' => 35.99,
                'stock' => 18,
                'image_url' => 'conjunto-encaje.jpg',
                'category_id' => $lenceria->id,
            ],
            [
                'name' => 'Body Sensual Rojo',
                'description' => 'Body ajustable color rojo pasión. Perfecto para realzar tu figura con estilo.',
                'price' => 42.99,
                'stock' => 22,
                'image_url' => 'body-rojo.jpg',
                'category_id' => $lenceria->id,
            ],
            [
                'name' => 'Pijama Seda Comfort',
                'description' => 'Pijama de seda para máxima comodidad. Disfruta de noches de sueño plácidas y elegantes.',
                'price' => 55.99,
                'stock' => 16,
                'image_url' => 'pijama-seda.jpg',
                'category_id' => $lenceria->id,
            ],

            // PRODUCTOS NOVEDADES
            [
                'name' => 'Abrigo Tweed Moderno',
                'description' => 'Novedad: Abrigo de tweed diseño contemporáneo. Última tendencia en abrigos de temporada.',
                'price' => 149.99,
                'stock' => 10,
                'image_url' => 'abrigo-tweed.jpg',
                'category_id' => $novedades->id,
            ],
            [
                'name' => 'Zapatos Ecológicos',
                'description' => 'Nuevos zapatos fabricados con materiales reciclados. Moda sostenible y consciente.',
                'price' => 99.99,
                'stock' => 8,
                'image_url' => 'zapatos-ecologicos.jpg',
                'category_id' => $novedades->id,
            ],

            // PRODUCTOS OUTLET
            [
                'name' => 'Chaquetón Invierno Oferta',
                'description' => 'Chaquetón de invierno - última temporada. Oferta especial por cambio de temporada.',
                'price' => 59.99,
                'stock' => 5,
                'image_url' => 'chaqueton-oferta.jpg',
                'category_id' => $outlet->id,
            ],
            [
                'name' => 'Vestido Gala Outlet',
                'description' => 'Vestido de gala - modelo discontinuado. Oportunidad única a precio especial.',
                'price' => 39.99,
                'stock' => 3,
                'image_url' => 'vestido-gala-outlet.jpg',
                'category_id' => $outlet->id,
            ]
        ];

        foreach ($products as $productData) {
            Product::create(array_merge($productData, [
                'slug' => Str::slug($productData['name'])
            ]));
        }
    }
}
