// src/app/components/footer/footer.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule,
  ],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit, OnDestroy {
  currentYear: number = new Date().getFullYear();
  
  // Propiedades para el carrito
  cartItemCount: number = 0;
  private cartSubscription!: Subscription;
  
  // Propiedades para autenticación
  isAuthenticated: boolean = false;
  userName: string = '';
  userInitials: string = '';
  isUserMenuOpen: boolean = false;
  private authSubscription!: Subscription;

  constructor(
    private cartService: CartService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Suscribirse a cambios del carrito
    this.cartSubscription = this.cartService.getCartItems().subscribe(items => {
      this.cartItemCount = items.reduce((total, item) => total + item.quantity, 0);
    });
    
    // Suscribirse a cambios de autenticación
    this.authSubscription = this.authService.currentUser$.subscribe(user => {
      this.isAuthenticated = !!user;
      if (user) {
        this.userName = user.name || user.email || 'Usuario';
        this.userInitials = this.getUserNameInitials(this.userName);
      } else {
        this.userName = '';
        this.userInitials = '';
      }
    });
  }

  ngOnDestroy(): void {
    if (this.cartSubscription) {
      this.cartSubscription.unsubscribe();
    }
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  // Métodos para el carrito - Usar router en lugar de window.location
  openCart(): void {
    this.router.navigate(['/cart']);
  }

  // Métodos para autenticación
  openLogin(): void {
    this.router.navigate(['/login']);
  }

  toggleUserMenu(): void {
    this.isUserMenuOpen = !this.isUserMenuOpen;
  }

  goToProfile(): void {
    this.isUserMenuOpen = false;
    this.router.navigate(['/profile']);
  }

  goToOrders(): void {
    this.isUserMenuOpen = false;
    this.router.navigate(['/profile'], { queryParams: { section: 'orders' } });
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.isUserMenuOpen = false;
        this.router.navigate(['/home']);
      },
      error: (error) => {
        console.error('Error al cerrar sesión:', error);
      }
    });
  }

  private getUserNameInitials(name: string): string {
    if (!name) return 'U';
    const names = name.trim().split(' ');
    if (names.length >= 2) {
      return (names[0][0] + names[1][0]).toUpperCase();
    }
    return names[0][0].toUpperCase();
  }

  // Método para abrir WhatsApp
  openWhatsApp(): void {
    const message = 'Hola, me gustaría obtener más información sobre sus productos';
    const phoneNumber = '5491112345678'; // Número sin caracteres especiales
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  }

  // Método para scroll al inicio
  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}