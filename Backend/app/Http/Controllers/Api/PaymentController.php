<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Stripe\Stripe;
use Stripe\PaymentIntent;

class PaymentController extends Controller
{
    public function __construct()
    {
        // Configurar Stripe con la clave secreta
        Stripe::setApiKey(config('services.stripe.secret'));
    }

    public function createPaymentIntent(Request $request)
    {
        $request->validate([
            'amount' => 'required|numeric|min:0.01',
            'currency' => 'sometimes|string|size:3'
        ]);

        try {
            $paymentIntent = PaymentIntent::create([
                'amount' => $request->amount, // Ya viene en centavos desde el frontend
                'currency' => $request->currency ?? 'usd',
                'automatic_payment_methods' => [
                    'enabled' => true,
                ],
            ]);

            return response()->json([
                'clientSecret' => $paymentIntent->client_secret,
                'paymentIntentId' => $paymentIntent->id
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 400);
        }
    }

    public function confirmPayment(Request $request)
    {
        $request->validate([
            'paymentIntentId' => 'required|string',
            'paymentMethod' => 'required'
        ]);

        try {
            $paymentIntent = PaymentIntent::retrieve($request->paymentIntentId);
            $paymentIntent->confirm([
                'payment_method' => $request->paymentMethod
            ]);

            return response()->json([
                'status' => $paymentIntent->status,
                'paymentIntent' => $paymentIntent
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 400);
        }
    }
}
