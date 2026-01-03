// src/app/components/product-detail/product-detail.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { switchMap, takeUntil } from 'rxjs/operators';
import { Subject, EMPTY, Observable } from 'rxjs';

import { ProductService } from '../../services/product.service';
import { Product } from '../../models/product.model';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { CartItem } from '../../models/cart-item.model';
import { environment } from '../../../environments/environment';

interface Category {
  id: number;
  name: string;
  color: string;
}

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.scss']
})
export class ProductDetailComponent implements OnInit, OnDestroy {
  product: (Product & { category?: Category }) | null = null;
  isLoading = true;
  error: string = '';
  showNotification: boolean = false;
  showWarning: boolean = false;
  warningMessage: string = '';
  cartItems$!: Observable<CartItem[]>;
  cartTotal$!: Observable<number>;
  isGuest: boolean = true;
  hasReachedLimit: boolean = false;
  // UX state
  quantity: number = 1;
  selectedImage: string | null = null;
  // Lightbox / gallery state
  imagesList: string[] = [];
  lightboxOpen: boolean = false;
  lightboxIndex: number = 0;

  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    public cartService: CartService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.cartItems$ = this.cartService.getCartItems();
    this.cartTotal$ = this.cartService.getTotalPrice();
    
    // Verificar si es invitado
    this.isGuest = !this.authService.isLoggedIn();
    
    // Verificar límite de invitado
    this.cartService.hasReachedGuestLimit().subscribe(hasReached => {
      this.hasReachedLimit = hasReached;
    });

    this.route.paramMap.pipe(
      switchMap(params => {
        const productSlug = params.get('slug');
        this.isLoading = true;
        this.error = '';
        this.product = null;

        if (!productSlug) {
          this.router.navigate(['/']);
          return EMPTY;
        }

        return this.productService.getProductBySlug(productSlug);
      }),
      takeUntil(this.destroy$)
    ).subscribe({
      next: (productData) => {
        this.product = productData;
        // Initialize gallery selection and quantity limit
        this.selectedImage = (productData.images && productData.images.length) ? productData.images[0] : productData.image_url;
        this.quantity = Math.min(Math.max(1, this.quantity), productData.stock || 1);
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error loading product:', error);
        this.error = 'Error al cargar el producto';
        this.isLoading = false;
      }
    });
  }

  onQuantityInput(value: string | number): void {
    const parsed = Number(value);
    if (Number.isNaN(parsed) || parsed < 1) {
      this.quantity = 1;
      return;
    }

    const max = this.product?.stock ?? parsed;
    this.quantity = Math.min(Math.max(1, Math.floor(parsed)), max);
  }

  addToCart(): void {
    if (!this.product) return;

    const qty = Math.max(1, Math.floor(this.quantity));
    const result = this.cartService.addToCart(this.product, qty);
    
    if (result.success) {
      // Mostrar notificación de éxito
      this.showNotification = true;
      this.showWarning = false;
      
      setTimeout(() => {
        this.showNotification = false;
      }, 3000);
    } else {
      // Mostrar advertencia
      this.showWarning = true;
      this.warningMessage = result.message!;
      
      setTimeout(() => {
        this.showWarning = false;
      }, 5000);
    }
  }

  // Quantity control
  increaseQuantity(): void {
    if (!this.product) return;
    if (this.isGuest && this.hasReachedLimit) return;
    if (this.quantity < this.product.stock) this.quantity++;
  }

  decreaseQuantity(): void {
    if (this.quantity > 1) this.quantity--;
  }

  // Gallery
  selectImage(url: string): void {
    this.selectedImage = url;
  }

  openLightbox(index: number): void {
    if (!this.product) return;
    // build images list lazily
    this.imagesList = (this.product.images && this.product.images.length) ? [...this.product.images] : [this.product.image_url];
    this.lightboxIndex = Math.max(0, Math.min(index, this.imagesList.length - 1));
    this.lightboxOpen = true;
  }

  closeLightbox(): void {
    this.lightboxOpen = false;
  }

  nextLightbox(): void {
    if (!this.imagesList.length) return;
    this.lightboxIndex = (this.lightboxIndex + 1) % this.imagesList.length;
  }

  prevLightbox(): void {
    if (!this.imagesList.length) return;
    this.lightboxIndex = (this.lightboxIndex - 1 + this.imagesList.length) % this.imagesList.length;
  }

  // keyboard navigation for lightbox
  // HostListener added via decorator import-free to avoid extra imports in this file, use window event listener
  handleKeydown(event: KeyboardEvent) {
    if (!this.lightboxOpen) return;
    if (event.key === 'Escape') this.closeLightbox();
    if (event.key === 'ArrowRight') this.nextLightbox();
    if (event.key === 'ArrowLeft') this.prevLightbox();
  }

  getButtonText(): string {
    if (!this.product) return 'Agregar al Carrito';
    
    if (this.product.stock === 0) {
      return 'Agotado';
    }
    
    if (this.isGuest && this.hasReachedLimit) {
      return 'Límite Alcanzado';
    }
    
    return 'Agregar al Carrito';
  }

  isButtonDisabled(): boolean {
    if (!this.product) return true;
    
    return this.product.stock === 0 || (this.isGuest && this.hasReachedLimit);
  }

  goBack(): void {
    window.history.back();
  }

  goToCart(): void {
    this.router.navigate(['/cart']);
  }

  closeWarning(): void {
    this.showWarning = false;
  }

  getProductImageUrl(imageUrl: string): string {
    if (!imageUrl) return '/assets/images/placeholder.jpg';

    if (imageUrl.startsWith('http')) {
      return imageUrl;
    }

    if (imageUrl.startsWith('storage/')) {
      return `${environment.apiUrl.replace('/api', '')}/${imageUrl}`;
    }

    return `${environment.apiUrl.replace('/api', '')}/storage/${imageUrl}`;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}