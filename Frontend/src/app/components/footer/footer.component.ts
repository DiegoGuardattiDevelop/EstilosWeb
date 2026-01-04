// src/app/components/footer/footer.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http'; // ✅ Solo HttpClient
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';

interface FooterData {
  companyInfo: {
    name: string;
    description: string;
    phone: string;
    email: string;
    address: string;
  };
  socialLinks: SocialLink[];
  quickLinks: QuickLink[];
}

interface SocialLink {
  name: string;
  url: string;
  icon: string;
}

interface QuickLink {
  name: string;
  route: string;
  icon: string;
}

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule,
    // ❌ QUITAR HttpClientModule de aquí - se importa a nivel de app
  ],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit {
  footerData: FooterData = this.getDefaultData();
  currentYear: number = new Date().getFullYear();
  isLoading: boolean = false;
  
  // Propiedades para el carrito
  cartItemCount: number = 0;
  
  // Propiedades para autenticación
  isAuthenticated: boolean = false;
  userName: string = '';
  userInitials: string = '';
  isUserMenuOpen: boolean = false;

  constructor(
    private http: HttpClient,
    private cartService: CartService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // this.loadFooterData();
    this.footerData = this.getDefaultData();
    
    // Suscribirse a cambios del carrito
    this.cartService.getCartItems().subscribe(items => {
      this.cartItemCount = items.length;
    });
    
    // Suscribirse a cambios de autenticación
    this.authService.currentUser$.subscribe(user => {
      this.isAuthenticated = !!user;
      if (user) {
        this.userName = user.name || 'Usuario';
        this.userInitials = this.getUserNameInitials(this.userName);
      } else {
        this.userName = '';
        this.userInitials = '';
      }
    });
  }

  private loadFooterData(): void {
    this.isLoading = true;
    
    this.http.get<FooterData>('/api/footer-data').pipe(
      catchError(error => {
        console.error('Error loading footer data:', error);
        return of(this.getDefaultData());
      })
    ).subscribe({
      next: (data) => {
        this.footerData = data;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('HTTP Error:', error);
        this.footerData = this.getDefaultData();
        this.isLoading = false;
      }
    });
  }

  private getDefaultData(): FooterData {
    return {
      companyInfo: {
        name: 'EstilosWeb',
        description: 'Tienda de ropa confiable con 40 años en Pilar',
        phone: '+54 11 1234-5678',
        email: 'info@estilosweb.com',
        address: 'Pilar, Buenos Aires'
      },
      socialLinks: [
        { name: 'WhatsApp', url: '#', icon: 'fab fa-whatsapp' },
        { name: 'Instagram', url: '#', icon: 'fab fa-instagram' },
        { name: 'Facebook', url: '#', icon: 'fab fa-facebook-f' }
      ],
      quickLinks: [
        { name: 'Inicio', route: '/', icon: 'fas fa-home' },
        { name: 'Productos', route: '/products', icon: 'fas fa-shopping-bag' },
        { name: 'Categorías', route: '/categories', icon: 'fas fa-tags' },
        { name: 'Carrito', route: '/cart', icon: 'fas fa-shopping-cart' },
        { name: 'Checkout', route: '/checkout', icon: 'fas fa-credit-card' }
      ]
    };
  }

  // Métodos para el carrito
  openCart(): void {
    // Navegar al carrito
    window.location.href = '/cart';
  }

  // Métodos para autenticación
  openLogin(): void {
    // Navegar al login
    window.location.href = '/login';
  }

  toggleUserMenu(): void {
    this.isUserMenuOpen = !this.isUserMenuOpen;
  }

  goToProfile(): void {
    this.isUserMenuOpen = false;
    window.location.href = '/profile';
  }

  goToOrders(): void {
    this.isUserMenuOpen = false;
    window.location.href = '/orders';
  }

  logout(): void {
    this.authService.logout();
    this.isUserMenuOpen = false;
  }

  private getUserNameInitials(name: string): string {
    if (!name) return 'U';
    const names = name.split(' ');
    if (names.length >= 2) {
      return (names[0][0] + names[1][0]).toUpperCase();
    }
    return names[0][0].toUpperCase();
  }

  openWhatsApp(): void {
    const message = 'Hola, me gustaría obtener más información';
    const url = `https://wa.me/${this.footerData.companyInfo.phone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  }

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}