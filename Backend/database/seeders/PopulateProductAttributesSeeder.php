<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Product;
use Illuminate\Support\Str;

class PopulateProductAttributesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Definir algunas marcas, talles y colores comunes para ropa
        $brands = ['Nike', 'Adidas', 'Puma', 'Levi\'s', 'Zara', 'H&M', 'Uniqlo', 'Gap', 'Tommy Hilfiger', 'Calvin Klein'];
        $sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
        $colors = ['Negro', 'Blanco', 'Rojo', 'Azul', 'Verde', 'Amarillo', 'Gris', 'Marron'];

        // Obtener todos los productos
        $products = Product::all();

        foreach ($products as $product) {
            // Asignar atributos aleatorios pero consistentes basado en el ID del producto
            $brandIndex = ($product->id - 1) % count($brands);
            $sizeIndex = (($product->id - 1) / count($brands)) % count($sizes);
            $colorIndex = (($product->id - 1) / (count($brands) * count($sizes))) % count($colors);

            $brand = $brands[$brandIndex];
            $size = $sizes[$sizeIndex];
            $color = $colors[$colorIndex];

            // Generar SKU único basado en marca, talle, color y ID
            $sku = strtoupper(Str::substr($brand, 0, 3)) . '-' .
                strtoupper($size) . '-' .
                strtoupper(Str::substr($color, 0, 3)) . '-' .
                str_pad($product->id, 4, '0', STR_PAD_LEFT);

            // Actualizar el producto
            $product->update([
                'brand' => $brand,
                'size' => $size,
                'color' => $color,
                'sku' => $sku
            ]);

            echo "Actualizado producto {$product->id}: {$product->name} -> SKU: {$sku}, Marca: {$brand}, Talle: {$size}, Color: {$color}\n";
        }
    }
}
