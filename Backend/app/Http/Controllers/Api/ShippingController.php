<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class ShippingController extends Controller
{
    /**
     * Obtener métodos de envío disponibles
     */
    public function getShippingMethods(Request $request)
    {
        try {
            // Validar datos de entrada
            $validated = $request->validate([
                'country' => 'sometimes|string|max:2',
                'state' => 'sometimes|string|max:50',
                'city' => 'sometimes|string|max:50',
                'zipCode' => 'sometimes|string|max:20',
                'cartTotal' => 'sometimes|numeric|min:0'
            ]);

            // Lógica para obtener métodos de envío dinámicos
            // En una implementación real, esto vendría de una base de datos o API de logística
            $shippingMethods = $this->calculateShippingMethods($validated);

            return response()->json([
                'success' => true,
                'shippingMethods' => $shippingMethods
            ]);
        } catch (\Exception $e) {
            Log::error('Error al obtener métodos de envío: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener métodos de envío',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Calcular métodos de envío basados en la ubicación y total del carrito
     */
    private function calculateShippingMethods(array $data): array
    {
        // Valores base de envío
        $baseStandard = 50; // Envío estándar base
        $baseExpress = 150; // Envío express base
        $baseOvernight = 250; // Envío nocturno base

        // Ajustar costos según la ubicación (ejemplo simplificado)
        $locationFactor = 1.0;

        if (isset($data['country']) && $data['country'] === 'MX') {
            $locationFactor = 1.0; // México
        } elseif (isset($data['country']) && $data['country'] === 'CO') {
            $locationFactor = 1.2; // Colombia
        } elseif (isset($data['country']) && $data['country'] === 'AR') {
            $locationFactor = 1.3; // Argentina
        }

        // Ajustar según el total del carrito (envío gratuito para pedidos grandes)
        $freeShippingThreshold = 500; // Umbral para envío gratuito
        $cartTotal = $data['cartTotal'] ?? 0;

        $methods = [];

        // Envío Estándar (5-7 días)
        $standardCost = $cartTotal >= $freeShippingThreshold ? 0 : $baseStandard * $locationFactor;
        $methods[] = [
            'id' => 'standard',
            'name' => 'Envío Estándar',
            'description' => '5-7 días hábiles',
            'cost' => round($standardCost, 2),
            'estimatedDays' => 7,
            'isFree' => $standardCost === 0
        ];

        // Envío Express (2-3 días)
        $expressCost = $cartTotal >= $freeShippingThreshold ? 0 : $baseExpress * $locationFactor;
        $methods[] = [
            'id' => 'express',
            'name' => 'Envío Express',
            'description' => '2-3 días hábiles',
            'cost' => round($expressCost, 2),
            'estimatedDays' => 3,
            'isFree' => $expressCost === 0
        ];

        // Envío Nocturno (1 día)
        $overnightCost = $cartTotal >= $freeShippingThreshold ? 0 : $baseOvernight * $locationFactor;
        $methods[] = [
            'id' => 'overnight',
            'name' => 'Envío Nocturno',
            'description' => 'Entrega al día siguiente',
            'cost' => round($overnightCost, 2),
            'estimatedDays' => 1,
            'isFree' => $overnightCost === 0
        ];

        return $methods;
    }

    /**
     * Calcular costo de envío para un método específico
     */
    public function calculateShippingCost(Request $request)
    {
        try {
            $validated = $request->validate([
                'shippingMethod' => 'required|string|in:standard,express,overnight',
                'country' => 'required|string|max:2',
                'state' => 'sometimes|string|max:50',
                'city' => 'sometimes|string|max:50',
                'zipCode' => 'sometimes|string|max:20',
                'cartTotal' => 'required|numeric|min:0'
            ]);

            $shippingMethods = $this->calculateShippingMethods($validated);
            $selectedMethod = collect($shippingMethods)->firstWhere('id', $validated['shippingMethod']);

            if (!$selectedMethod) {
                return response()->json([
                    'success' => false,
                    'message' => 'Método de envío no válido'
                ], 400);
            }

            return response()->json([
                'success' => true,
                'shippingCost' => $selectedMethod['cost'],
                'estimatedDays' => $selectedMethod['estimatedDays'],
                'isFree' => $selectedMethod['isFree']
            ]);
        } catch (\Exception $e) {
            Log::error('Error al calcular costo de envío: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error al calcular costo de envío',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
