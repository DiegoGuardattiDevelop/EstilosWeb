import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { switchMap, takeUntil } from 'rxjs/operators';
import { Observable, Subject, EMPTY } from 'rxjs';

import { ProductService, PaginatedProductsResponse } from '../services/product.service';
import { CategoryService, Category } from '../services/category.service';
import { Location } from '@angular/common';
import { CartService } from '../services/cart.service';
import { AuthService } from '../services/auth.service';
import { CartItem } from '../models/cart-item.model';
import { Product } from '../models/product.model';

@Component({
  selector: 'app-products-by-category',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './products-by-category.component.html',
  styleUrls: ['./products-by-category.component.scss']
})
export class ProductsByCategoryComponent implements OnInit, OnDestroy {
  category: Category | undefined;
  products: Product[] = [];
  isLoading = true;

  currentPage = 1;
  totalPages = 1;
  paginationRange: number[] = [];
  categorySlug: string = '';

  // ✅ Propiedades para el carrito
  cartItems$!: Observable<CartItem[]>;
  cartTotal$!: Observable<number>;

  // ✅ Propiedades para filtros UI
  showFilters = true; // Mostrar filtros por defecto

  private destroy$ = new Subject<void>();

  filters: {
    searchTerm: string | null;
    minPrice: number | null;
    maxPrice: number | null;
    sortBy: string;
    sortOrder: 'asc' | 'desc';
  } = {
    searchTerm: null,
    minPrice: null,
    maxPrice: null,
    sortBy: 'created_at',
    sortOrder: 'desc'
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private categoryService: CategoryService,
    private location: Location,
    private cartService: CartService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    // ✅ Inicializar observables del carrito
    this.cartItems$ = this.cartService.getCartItems();
    this.cartTotal$ = this.cartService.getTotalPrice();

    this.route.paramMap.pipe(
      switchMap(params => {
        this.categorySlug = params.get('slug') || '';
        this.isLoading = true;

        if (!this.categorySlug) {
          this.router.navigate(['/']);
          return EMPTY;
        }

        return this.categoryService.getCategoryBySlug(this.categorySlug);
      }),
      takeUntil(this.destroy$)
    ).subscribe({
      next: (categoryData) => {
        this.category = categoryData;
        if (this.category) {
          this.loadProducts();
        } else {
          this.router.navigate(['/']);
          this.isLoading = false;
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.router.navigate(['/']);
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ✅ Método para navegar al detalle del producto
  viewProductDetail(product: any, event: Event): void {
    event.stopPropagation();
    this.router.navigate(['/product', product.slug]);
  }

  // ✅ Método para ir al carrito
  goToCart(): void {
    this.router.navigate(['/cart']);
  }

  loadProducts(): void {
    if (!this.category) return;

    this.isLoading = true;

    this.productService.getProducts(
      this.category.slug,
      this.filters.searchTerm,
      this.filters.minPrice,
      this.filters.maxPrice,
      this.filters.sortBy,
      this.filters.sortOrder,
      this.currentPage
    ).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (res: PaginatedProductsResponse) => {
        this.products = res.data;
        this.totalPages = res.last_page;
        this.currentPage = res.current_page;
        this.generatePaginationRange();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al cargar productos:', err);
        this.isLoading = false;
        this.products = [];
      }
    });
  }

  generatePaginationRange(): void {
    const range: number[] = [];
    const visiblePages = 5;
    let start = Math.max(1, this.currentPage - Math.floor(visiblePages / 2));
    let end = Math.min(this.totalPages, start + visiblePages - 1);

    if (end - start < visiblePages - 1) {
      start = Math.max(1, end - visiblePages + 1);
    }

    for (let i = start; i <= end; i++) {
      range.push(i);
    }

    this.paginationRange = range;
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages || page === this.currentPage) return;
    
    this.currentPage = page;
    this.loadProducts();
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  applyFilters(): void {
    this.currentPage = 1;
    this.loadProducts();
  }

  clearFilters(): void {
    this.filters = {
      searchTerm: null,
      minPrice: null,
      maxPrice: null,
      sortBy: 'created_at',
      sortOrder: 'desc'
    };
    this.applyFilters();
  }

  // ✅ Métodos para el panel de filtros colapsable
  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  // ✅ Verificar si hay filtros activos
  hasActiveFilters(): boolean {
    return (
      this.filters.searchTerm !== null ||
      this.filters.minPrice !== null ||
      this.filters.maxPrice !== null ||
      this.filters.sortBy !== 'created_at' ||
      this.filters.sortOrder !== 'desc'
    );
  }

  // ✅ Limpiar un filtro específico
  clearFilter(filterType: string): void {
    switch (filterType) {
      case 'minPrice':
        this.filters.minPrice = null;
        break;
      case 'maxPrice':
        this.filters.maxPrice = null;
        break;
      case 'sort':
        this.filters.sortBy = 'created_at';
        this.filters.sortOrder = 'desc';
        break;
      case 'search':
        this.filters.searchTerm = null;
        break;
    }
    this.applyFilters();
  }

  // ✅ Limpiar todos los filtros
  clearAllFilters(): void {
    this.clearFilters();
  }

  goBack(): void {
    if (window.history.length > 1) {
      this.location.back();
    } else {
      this.router.navigate(['/home']);
    }
  }

  trackByProductId(index: number, product: Product): any {
    return product.id || index;
  }

  getProductImageUrl(imageUrl: string): string {
    if (!imageUrl) return '/assets/images/placeholder.jpg';
    
    if (imageUrl.startsWith('http')) {
      return imageUrl;
    }
    
    if (imageUrl.startsWith('storage/')) {
      return `http://localhost:8000/${imageUrl}`;
    }
    
    return `http://localhost:8000/storage/${imageUrl}`;
  }

  // ✅ Métodos helper para el carrito (opcionales, para mejor manejo de datos)
  getProductName(item: any): string {
    return item?.product?.name || 'Producto sin nombre';
  }

  getProductPrice(item: any): number {
    return item?.product?.price || 0;
  }

  getProductImage(item: any): string {
    if (!item?.product?.image_url) {
      return '/assets/images/placeholder.jpg';
    }
    return this.getProductImageUrl(item.product.image_url);
  }

  getProductQuantity(item: any): number {
    return item?.quantity || 0;
  }

  // ✅ Método para agregar al carrito directamente desde la lista de productos
  addToCartFromList(product: Product, event: Event): void {
    event.stopPropagation(); // Prevenir navegación al producto
    this.cartService.addToCart(product, 1);
    
    // Opcional: Mostrar notificación temporal
    this.showCartNotification();
  }

  // ✅ Método para agregar al carrito (versión corta para el template)
  addToCart(product: Product, event: Event): void {
    event.stopPropagation();
    this.cartService.addToCart(product, 1);
    this.showCartNotification();
  }

  // ✅ Método para mostrar notificación temporal
  private showCartNotification(): void {
    // Puedes implementar una notificación toast aquí
    console.log('Producto agregado al carrito');
  }
}