// src/environments/environment.ts
export const environment = {
    production: false,
    apiUrl: 'http://localhost:8000/api', // <-- ¡Esta es la URL de tu backend Laravel!
    stripePublishableKey: 'pk_test_51Q8Q2JHx7YKSBHqk1234567890abcdefghijklmnopqrstuvwxyz', // Clave de prueba de Stripe
    mercadopagoPublicKey: 'APP_USR-1234567890-12345678-abcdefghijklmnopqrstuvwxyz' // Reemplazar con tu clave pública de Mercado Pago
};