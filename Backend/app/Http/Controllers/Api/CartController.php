<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\CartItem;
use App\Models\Product;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log; // ← Ya está importado, usa Log:: en lugar de \Log::

class CartController extends Controller
{
    /**
     * Obtener el carrito del usuario
     */
    public function index(Request $request)
    {
        try {
            $user = $request->user();

            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Autenticación requerida'
                ], 401);
            }

            $cartItems = CartItem::with('product')
                ->where('user_id', $user->id)
                ->get();

            $total = $cartItems->sum(function ($item) {
                return $item->product->price * $item->quantity;
            });

            return response()->json([
                'success' => true,
                'cart_items' => $cartItems->map(function ($item) {
                    return [
                        'id' => $item->id,
                        'product' => [
                            'id' => $item->product->id,
                            'name' => $item->product->name,
                            'price' => $item->product->price,
                            'image_url' => $item->product->image_url,
                            'stock' => $item->product->stock
                        ],
                        'quantity' => $item->quantity,
                        'subtotal' => $item->product->price * $item->quantity
                    ];
                }),
                'total' => $total,
                'items_count' => $cartItems->sum('quantity')
            ]);
        } catch (\Exception $e) {
            Log::error('Error getting cart: ' . $e->getMessage()); // ← Cambiado a Log::
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener el carrito'
            ], 500);
        }
    }

    /**
     * Agregar producto al carrito
     */
    public function store(Request $request)
    {
        try {
            $request->validate([
                'product_id' => 'required|exists:products,id',
                'quantity' => 'required|integer|min:1|max:10'
            ]);

            $user = $request->user();
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Autenticación requerida'
                ], 401);
            }

            $productId = $request->product_id;
            $quantity = $request->quantity;

            // Verificar stock del producto
            $product = Product::findOrFail($productId);
            if ($product->stock < $quantity) {
                return response()->json([
                    'success' => false,
                    'message' => 'Stock insuficiente. Stock disponible: ' . $product->stock
                ], 400);
            }

            // Buscar item existente
            $existingItem = CartItem::where('user_id', $user->id)
                ->where('product_id', $productId)
                ->first();

            if ($existingItem) {
                // Actualizar cantidad existente
                $newQuantity = $existingItem->quantity + $quantity;

                if ($product->stock < $newQuantity) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Stock insuficiente. Stock disponible: ' . $product->stock
                    ], 400);
                }

                $existingItem->update(['quantity' => $newQuantity]);
                $cartItem = $existingItem;
            } else {
                // Crear nuevo item
                $cartItem = CartItem::create([
                    'user_id' => $user->id,
                    'product_id' => $productId,
                    'quantity' => $quantity
                ]);
            }

            $cartItem->load('product');

            return response()->json([
                'success' => true,
                'message' => 'Producto agregado al carrito',
                'cart_item' => [
                    'id' => $cartItem->id,
                    'product' => [
                        'id' => $cartItem->product->id,
                        'name' => $cartItem->product->name,
                        'price' => $cartItem->product->price,
                        'image_url' => $cartItem->product->image_url
                    ],
                    'quantity' => $cartItem->quantity,
                    'subtotal' => $cartItem->product->price * $cartItem->quantity
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Error adding to cart: ' . $e->getMessage()); // ← Cambiado a Log::
            return response()->json([
                'success' => false,
                'message' => 'Error al agregar producto al carrito'
            ], 500);
        }
    }

    /**
     * Actualizar cantidad de un producto en el carrito
     */
    public function update(Request $request, $id)
    {
        try {
            $request->validate([
                'quantity' => 'required|integer|min:1|max:10'
            ]);

            $user = $request->user();
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Autenticación requerida'
                ], 401);
            }

            $quantity = $request->quantity;

            $cartItem = CartItem::with('product')
                ->where('id', $id)
                ->where('user_id', $user->id)
                ->firstOrFail();

            // Verificar stock
            if ($cartItem->product->stock < $quantity) {
                return response()->json([
                    'success' => false,
                    'message' => 'Stock insuficiente. Stock disponible: ' . $cartItem->product->stock
                ], 400);
            }

            $cartItem->update(['quantity' => $quantity]);

            return response()->json([
                'success' => true,
                'message' => 'Cantidad actualizada',
                'cart_item' => [
                    'id' => $cartItem->id,
                    'product' => [
                        'id' => $cartItem->product->id,
                        'name' => $cartItem->product->name,
                        'price' => $cartItem->product->price,
                        'image_url' => $cartItem->product->image_url
                    ],
                    'quantity' => $cartItem->quantity,
                    'subtotal' => $cartItem->product->price * $cartItem->quantity
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Error updating cart item: ' . $e->getMessage()); // ← Cambiado a Log::
            return response()->json([
                'success' => false,
                'message' => 'Error al actualizar el carrito'
            ], 500);
        }
    }

    /**
     * Eliminar producto del carrito
     */
    public function destroy(Request $request, $id)
    {
        try {
            $user = $request->user();
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Autenticación requerida'
                ], 401);
            }

            $cartItem = CartItem::where('id', $id)
                ->where('user_id', $user->id)
                ->firstOrFail();
            $cartItem->delete();

            return response()->json([
                'success' => true,
                'message' => 'Producto eliminado del carrito'
            ]);
        } catch (\Exception $e) {
            Log::error('Error removing from cart: ' . $e->getMessage()); // ← Cambiado a Log::
            return response()->json([
                'success' => false,
                'message' => 'Error al eliminar producto del carrito'
            ], 500);
        }
    }

    /**
     * Vaciar carrito
     */
    public function clear(Request $request)
    {
        try {
            $user = $request->user();
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Autenticación requerida'
                ], 401);
            }

            CartItem::where('user_id', $user->id)->delete();

            return response()->json([
                'success' => true,
                'message' => 'Carrito vaciado'
            ]);
        } catch (\Exception $e) {
            Log::error('Error clearing cart: ' . $e->getMessage()); // ← Cambiado a Log::
            return response()->json([
                'success' => false,
                'message' => 'Error al vaciar el carrito'
            ], 500);
        }
    }

    /**
     * Sincronizar carrito local con el servidor (al hacer login)
     */
    public function sync(Request $request)
    {
        try {
            $user = $request->user();
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Autenticación requerida'
                ], 401);
            }

            $localCart = $request->input('local_cart', []);
            if (!is_array($localCart)) {
                return response()->json([
                    'success' => false,
                    'message' => 'El campo local_cart debe ser un array'
                ], 400);
            }

            DB::transaction(function () use ($user, $localCart) {
                // Obtener carrito actual del servidor
                $serverCart = CartItem::where('user_id', $user->id)->get();

                // Para cada item del carrito local
                foreach ($localCart as $localItem) {
                    // Validar estructura del item
                    if (!isset($localItem['product_id']) || !isset($localItem['quantity'])) {
                        throw new \Exception('Estructura de item local inválida');
                    }

                    $existingItem = $serverCart->where('product_id', $localItem['product_id'])->first();

                    if ($existingItem) {
                        // Actualizar cantidad (usar la mayor)
                        $newQuantity = max($existingItem->quantity, $localItem['quantity']);
                        $existingItem->update(['quantity' => $newQuantity]);
                    } else {
                        // Crear nuevo item
                        CartItem::create([
                            'user_id' => $user->id,
                            'product_id' => $localItem['product_id'],
                            'quantity' => $localItem['quantity']
                        ]);
                    }
                }
            });

            return response()->json([
                'success' => true,
                'message' => 'Carrito sincronizado'
            ]);
        } catch (\Exception $e) {
            Log::error('Error syncing cart: ' . $e->getMessage(), ['trace' => $e->getTraceAsString()]);
            return response()->json([
                'success' => false,
                'message' => 'Error al sincronizar el carrito'
            ], 500);
        }
    }
}
