<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

// Ruta para servir imágenes con CORS
Route::get('/storage/{path}', function ($path) {
    $fullPath = storage_path('app/public/' . $path);

    if (!file_exists($fullPath)) {
        abort(404);
    }

    return response()->file($fullPath, [
        'Access-Control-Allow-Origin' => 'http://localhost:8000',
        'Access-Control-Allow-Methods' => 'GET, OPTIONS',
        'Access-Control-Allow-Headers' => 'Content-Type',
        'Cache-Control' => 'public, max-age=3600'
    ]);
})->where('path', '.*');
