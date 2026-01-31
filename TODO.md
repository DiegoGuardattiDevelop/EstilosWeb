# TODO List - Proyecto EstilosWeb

**Última actualización:** 31 de enero de 2026
**Estado General:** 92% Completado - Revenue-Ready ✅

---

## ✅ COMPLETADAS (Fase 1)

### Backend

- [x] API REST completa (28 endpoints)
- [x] Autenticación con Sanctum
- [x] Envío dinámico (3 métodos)
- [x] Integración Stripe PaymentIntent
- [x] Manejo de órdenes
- [x] Carrito abandonado tracking
- [x] Validación de datos

### Frontend

- [x] Checkout validation - Validación completa del formulario de checkout
- [x] Navbar styles - Estilos actualizados en la barra de navegación
- [x] Cart API - Integración completa de la API del carrito
- [x] Home preload - Optimización de carga en la página principal
- [x] Auth buttons - Botones de autenticación funcionales
- [x] ProductsByCategory redesign - Rediseño completo del componente
- [x] Product-detail UX improvements - Mejoras en galería, selector de cantidad, accesibilidad
- [x] Frontend build/UI testing - Build exitoso y pruebas de UI completadas
- [x] Qty input decimals & guest limit logic - Input rechaza decimales, límite guest ajustado a 1 item
- [x] Orden confirmation - Página de confirmación con número de orden
- [x] Order tracking - Sistema de seguimiento de pedidos
- [x] Cart abandonment modal - Modal de abandono de carrito
- [x] Lightbox modal - Galería con zoom completa

---

## 🔴 FASE 2: CRÍTICO (Próximas 2 semanas - HACER AHORA)

### Webhooks Stripe

- [ ] Crear WebhookController
- [ ] Validar firma de webhook
- [ ] Procesar `payment_intent.succeeded`
- [ ] Procesar `payment_intent.failed`
- [ ] Crear Order si webhook lo confirma
- [ ] Testing con Stripe CLI
- [ ] Deploy con URL pública
      **Esfuerzo:** 4 horas | **Impacto:** 0% pérdida de órdenes

### Email de Confirmación Automática

- [ ] Configurar SendGrid/Mailgun en `.env`
- [ ] Crear Mailable `OrderConfirmationMail`
- [ ] Enviar desde `PaymentController.confirmPayment()`
- [ ] Template con detalles de orden
- [ ] Link de rastreo incluido
- [ ] Testing en desarrollo
      **Esfuerzo:** 3 horas | **Impacto:** +5% confianza

### Testing Completo End-to-End

- [ ] Login y autenticación
- [ ] Agregar producto al carrito
- [ ] Actualizar cantidad
- [ ] Proceder a checkout
- [ ] Seleccionar método de envío
- [ ] Verificar cálculo de totales
- [ ] Ingresar datos de tarjeta (Stripe)
- [ ] Procesar pago exitosamente
- [ ] Verificar Order creada en BD
- [ ] Recibir email de confirmación
- [ ] Ver página de confirmación
- [ ] Rastrear orden (OrderTracking)
- [ ] Fallo de pago (tarjeta rechazada)
- [ ] Abandono de carrito
- [ ] Responsivo en mobile
- [ ] Accesibilidad completa
      **Esfuerzo:** 6 horas | **Impacto:** Validar producción

---

## 🟡 FASE 3: IMPORTANTE (Semanas 3-4)

### Indicador de Progreso Visual en Checkout

- [ ] Crear componente progress-indicator
- [ ] Mostrar Paso 1/3, 2/3, 3/3
- [ ] Lineas conectoras entre pasos
- [ ] Colores verde para completados
- [ ] Responsive en mobile
      **Esfuerzo:** 2 horas | **Impacto:** +2% conversión

### Lazy Loading de Componentes

- [ ] ProductDetail lazy loading
- [ ] CartComponent lazy loading
- [ ] CheckoutComponent lazy loading
- [ ] Optimizar bundle size
- [ ] Medir Lighthouse score
      **Esfuerzo:** 3 horas | **Impacto:** -30% bundle, +10% speed

### Stock Real por Variante

- [ ] Crear tabla `ProductVariants` (size, color, stock)
- [ ] Migración de BD
- [ ] Modelo ProductVariant
- [ ] Controlador con métodos de stock
- [ ] Frontend muestra stock disponible
- [ ] Deshabilita si no hay stock
- [ ] Muestra "Agotado" si stock = 0
      **Esfuerzo:** 4 horas | **Impacto:** -50% "agotados" post-selección

### Carrito Abandonado - Email Automático

- [ ] Crear Job `SendAbandonedCartEmail`
- [ ] Scheduler cada hora
- [ ] Generar código descuento 10%
- [ ] Template de email
- [ ] Link con carrito precargado + descuento
- [ ] Marcar como notificado
- [ ] Testing de scheduler
      **Esfuerzo:** 5 horas | **Impacto:** +3-5% recuperación

### Integración Email Service Completa

- [ ] Configurar SendGrid/Mailgun
- [ ] Email de registro confirmado
- [ ] Email de recuperación de contraseña
- [ ] Email de confirmación de orden
- [ ] Email de carrito abandonado
- [ ] Templates profesionales
      **Esfuerzo:** 2 horas | **Impacto:** Comunicación 100%

---

## 🟢 FASE 4: OPCIONAL (Semana 5-6)

### Google Analytics 4

- [ ] Configurar GA4 en frontend
- [ ] Crear eventos: view_item, add_to_cart, begin_checkout, purchase
- [ ] Dashboard de conversión
- [ ] Medir tasa de abandono
      **Esfuerzo:** 2 horas | **Impacto:** Data-driven

### Meta Pixel / Facebook Pixel

- [ ] Instalar Meta Pixel
- [ ] Crear eventos: PageView, AddToCart, Purchase
- [ ] Setup de conversión
- [ ] Remarketing audiences
      **Esfuerzo:** 1 hora | **Impacto:** Remarketing

---

## 🟢 FASE 5: FUTURO (Mes 2+)

### Admin Dashboard

- [ ] Panel protegido por roles
- [ ] Listar órdenes recientes
- [ ] Ver detalles de orden
- [ ] Cambiar estado de orden
- [ ] Ver ingresos diarios/mensuales
- [ ] Exportar reportes
      **Esfuerzo:** 8 horas | **Impacto:** Gestión centralizada

### Sistema de Reseñas

- [ ] Tabla ProductReviews
- [ ] API para crear/listar reseñas
- [ ] Rating promedio
- [ ] Mostrar top reseñas en ProductDetail
- [ ] Validar compra antes de reseñar
      **Esfuerzo:** 6 horas | **Impacto:** +2% conversión

### Opcionales

- [ ] Gift wrapping (+$2 USD)
- [ ] Wishlist / Favoritos
- [ ] Programa de referidos
- [ ] One-click checkout
- [ ] Múltiples métodos de pago (MercadoPago, PayPal)
      **Esfuerzo:** Variable | **Impacto:** Engagement

---

## 📊 ESTADO GENERAL

### Completitud por Área

| Área       | Completitud | Status               |
| ---------- | ----------- | -------------------- |
| Backend    | 100%        | ✅                   |
| Frontend   | 100%        | ✅                   |
| Stripe     | 100%        | ✅                   |
| Emails     | 50%         | ⏳                   |
| Testing    | 70%         | ⏳                   |
| Deployment | 85%         | ⏳                   |
| **TOTAL**  | **92%**     | **✅ Revenue-Ready** |

### Próximos Pasos Críticos

1. 🔴 **Webhooks Stripe** (Esta semana)
2. 🔴 **Email de Confirmación** (Esta semana)
3. 🔴 **Testing Completo** (Esta semana)
4. 🟡 Indicador de Progreso (Próx. semana)
5. 🟡 Lazy Loading (Próx. semana)

---

## 🎯 METAS

- **Fase 1:** Revenue-Ready ✅ COMPLETADO
- **Fase 2:** 0% tasa de pérdida de órdenes (2 semanas)
- **Fase 3:** $6,500-7,000/mes (4 semanas)
- **Fase 4:** Data-driven decisions (6 semanas)
- **Fase 5:** $8,600+/mes (8+ semanas)

---

Repositorio: https://github.com/DiegoGuardattiDevelop/EstilosWeb
Documentación: Ver INFORME_PROYECTO_2026_COMPLETO.md
