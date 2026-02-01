<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class MercadoPagoController extends Controller
{
    protected $mp;

    public function __construct()
    {
        // Inicializar cliente Mercado Pago con access token (SDK procedural instalado)
        $this->mp = new \MP(config('services.mercadopago.access_token'));
    }

    /**
     * Crear una preferencia de pago en Mercado Pago
     * POST /api/mercadopago/preference
     */
    public function createPreference(Request $request)
    {
        $request->validate([
            'amount' => 'required|numeric|min:0.01',
            'currency' => 'sometimes|string|size:3',
            'description' => 'sometimes|string',
            'orderId' => 'sometimes|string',
            'customerEmail' => 'sometimes|email',
            'items' => 'sometimes|array',
        ]);

        try {
            $preferenceData = [
                'items' => $request->has('items') ? $request->items : [
                    [
                        'title' => $request->description ?? 'Compra EstilosWeb',
                        'quantity' => 1,
                        'unit_price' => (float) $request->amount,
                        'currency_id' => $request->currency ?? 'ARS',
                    ]
                ],
                'back_urls' => [
                    'success' => env('APP_URL') . '/checkout/success',
                    'failure' => env('APP_URL') . '/checkout/failure',
                    'pending' => env('APP_URL') . '/checkout/pending',
                ],
                'auto_return' => 'approved',
                'external_reference' => $request->orderId ?? null,
            ];

            if ($request->has('customerEmail')) {
                $preferenceData['payer'] = ['email' => $request->customerEmail];
            }

            $preferenceResult = $this->mp->create_preference($preferenceData);
            $responseData = $preferenceResult['response'] ?? null;

            return response()->json([
                'preferenceId' => $responseData['id'] ?? null,
                'initPoint' => $responseData['init_point'] ?? null,
                'sandboxInitPoint' => $responseData['sandbox_init_point'] ?? null,
                'raw' => $preferenceResult,
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 400);
        }
    }

    /**
     * Confirmar pago realizado (para Card Form o API payments)
     * POST /api/mercadopago/payment
     */
    public function confirmPayment(Request $request)
    {
        $request->validate([
            'paymentMethodId' => 'sometimes|string',
            'token' => 'sometimes|string',
            'installments' => 'sometimes|integer',
            'issuerId' => 'sometimes|integer',
            'identificationType' => 'sometimes|string',
            'identificationNumber' => 'sometimes|string',
            'amount' => 'required|numeric|min:0.01',
            'description' => 'sometimes|string',
            'email' => 'required|email',
        ]);

        try {
            $paymentData = [
                'transaction_amount' => (float) $request->amount,
                'payment_method_id' => $request->paymentMethodId ?? null,
                'token' => $request->token ?? null,
                'installments' => $request->installments ?? 1,
                'issuer_id' => $request->issuerId ?? null,
                'payer' => [
                    'email' => $request->email,
                    'identification' => [
                        'type' => $request->identificationType ?? 'DNI',
                        'number' => $request->identificationNumber ?? null,
                    ]
                ],
                'description' => $request->description ?? 'Compra EstilosWeb',
            ];

            $paymentResult = $this->mp->post('/v1/payments', $paymentData);
            $paymentResponse = $paymentResult['response'] ?? null;

            return response()->json([
                'status' => $paymentResponse['status'] ?? null,
                'paymentId' => $paymentResponse['id'] ?? null,
                'payment' => $paymentResponse,
                'raw' => $paymentResult,
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 400);
        }
    }

    /**
     * Webhook para recibir notificaciones de Mercado Pago
     * POST /api/mercadopago/webhook
     */
    public function webhook(Request $request)
    {
        try {
            $type = $request->query('type');
            $id = $request->query('id');

            if (!$type || !$id) {
                return response()->json(['error' => 'Missing type or id'], 400);
            }

            if ($type === 'payment') {
                $payment = $this->mp->get_payment($id);
                Log::info('Mercado Pago Webhook: ' . json_encode($payment));
            }

            return response()->json(['success' => true]);
        } catch (\Exception $e) {
            Log::error('Mercado Pago Webhook Error: ' . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 400);
        }
    }

    /**
     * Obtener estado de pago
     * GET /api/mercadopago/payment-status/{paymentId}
     */
    public function getPaymentStatus($paymentId)
    {
        try {
            $payment = $this->mp->get_payment($paymentId);
            $resp = $payment['response'] ?? [];

            return response()->json([
                'paymentId' => $resp['id'] ?? null,
                'status' => $resp['status'] ?? null,
                'statusDetail' => $resp['status_detail'] ?? null,
                'amount' => $resp['transaction_amount'] ?? null,
                'transactionDate' => $resp['date_approved'] ?? null,
                'raw' => $payment,
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 400);
        }
    }
}
