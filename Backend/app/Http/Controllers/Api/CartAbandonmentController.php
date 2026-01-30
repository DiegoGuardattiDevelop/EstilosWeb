<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Models\CartAbandonment;

class CartAbandonmentController extends Controller
{
    /**
     * Registra un carrito abandonado
     */
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'email' => 'required|email',
                'cartItems' => 'required|array',
                'checkoutStep' => 'required|integer',
                'timestamp' => 'required|date',
            ]);

            // Verificar si ya existe un registro reciente para este email
            $existingAbandonment = CartAbandonment::where('email', $validated['email'])
                ->where('created_at', '>', now()->subHours(1))
                ->first();

            if ($existingAbandonment) {
                // Actualizar el registro existente
                $existingAbandonment->update([
                    'checkout_step' => $validated['checkoutStep'],
                    'cart_items' => json_encode($validated['cartItems']),
                    'abandoned_at' => $validated['timestamp'],
                ]);

                return response()->json([
                    'success' => true,
                    'message' => 'Carrito abandonado actualizado',
                    'discount_code' => $this->generateDiscountCode($validated['email']),
                ]);
            }

            // Crear nuevo registro
            $abandonment = CartAbandonment::create([
                'email' => $validated['email'],
                'cart_items' => json_encode($validated['cartItems']),
                'checkout_step' => $validated['checkoutStep'],
                'abandoned_at' => $validated['timestamp'],
                'sent_reminder' => false,
            ]);

            Log::info('Carrito abandonado registrado', [
                'email' => $validated['email'],
                'checkout_step' => $validated['checkoutStep'],
            ]);

            // Generar código de descuento de recuperación
            $discountCode = $this->generateDiscountCode($validated['email']);

            return response()->json([
                'success' => true,
                'message' => 'Carrito abandonado registrado',
                'discount_code' => $discountCode,
            ]);
        } catch (\Exception $e) {
            Log::error('Error al registrar carrito abandonado: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Error al procesar la solicitud',
            ], 500);
        }
    }

    /**
     * Genera un código de descuento para recuperación
     */
    private function generateDiscountCode(string $email): string
    {
        $hash = md5($email . now());
        return 'RECUPERA' . strtoupper(substr($hash, 0, 6));
    }

    /**
     * Obtiene carritos abandonados para enviar recordatorios
     */
    public function getAbandonedCarts()
    {
        try {
            $abandonedCarts = CartAbandonment::where('sent_reminder', false)
                ->where('created_at', '<', now()->subHours(1))
                ->where('created_at', '>', now()->subHours(24))
                ->get();

            return response()->json([
                'success' => true,
                'data' => $abandonedCarts,
            ]);
        } catch (\Exception $e) {
            Log::error('Error al obtener carritos abandonados: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Error al procesar la solicitud',
            ], 500);
        }
    }

    /**
     * Marca un carrito como enviado el recordatorio
     */
    public function markAsNotified(Request $request)
    {
        try {
            $validated = $request->validate([
                'id' => 'required|exists:cart_abandonments,id',
            ]);

            CartAbandonment::where('id', $validated['id'])
                ->update(['sent_reminder' => true]);

            return response()->json([
                'success' => true,
                'message' => 'Carrito marcado como notificado',
            ]);
        } catch (\Exception $e) {
            Log::error('Error al marcar carrito como notificado: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Error al procesar la solicitud',
            ], 500);
        }
    }
}
