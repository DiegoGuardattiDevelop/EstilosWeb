<?php
// app/Http/Controllers/FooterController.php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class FooterController extends Controller
{
    /**
     * Obtener los datos del footer - VERSIÓN SIMPLIFICADA
     */
    public function getFooterData(): JsonResponse
    {
        // Datos estáticos - sin consultas a BD
        $footerData = [
            'companyInfo' => [
                'name' => 'Tu Empresa',
                'description' => 'Soluciones innovadoras y de calidad',
                'phone' => '+1 234 567 890',
                'email' => 'info@empresa.com',
                'address' => 'Calle Principal #123'
            ],
            'socialLinks' => [
                ['name' => 'Facebook', 'url' => '#', 'icon' => 'fab fa-facebook-f'],
                ['name' => 'Twitter', 'url' => '#', 'icon' => 'fab fa-twitter'],
                ['name' => 'Instagram', 'url' => '#', 'icon' => 'fab fa-instagram'],
                ['name' => 'LinkedIn', 'url' => '#', 'icon' => 'fab fa-linkedin-in']
            ],
            'quickLinks' => [
                ['name' => 'Inicio', 'route' => '/', 'icon' => 'fas fa-home'],
                ['name' => 'Quiénes Somos', 'route' => '/about', 'icon' => 'fas fa-info-circle'],
                ['name' => 'Servicios', 'route' => '/services', 'icon' => 'fas fa-concierge-bell'],
                ['name' => 'Contacto', 'route' => '/contact', 'icon' => 'fas fa-envelope']
            ]
        ];

        return response()->json($footerData);
    }
}
