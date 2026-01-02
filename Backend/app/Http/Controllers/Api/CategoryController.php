<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category; // Importa tu modelo Category
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException; // Para manejar errores de validación
use Illuminate\Support\Str; // <-- ¡Importar Str para generar slugs!

class CategoryController extends Controller
{
    /**
     * Muestra una lista de todas las categorías.
     */
    public function index()
    {
        // Devuelve todas las categorías de la base de datos
        return response()->json(Category::all());
    }

    /**
     * Almacena una nueva categoría en la base de datos.
     */
    public function store(Request $request)
    {
        try {
            // Valida los datos de entrada
            $validatedData = $request->validate([
                'name' => 'required|string|max:255|unique:categories,name',
                // Nuevas reglas para slug y descripciones
                'slug' => 'nullable|string|max:255|unique:categories,slug', // Slug puede ser opcional al crear, lo generamos si no viene
                'description_short' => 'nullable|string|max:255', // Ajusta el max si es necesario
                'description_long' => 'nullable|string', // 'text' no tiene max, usa solo string
                // Campos existentes
                'image_url' => 'nullable|url|max:255',
                'color' => 'nullable|string|max:7', // Ejemplo: #RRGGBB
                'text_color' => 'nullable|string|max:7', // Ejemplo: #RRGGBB
            ]);

            // Generar slug si no se proporciona (o para asegurar unicidad/formato)
            // Esto es importante si el frontend no siempre envía el slug
            if (empty($validatedData['slug'])) {
                $validatedData['slug'] = Str::slug($validatedData['name']);
            }

            // Crea la categoría usando los datos validados
            $category = Category::create($validatedData);

            // Devuelve la categoría creada con un código de estado 201 (Created)
            return response()->json($category, 201);

        } catch (ValidationException $e) {
            // Maneja errores de validación
            return response()->json([
                'message' => 'Validation Error',
                'errors' => $e->errors()
            ], 422); // Código 422 para errores de validación
        } catch (\Exception $e) {
            // Maneja cualquier otro tipo de error
            return response()->json([
                'message' => 'Error creating category',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Muestra una categoría específica por ID.
     */
    public function show(Category $category) // Inyección de modelo para encontrar la categoría automáticamente
    {
        return response()->json($category);
    }

    /**
     * Actualiza una categoría existente.
     */
    public function update(Request $request, Category $category)
    {
        try {
            // Valida los datos de entrada (unique ignora la categoría actual)
            $validatedData = $request->validate([
                'name' => 'required|string|max:255|unique:categories,name,' . $category->id,
                // Nuevas reglas para slug y descripciones
                // El slug debe ser único, pero ignorando la categoría actual
                'slug' => 'nullable|string|max:255|unique:categories,slug,' . $category->id, 
                'description_short' => 'nullable|string|max:255',
                'description_long' => 'nullable|string',
                // Campos existentes
                'image_url' => 'nullable|url|max:255',
                'color' => 'nullable|string|max:7',
                'text_color' => 'nullable|string|max:7',
            ]);

            // Regenerar slug si el nombre cambia y el slug no se envía, o si se envió vacío
            // Solo si el nombre en la request es diferente al actual del modelo
            if ($request->has('name') && $request->input('name') !== $category->name) {
                // Si el slug no se envió o se envió vacío, lo generamos
                if (empty($validatedData['slug'])) {
                    $validatedData['slug'] = Str::slug($validatedData['name']);
                }
            }


            // Eliminar el campo 'description' si ya no se usa, para evitar conflictos
            // Si tu base de datos todavía tiene una columna 'description' aparte de short/long
            // y no quieres que se actualice con un valor que no llega.
            unset($validatedData['description']); // Asegúrate de que esta línea esté si el campo 'description' antiguo está causando problemas

            // Actualiza la categoría
            $category->update($validatedData);

            // Devuelve la categoría actualizada
            return response()->json($category);

        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Validation Error',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error updating category',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Elimina una categoría de la base de datos.
     */
    public function destroy(Category $category)
    {
        $category->delete();

        // Devuelve una respuesta vacía con código 204 (No Content)
        return response()->json(null, 204);
    }
}