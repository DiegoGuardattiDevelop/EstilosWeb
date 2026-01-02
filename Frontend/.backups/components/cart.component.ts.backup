// src/app/cart/cart.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CartService } from '../services/cart.service';
import { CartItem } from '../models/cart-item.model';
import { Observable, Subject } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { takeUntil } from 'rxjs/operators';

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

  /**
   * Obtiene la URL correcta de la imagen del producto
   */
  getProductImage(product: any): string {
    if (!product) {
      return this.PLACEHOLDER_IMAGE;
    }
    
    const imageUrl = product.image_url || product.main_image_url || product.image;
    
    if (!imageUrl) {
      return this.PLACEHOLDER_IMAGE;
    }
    
    // Si ya es una URL completa
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }
    
    // Si es una data URI (base64 o SVG inline)
    if (imageUrl.startsWith('data:')) {
      return imageUrl;
    }
    
    // Si empieza con 'storage/'
    if (imageUrl.startsWith('storage/')) {
      return `http://localhost:8000/${imageUrl}`;
    }
    
    // Por defecto, asumir que está en storage
    return `http://localhost:8000/storage/${imageUrl}`;
  }

  /**
   * Maneja errores de carga de imágenes SIN CREAR BUCLES
   * ⚠️ CRÍTICO: Previene bucles infinitos usando un Set de URLs fallidas
   */
  handleImageError(event: any): void {
    const img = event.target as HTMLImageElement;
    const originalSrc = img.src;

    // Si ya es el placeholder inline o ya intentamos cargar esta imagen, no hacer nada
    if (img.src === this.PLACEHOLDER_IMAGE || 
        this.failedImages.has(originalSrc)) {
      console.warn('⚠️ Imagen ya procesada:', originalSrc);
      return;
    }

    // Marcar esta URL como fallida para no reintentarla
    this.failedImages.add(originalSrc);
    
    console.warn('⚠️ Error cargando imagen:', originalSrc);
    
    // Si la imagen que falló NO es el placeholder de assets, intentar con él una vez
    if (!originalSrc.includes('placeholder.jpg')) {
      img.src = '/assets/images/placeholder.jpg';
    } else {
      // Si el placeholder de assets también falla, usar el inline
      img.src = this.PLACEHOLDER_IMAGE;
    }
    
    img.alt = 'Imagen no disponible';
  }

  /**
   * Trackby function para optimizar el rendering de Angular
   */
  trackByProductId(index: number, item: CartItem): number {
    return item.product.id;
  }

  /**
   * Calcula el subtotal de un item
   */
  getItemSubtotal(item: CartItem): number {
    return item.product.price * item.quantity;
  }

  /**
   * Verifica si se alcanzó el límite de invitado
   */
  isGuestLimitReached(): Observable<boolean> {
    return this.cartService.hasReachedGuestLimit();
  }

  /**
   * Obtiene el mensaje de límite de invitado
   */
  getGuestLimitMessage(): string {
    return this.cartService.getGuestLimitMessage();
  }

  /**
   * Muestra un mensaje al usuario (puedes reemplazar con un servicio de toast/snackbar)
   */
  private showMessage(message: string): void {
    alert(message);
    // TODO: Reemplazar con un servicio de notificaciones más elegante
    // Ejemplo: this.snackBar.open(message, 'Cerrar', { duration: 3000 });
  }

  /**
   * Verifica si el usuario está autenticado
   */
  isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }
}