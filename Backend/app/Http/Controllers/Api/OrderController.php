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
        try {
            $user = $request->user();

            // Validar datos de entrada
            $validated = $request->validate([
                'address' => 'required|array',
                'address.fullName' => 'required|string|min:3',
                'address.email' => 'required|email',
                'address.phone' => 'required|string',
                'address.street' => 'required|string',
                'address.city' => 'required|string',
                'address.state' => 'required|string',
                'address.zipCode' => 'required|string',
                'address.country' => 'required|string',
                'address.notes' => 'nullable|string',
                'shipping' => 'required|array',
                'shipping.id' => 'required|integer',
                'shipping.name' => 'required|string',
                'shipping.price' => 'required|numeric',
                'shipping.estimatedDays' => 'required|integer',
                'items' => 'required|array|min:1',
                'items.*.product_id' => 'required|integer',
                'items.*.product_name' => 'required|string',
                'items.*.quantity' => 'required|integer|min:1',
                'items.*.price' => 'required|numeric|min:0',
                'total' => 'required|numeric|min:0'
            ]);

            // Crear la orden
            $order = new Order();
            $order->user_id = $user->id;
            $order->order_number = 'ORD-' . strtoupper(uniqid());
            $order->status = 'pending';
            $order->total_amount = $validated['total'];
            $order->shipping_address = json_encode($validated['address']);
            $order->shipping_method = json_encode($validated['shipping']);
            $order->save();

            // Guardar los items de la orden
            $orderItems = [];
            foreach ($validated['items'] as $item) {
                // Obtener el SKU del producto desde la base de datos
                $product = \App\Models\Product::find($item['product_id']);
                $sku = $product ? $product->sku : null;

                $orderItems[] = [
                    'order_id' => $order->id,
                    'product_id' => $item['product_id'],
                    'product_name' => $item['product_name'],
                    'sku' => $sku,
                    'quantity' => $item['quantity'],
                    'price' => $item['price'],
                    'total' => $item['price'] * $item['quantity'],
                    'created_at' => now(),
                    'updated_at' => now()
                ];
            }

            // Insertar items en la base de datos
            \Illuminate\Support\Facades\DB::table('order_items')->insert($orderItems);

            return response()->json([
                'success' => true,
                'order' => [
                    'id' => $order->id,
                    'order_number' => $order->order_number,
                    'status' => $order->status,
                    'total_amount' => $order->total_amount,
                    'created_at' => $order->created_at->toISOString()
                ]
            ], 201);
        } catch (\Exception $e) {
            Log::error('Error al crear orden: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error al crear la orden',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Request $request, string $id)
    {
        try {
            $order = Order::where('id', $id)
                ->orWhere('order_number', $id)
                ->with(['items'])
                ->first();

            if (!$order) {
                return response()->json([
                    'success' => false,
                    'message' => 'Orden no encontrada'
                ], 404);
            }

            // Verificar si el usuario tiene permiso para ver esta orden
            $user = $request->user();
            if ($user && $user->id !== $order->user_id && !$user->is_admin) {
                return response()->json([
                    'success' => false,
                    'message' => 'No autorizado para ver esta orden'
                ], 403);
            }

            return response()->json([
                'success' => true,
                'order' => [
                    'id' => $order->id,
                    'order_number' => $order->order_number,
                    'status' => $order->status,
                    'status_text' => $this->getStatusText($order->status),
                    'total_amount' => (float) $order->total_amount,
                    'shipping_address' => json_decode($order->shipping_address),
                    'shipping_method' => json_decode($order->shipping_method),
                    'created_at' => $order->created_at->toISOString(),
                    'updated_at' => $order->updated_at->toISOString(),
                    'items' => $order->items->map(function ($item) {
                        return [
                            'id' => $item->id,
                            'product_name' => $item->product_name,
                            'sku' => $item->sku,
                            'quantity' => (int) $item->quantity,
                            'price' => (float) $item->price,
                            'total' => (float) $item->total
                        ];
                    })->toArray()
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Error al obtener orden: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener la orden'
            ], 500);
        }
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
