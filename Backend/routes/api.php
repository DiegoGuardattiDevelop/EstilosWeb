<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\CartController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\FooterController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\MercadoPagoController;
use App\Http\Controllers\Api\ShippingController;
use App\Http\Controllers\Api\CartAbandonmentController;

Route::apiResource('categories', CategoryController::class);
Route::apiResource('products', ProductController::class);
Route::get('products/slug/{slug}', [ProductController::class, 'showBySlug']);

Route::post('register', [AuthController::class, 'register']);
Route::post('login', [AuthController::class, 'login']);

Route::get('/footer-data', [FooterController::class, 'getFooterData']);

// Carrito abandonado (sin autenticación requerida)
Route::post('/cart-abandonment', [CartAbandonmentController::class, 'store']);
Route::get('/cart-abandonment', [CartAbandonmentController::class, 'getAbandonedCarts']);
Route::post('/cart-abandonment/notify', [CartAbandonmentController::class, 'markAsNotified']);

// Webhooks (sin autenticación)
Route::post('/mercadopago/webhook', [MercadoPagoController::class, 'webhook']);

Route::middleware('auth:sanctum')->group(function () {

    // Carrito
    Route::get('/cart', [CartController::class, 'index']);
    Route::post('/cart', [CartController::class, 'store']);
    Route::put('/cart/{id}', [CartController::class, 'update']);
    Route::delete('/cart/{id}', [CartController::class, 'destroy']);
    Route::delete('/cart', [CartController::class, 'clear']);
    Route::post('/cart/sync', [CartController::class, 'sync']);
    // Pedidos
    Route::post('orders', [OrderController::class, 'store']);
    Route::get('orders', [OrderController::class, 'index']);
    Route::get('orders/{id}', [OrderController::class, 'show']);
    Route::get('orders/history', [OrderController::class, 'history']);
    Route::get('/profile', [AuthController::class, 'profile']);
    Route::post('/logout', [AuthController::class, 'logout']);

    // Pagos Stripe
    Route::post('/create-payment-intent', [PaymentController::class, 'createPaymentIntent']);
    Route::post('/confirm-payment', [PaymentController::class, 'confirmPayment']);

    // Pagos Mercado Pago
    Route::post('/mercadopago/preference', [MercadoPagoController::class, 'createPreference']);
    Route::post('/mercadopago/payment', [MercadoPagoController::class, 'confirmPayment']);
    Route::get('/mercadopago/payment-status/{paymentId}', [MercadoPagoController::class, 'getPaymentStatus']);

    // Envío
    Route::get('/shipping-methods', [ShippingController::class, 'getShippingMethods']);
    Route::post('/calculate-shipping', [ShippingController::class, 'calculateShippingCost']);
});
