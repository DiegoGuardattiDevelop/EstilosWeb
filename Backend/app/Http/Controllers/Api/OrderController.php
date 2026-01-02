<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Order; // ← Ya lo tienes, está bien
use Illuminate\Support\Facades\Log;

class OrderController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }

    /**
     * Historial de pedidos del usuario
     */
    public function history(Request $request)
    {
        try {
            $user = $request->user();

            // Usar datos reales ahora que tenemos la estructura
            $orders = Order::where('user_id', $user->id)
                ->with(['items']) // Cargar items si existen
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(function ($order) {
                    return [
                        'id' => $order->id,
                        'order_number' => $order->order_number,
                        'status' => $order->status,
                        'status_text' => $this->getStatusText($order->status),
                        'total_amount' => (float) $order->total_amount,
                        'created_at' => $order->created_at->toISOString(),
                        'updated_at' => $order->updated_at->toISOString(),
                        'items' => $order->items->map(function ($item) {
                            return [
                                'id' => $item->id,
                                'product_name' => $item->product_name,
                                'quantity' => (int) $item->quantity,
                                'price' => (float) $item->price,
                                'total' => (float) $item->total
                            ];
                        })->toArray()
                    ];
                });

            return response()->json([
                'success' => true,
                'orders' => $orders,
                'total_orders' => $orders->count()
            ]);
        } catch (\Exception $e) {
            Log::error('Error en orders history: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener el historial de pedidos'
            ], 500);
        }
    }

    private function getStatusText($status)
    {
        $statuses = [
            'pending' => 'Pendiente',
            'confirmed' => 'Confirmado',
            'processing' => 'Procesando',
            'shipped' => 'Enviado',
            'delivered' => 'Entregado',
            'cancelled' => 'Cancelado'
        ];
        return $statuses[$status] ?? $status;
    }
}
