import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Subject, takeUntil, debounceTime, distinctUntilChanged, Observable } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';
import { ProductService } from '../../services/product.service';
import { User } from '../../models/user.model';
import { CartItem } from '../../models/cart-item.model';

interface Product {
  id: number;
  name: string;
  slug: string;
  price: number;
  image: string;
}

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit, OnDestroy {
  isAuthenticated$!: Observable<boolean>;
  currentUser$!: Observable<User | null>;
  cartItems$!: Observable<CartItem[]>;
  
  mobileMenuOpen = false;
  searchOpen = false;
  userMenuOpen = false;
  searchForm: FormGroup;
  searchResults: Product[] = [];
  searchLoading = false;
  userName: string | null = null;
  categoriesOpen = false;

  private destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private cartService: CartService,
    private productService: ProductService,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.searchForm = this.fb.group({
      query: ['']
    });
    
    // Inicializar después del constructor
    this.isAuthenticated$ = this.authService.isAuthenticated$;
    this.currentUser$ = this.authService.currentUser$;
    this.cartItems$ = this.cartService.getCartItems();
  }

  ngOnInit() {
    this.setupSearch();
    this.loadUserName();
  }

  private setupSearch() {
    this.searchForm.get('query')!
      .valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(query => {
        if (query && query.trim().length > 0) {
          this.performSearch(query);
        } else {
          this.searchResults = [];
        }
      });
  }

  private performSearch(query: string) {
    this.searchLoading = true;
    // Aquí iría el servicio de búsqueda
    // Por ahora, simulamos una búsqueda simple
    this.searchLoading = false;
  }

  private loadUserName() {
    this.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        if (user) {
          this.userName = user.name || user.email || 'Usuario';
        }
      });
  }

  toggleMobileMenu() {
    this.mobileMenuOpen = !this.mobileMenuOpen;
    this.searchOpen = false;
    this.userMenuOpen = false;
  }

  toggleCategories() {
    this.categoriesOpen = !this.categoriesOpen;
    if (this.categoriesOpen) {
      this.mobileMenuOpen = false;
      this.searchOpen = false;
      this.userMenuOpen = false;
    }
  }

  toggleSearch() {
    this.searchOpen = !this.searchOpen;
    this.mobileMenuOpen = false;
    if (this.searchOpen) {
      setTimeout(() => {
        const input = document.querySelector('.search-input') as HTMLInputElement;
        input?.focus();
      }, 0);
    }
  }

  toggleUserMenu() {
    this.userMenuOpen = !this.userMenuOpen;
  }

  onSearchResultClick(product: Product) {
    this.router.navigate(['/product', product.slug]);
    this.searchForm.reset();
    this.searchResults = [];
    this.searchOpen = false;
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/home']);
    this.userMenuOpen = false;
    this.mobileMenuOpen = false;
  }

  closeMenus() {
    this.mobileMenuOpen = false;
    this.userMenuOpen = false;
    this.searchOpen = false;
    this.categoriesOpen = false;
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
