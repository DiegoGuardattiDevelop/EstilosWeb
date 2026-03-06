// src/app/cart/cart.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CartService } from '../services/cart.service';
import { CartItem } from '../models/cart-item.model';
import { Observable, Subject, firstValueFrom } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { takeUntil } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss']
})
export class CartComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  cartItems$: Observable<CartItem[]>;
  totalPrice$: Observable<number>;
  totalItems$: Observable<number>;

  // Placeholder inline SVG (NUNCA falla)
  readonly PLACEHOLDER_IMAGE = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"%3E%3Crect fill="%23f0f0f0" width="200" height="200"/%3E%3Cpath fill="%23999" d="M100 80c-11 0-20 9-20 20s9 20 20 20 20-9 20-20-9-20-20-20zm0 32c-6.6 0-12-5.4-12-12s5.4-12 12-12 12 5.4 12 12-5.4 12-12 12z"/%3E%3Cpath fill="%23999" d="M140 60H60c-5.5 0-10 4.5-10 10v60c0 5.5 4.5 10 10 10h80c5.5 0 10-4.5 10-10V70c0-5.5-4.5-10-10-10zm2 70c0 1.1-.9 2-2 2H60c-1.1 0-2-.9-2-2v-15l20-20 15 15 25-25 24 24v21zm0-29.2l-22-22c-.8-.8-2-.8-2.8 0L95 101 80 86c-.8-.8-2-.8-2.8 0L58 105V70c0-1.1.9-2 2-2h80c1.1 0 2 .9 2 2v30.8z"/%3E%3C/svg%3E';
  
  // Set para evitar bucles de carga de imágenes
  private failedImages = new Set<string>();

  // WhatsApp phone number (from environment config)
  whatsappNumber: string = environment.whatsappNumber || '5493512345678';

  constructor(
    public cartService: CartService,
    private authService: AuthService,
    private router: Router
  ) {
    this.cartItems$ = this.cartService.getCartItems();
    this.totalPrice$ = this.cartService.getTotalPrice();
    this.totalItems$ = this.cartService.getTotalItems();
  }

  ngOnInit(): void {
    if (!this.authService.isLoggedIn()) {
      this.cartService.getCartItems()
        .pipe(takeUntil(this.destroy$))
        .subscribe(items => {
          if (items.length === 0) {
            this.router.navigate(['/']);
          }
        });
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ==================== NAVEGACIÓN ====================

  goBack(): void {
    window.history.back();
  }

  goToShop(): void {
    this.router.navigate(['/products']);
  }

  continueShopping(): void {
    this.router.navigate(['/products']);
  }

  checkout(): void {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/checkout']);
    } else {
      // Guardar intención de checkout y redirigir a login
      localStorage.setItem('redirectAfterLogin', '/checkout');
      this.router.navigate(['/login']);
    }
  }

  // ==================== OPERACIONES DEL CARRITO ====================

  increaseQuantity(productId: number, currentQuantity: number): void {
    const result = this.cartService.updateQuantity(productId, currentQuantity + 1);
    
    if (!result.success && result.message) {
      this.showMessage(result.message);
    }
  }

  decreaseQuantity(productId: number, currentQuantity: number): void {
    if (currentQuantity > 1) {
      this.cartService.updateQuantity(productId, currentQuantity - 1);
    }
  }

  removeItem(productId: number): void {
    if (confirm('¿Estás seguro de eliminar este producto del carrito?')) {
      this.cartService.removeFromCart(productId);
    }
  }

  clearCart(): void {
    if (confirm('¿Estás seguro de vaciar todo el carrito?')) {
      this.cartService.clearCart();
      this.failedImages.clear(); // Limpiar tracking de imágenes fallidas
    }
  }

  // ==================== MANEJO DE IMÁGENES ====================

  getProductImage(product: any): string {
    if (!product) {
      return this.PLACEHOLDER_IMAGE;
    }
    
    const imageUrl = product.image_url || product.main_image_url || product.image;
    
    if (!imageUrl) {
      return this.PLACEHOLDER_IMAGE;
    }
    
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }
    
    if (imageUrl.startsWith('data:')) {
      return imageUrl;
    }
    
    if (imageUrl.startsWith('storage/')) {
      return `${environment.apiUrl.replace('/api', '')}/${imageUrl}`;
    }
    
    return `${environment.apiUrl.replace('/api', '')}/storage/${imageUrl}`;
  }

  handleImageError(event: any): void {
    const img = event.target as HTMLImageElement;
    const originalSrc = img.src;

    if (img.src === this.PLACEHOLDER_IMAGE || 
        this.failedImages.has(originalSrc)) {
      console.warn('Imagen ya procesada:', originalSrc);
      return;
    }

    this.failedImages.add(originalSrc);
    console.warn('Error cargando imagen:', originalSrc);
    
    if (!originalSrc.includes('placeholder.jpg')) {
      img.src = '/assets/images/placeholder.jpg';
    } else {
      img.src = this.PLACEHOLDER_IMAGE;
    }
    
    img.alt = 'Imagen no disponible';
  }

  trackByProductId(index: number, item: CartItem): number {
    return item.product.id;
  }

  getItemSubtotal(item: CartItem): number {
    return item.product.price * item.quantity;
  }

  isGuestLimitReached(): Observable<boolean> {
    return this.cartService.hasReachedGuestLimit();
  }

  getGuestLimitMessage(): string {
    return this.cartService.getGuestLimitMessage();
  }

  private showMessage(message: string): void {
    alert(message);
  }

  isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  /**
   * Genera un pedido detallado por WhatsApp
   * Mensaje completo para el vendedor con todos los detalles
   */
  async orderByWhatsApp(): Promise<void> {
    const items = await firstValueFrom(this.cartService.getCartItems());
    const total = await firstValueFrom(this.cartService.getTotalPrice());

    if (!items || items.length === 0) {
      alert('Tu carrito está vacío');
      return;
    }

    // Generar número de pedido único
    const orderNumber = 'ORD-' + Date.now();
    const fecha = new Date().toLocaleDateString('es-AR', { 
      day: '2-digit', 
      month: 'long', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    // Generar mensaje detallado de WhatsApp
    let message = '╔══════════════════════════════╗\n';
    message +=    '║   🛒 NUEVO PEDIDO - EstilosWeb   ║\n';
    message +=    '╚══════════════════════════════╝\n\n';
    
    message += '📅 *Fecha:* ' + fecha + '\n';
    message += '📋 *N° de Pedido:* ' + orderNumber + '\n\n';
    message += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n';
    message += '*📦 DETALLE DEL PEDIDO:*\n';
    message += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n';
    
    let itemCount = 0;
    items.forEach((item) => {
      itemCount++;
      const price = Number(item.product?.price) || 0;
      const quantity = item.quantity || 0;
      const subtotal = price * quantity;

      message += '▸ *Producto #' + itemCount + '*\n';
      message += '   Nombre: ' + (item.product?.name ?? 'Producto sin nombre') + '\n';
      message += '   Cantidad: ' + quantity + '\n';
      message += '   Precio unitario: $' + price.toFixed(2) + '\n';
      message += '   --------------------' + '\n';
      message += '   *Subtotal: $' + subtotal.toFixed(2) + '*\n\n';
    });

    message += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n';
    message += '*💰 RESUMEN:*\n';
    message += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n';
    message += '   Subtotal:     $' + (total || 0).toFixed(2) + '\n';
    message += '   Envio:        $0.00\n';
    message += '   --------------------------------\n';
    message += '   *TOTAL:       $' + (total || 0).toFixed(2) + '*\n\n';
    
    message += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n';
    message += '*📱 DATOS DEL CLIENTE:*\n';
    message += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n';
    
    // Obtener datos del usuario si está logeado
    const currentUser = this.authService.getCurrentUser();
    const userName = currentUser?.name || 'Usuario Invitado';
    const userEmail = currentUser?.email || '';
    
    message += '   Nombre: ' + userName + '\n';
    if (userEmail) {
      message += '   Email: ' + userEmail + '\n';
    }
    message += '   Teléfono: [COMPLETAR]\n';
    message += '   Dirección: [COMPLETAR]\n\n';
    
    message += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n';
    message += '*📌 INSTRUCCIONES:*\n';
    message += '1. Confirme disponibilidad de productos\n';
    message += '2. Indique método de pago (Efectivo/Transferencia/MercadoPago)\n';
    message += '3. Coordine horario de retiro o entrega\n\n';
    
    message += '💚 *Gracias por su compra!.*\n';
    message += '*Equipo EstilosWeb*';

    // Codificar mensaje para URL
    const encodedMessage = encodeURIComponent(message);
    
    // Limpiar el carrito después de generar el mensaje
    this.cartService.clearCart();
    this.failedImages.clear();

    // Abrir WhatsApp
    const whatsappUrl = 'https://wa.me/' + environment.whatsappNumber + '?text=' + encodedMessage;
    window.open(whatsappUrl, '_blank');
  }
}
