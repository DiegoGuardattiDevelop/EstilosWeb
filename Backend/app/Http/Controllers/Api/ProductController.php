<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product; // Importa el modelo Product
use App\Models\Category; // Importa el modelo Category para los filtros
use Illuminate\Http\Request;

class ProductController extends Controller
{
    /**
     * Display a listing of the resource (all products with filters, search, and pagination).
     */
    public function index(Request $request)
    {
        // Inicia la consulta de productos e incluye la relación con la categoría
        // Esto evita el problema de "N+1 queries" cuando accedes a category.name en el frontend
        $query = Product::with('category'); 

        // --- Filtros ---

        // 1. Filtrar por categoría (usando el slug de la categoría)
        if ($request->has('category_slug')) {
            $categorySlug = $request->input('category_slug');
            $category = Category::where('slug', $categorySlug)->first();

            if ($category) {
                // Si la categoría existe, aplica el filtro por category_id
                $query->where('category_id', $category->id);
            } else {
                // Si el slug de categoría no existe, devolvemos una respuesta vacía
                // Esto evita errores y le indica al frontend que no hay productos para ese slug.
                return response()->json(['data' => [], 'current_page' => 1, 'last_page' => 1, 'total' => 0], 200);
            }
        }

        // 2. Filtrar por término de búsqueda (en nombre o descripción del producto)
        if ($request->has('search')) {
            $searchTerm = $request->input('search');
            $query->where(function ($q) use ($searchTerm) {
                $q->where('name', 'like', '%' . $searchTerm . '%')
                ->orWhere('description', 'like', '%' . $searchTerm . '%');
            });
        }

        // 3. Filtrar por rango de precios
        if ($request->has('min_price')) {
            $query->where('price', '>=', $request->input('min_price'));
        }
        if ($request->has('max_price')) {
            $query->where('price', '<=', $request->input('max_price'));
        }

        // --- Ordenamiento ---
        // 'sort_by': campo por el cual ordenar (ej. 'name', 'price', 'created_at', 'stock')
        // 'sort_order': orden ('asc' para ascendente, 'desc' para descendente)
        $sortBy = $request->input('sort_by', 'created_at'); // Por defecto, ordenar por fecha de creación
        $sortOrder = $request->input('sort_order', 'desc'); // Por defecto, descendente

        // Validamos que el campo de ordenamiento sea uno permitido para evitar inyección SQL
        $allowedSorts = ['name', 'price', 'created_at', 'stock'];
        if (!in_array($sortBy, $allowedSorts)) {
            $sortBy = 'created_at'; // Si el campo no es válido, vuelve al default
        }

        $query->orderBy($sortBy, $sortOrder);

        // --- Paginación ---
        // 'per_page': cantidad de productos por página
        $perPage = $request->input('per_page', 10); // Por defecto, 10 productos por página
        // Limita el máximo de productos por página para evitar solicitudes excesivas
        $perPage = min($perPage, 50); // Puedes ajustar este límite según tus necesidades

        $products = $query->paginate($perPage);

        // Retorna la colección de productos paginados como JSON.
        // Laravel's paginate() ya devuelve una estructura JSON amigable
        // con metadatos de paginación (current_page, last_page, total, etc.)
        return response()->json($products);
    }

    /**
     * Store a newly created resource in storage.
     * Puedes implementar esto más adelante si necesitas una API para crear productos.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     * Puedes implementar esto para obtener un producto individual por su slug o ID.
     */
    public function showBySlug($slug)
    {
        $product = Product::where('slug', $slug)
            ->with('category') // Carga la relación de categoría
            ->firstOrFail(); // Devuelve 404 si no encuentra el producto

        return response()->json([
            'success' => true,
            'data' => $product
        ]);
    }

    /**
     * Update the specified resource in storage.
     * Puedes implementar esto si necesitas una API para actualizar productos.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     * Puedes implementar esto si necesitas una API para eliminar productos.
     */
    public function destroy(string $id)
    {
        //
    }
}