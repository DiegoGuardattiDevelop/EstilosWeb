# Integración de Mercado Pago - Guía de Implementación

**Rama:** `feature/mercadopago-integration`  
**Fecha:** Febrero 1, 2026  
**Estado:** Implementación completada, pendiente pruebas E2E

---

## 📋 Resumen de Cambios

Se agregó soporte para **Mercado Pago** como pasarela de pago alternativa a Stripe en el flujo de checkout. El usuario ahora puede elegir entre:

- **Stripe**: Tarjetas de crédito/débito (Visa, Mastercard, Amex)
- **Mercado Pago**: Tarjetas, transferencias bancarias, billetera digital

---

## 🔧 Cambios Backend (Laravel)

### 1. **Instalación del SDK**

```bash
cd Backend
composer require mercadopago/sdk
```

### 2. **Configuración** (`config/services.php`)

```php
'mercadopago' => [
    'access_token' => env('MERCADOPAGO_ACCESS_TOKEN'),
    'public_key' => env('MERCADOPAGO_PUBLIC_KEY'),
],
```

### 3. **Nuevo Controlador** (`Backend/app/Http/Controllers/Api/MercadoPagoController.php`)

**Endpoints implementados:**

| Método | Ruta                                   | Función                           |
| ------ | -------------------------------------- | --------------------------------- |
| `POST` | `/api/mercadopago/preference`          | Crear preferencia de pago         |
| `POST` | `/api/mercadopago/payment`             | Confirmar pago (Card Form)        |
| `GET`  | `/api/mercadopago/payment-status/{id}` | Obtener estado del pago           |
| `POST` | `/api/mercadopago/webhook`             | Recibir webhooks de MP (sin auth) |

### 4. **Rutas** (`Backend/routes/api.php`)

```php
// Autenticadas
Route::post('/mercadopago/preference', [MercadoPagoController::class, 'createPreference']);
Route::post('/mercadopago/payment', [MercadoPagoController::class, 'confirmPayment']);
Route::get('/mercadopago/payment-status/{paymentId}', [MercadoPagoController::class, 'getPaymentStatus']);

// Sin autenticación (webhooks)
Route::post('/mercadopago/webhook', [MercadoPagoController::class, 'webhook']);
```

---

## 🎨 Cambios Frontend (Angular)

### 1. **Instalación del SDK**

```bash
cd Frontend
npm install @mercadopago/sdk-js --legacy-peer-deps
```

### 2. **Nuevo Servicio** (`Frontend/src/app/services/mercadopago.service.ts`)

Métodos disponibles:

- `initializeMercadoPago()` - Cargar SDK de MP
- `isMercadoPagoLoaded()` - Verificar si está cargado
- `createPreference(data)` - Crear preferencia
- `confirmPayment(data)` - Confirmar pago
- `getPaymentStatus(paymentId)` - Obtener estado
- `createCardToken(cardData)` - Token de tarjeta
- `getPaymentMethods()` - Métodos disponibles
- `getInstallments(amount, paymentMethodId)` - Cuotas

### 3. **Actualización del Componente** (`Frontend/src/app/components/checkout/checkout.component.ts`)

**Cambios:**

- Agregada propiedad `selectedPaymentMethod: 'stripe' | 'mercadopago'`
- Agregadas propiedades `mp: any` (Mercado Pago SDK)
- Nuevo formulario con campo `paymentMethod`
- Métodos separados:
  - `submitOrderWithStripe()` - Flujo Stripe original
  - `submitOrderWithMercadoPago()` - Nuevo flujo MP
  - `finalizeOrder()` - Finalizar orden (común a ambos)

### 4. **Actualización del Template** (`Frontend/src/app/components/checkout/checkout.component.html`)

**Interfaz de selección:**

```html
<div class="payment-methods-select">
  <!-- Radio buttons para Stripe y Mercado Pago -->
  <!-- UI condicional que muestra/oculta el Stripe Element o info de MP -->
</div>
```

### 5. **Estilos** (`Frontend/src/app/components/checkout/checkout.component.scss`)

Agregados estilos para:

- `.payment-methods-select` - Selector visual de métodos
- `.mp-info` - Información de Mercado Pago
- `.error-message` - Mensajes de error

### 6. **Variables de Entorno** (`Frontend/src/environments/environment.ts`)

```typescript
export const environment = {
  mercadopagoPublicKey: "APP_USR-YOUR_PUBLIC_KEY", // Reemplazar
};
```

---

## 🔐 Configuración de Credenciales

### Backend - Crear/Actualizar `.env`

```bash
# Copiar template
cp .env.mercadopago.example .env

# Editar y agregar tus claves de Mercado Pago
MERCADOPAGO_ACCESS_TOKEN=APP_USR-XXX...
MERCADOPAGO_PUBLIC_KEY=APP_USR-XXX...
```

### Frontend - Actualizar environment

Editar `Frontend/src/environments/environment.ts`:

```typescript
mercadopagoPublicKey: "APP_USR-tu-clave-publica";
```

---

## 📌 Notas de Implementación

### Flujo Stripe (existente)

1. Usuario ingresa datos de tarjeta en Stripe Element
2. Se crea PaymentIntent en backend
3. Se confirma el pago con `stripe.confirmCardPayment()`
4. Orden se crea localmente

### Flujo Mercado Pago (nuevo)

1. Se crea una "Preferencia" de pago en MP backend
2. Usuario es redirigido a Checkout Pro de MP
3. MP maneja la autenticación y aprobación
4. Se retorna a la app después del pago
5. Webhook de MP confirma el pago

---

## ⚠️ Consideraciones Importantes

### URLs de Retorno (Mercado Pago)

En `MercadoPagoController.createPreference()`:

```php
'back_urls' => [
    'success' => env('APP_URL') . '/checkout/success',
    'failure' => env('APP_URL') . '/checkout/failure',
    'pending' => env('APP_URL') . '/checkout/pending',
],
```

**Acción requerida:** Crear/actualizar rutas de retorno en Angular

### Webhooks

- **Stripe:** Configurar en Dashboard de Stripe
- **Mercado Pago:** Configurar en Settings de MP
- **Endpoint:** `POST /api/mercadopago/webhook?type=payment&id={paymentId}`

### Validación de Seguridad

- ❌ **NO guardes** datos sensibles de tarjetas en el frontend
- ✅ **USA** Stripe Elements o MP SDK para capturar datos
- ✅ **VALIDA** el pago en backend antes de crear la orden

---

## 🧪 Pruebas Recomendadas

### Con Tarjetas de Prueba

**Stripe:**

- Visa (Éxito): `4242 4242 4242 4242`
- Visa (Declinada): `4000 0000 0000 0002`

**Mercado Pago:**

- Visa (Éxito): `4111 1111 1111 1111`
- Mastercard (Rechazada): `5555 5555 5555 4444`

### Pasos de Prueba E2E

1. **Levantar backend:**

   ```bash
   cd Backend
   ./sail up -d
   ```

2. **Levantar frontend:**

   ```bash
   cd Frontend
   ng serve
   ```

3. **Ir a checkout:** `http://localhost:4200/checkout`

4. **Paso 1-2:** Completar envío y confirmación

5. **Paso 3:** Elegir método de pago y probar ambos

6. **Verificar:** Órdenes creadas en `/api/orders`

---

## 📝 Próximos Pasos

- [ ] Pruebas E2E con tarjetas de prueba
- [ ] Implementar rutas de retorno (`/checkout/success`, `/checkout/failure`, `/checkout/pending`)
- [ ] Configurar webhooks en Stripe y Mercado Pago
- [ ] Agregar email de confirmación
- [ ] Manejo de casos de error y reintentos
- [ ] Testing de concurrencia y seguridad
- [ ] Documentación de usuario (instrucciones de pago)

---

## 🔗 Enlaces Útiles

- [Documentación Mercado Pago](https://developers.mercadopago.com/es/reference)
- [SDK PHP Mercado Pago](https://github.com/mercadopago/sdk-php)
- [SDK JS Mercado Pago](https://github.com/mercadopago/sdk-js)
- [Documentación Stripe](https://stripe.com/docs)

---

**Creado en:** `feature/mercadopago-integration`  
**Última actualización:** 1 de febrero de 2026
