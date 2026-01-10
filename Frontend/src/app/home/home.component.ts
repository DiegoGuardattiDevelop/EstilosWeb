// src/app/home/home.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { CategoryService, Category } from '../services/category.service';
import { Subscription } from 'rxjs';

interface Testimonial {
  name: string;
  age: number;
  message: string;
  stars: number;
}

interface Benefit {
  icon: string;
  title: string;
  description: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit, OnDestroy {
  // Imágenes del directorio public
  readonly IMAGES_PATH = '/assets/';
  
  // Datos mock con imágenes locales
  categories: Category[] = [
    { id: 1, name: 'Mujer', slug: 'mujer', image_url: 'Femenino.png', products_count: 250 },
    { id: 2, name: 'Hombre', slug: 'hombre', image_url: 'Masculino.png', products_count: 180 },
    { id: 3, name: 'Niños', slug: 'ninos', image_url: 'Niños.png', products_count: 120 },
    { id: 4, name: 'Lencería', slug: 'lenceria', image_url: 'Lenceria.png', products_count: 90 },
    { id: 5, name: 'Accesorios', slug: 'accesorios', image_url: 'Accesorios.png', products_count: 75 },
    { id: 6, name: 'Outlet', slug: 'outlet', image_url: 'Outlet.png', products_count: 45 }
  ];

  testimonials: Testimonial[] = [
    { name: 'María González', age: 55, message: 'Encontré mi talle perfecto después de años buscando. La atención es excelente.', stars: 5 },
    { name: 'Carlos Rodríguez', age: 62, message: 'Calidad premium y precios justos. Siempre me asesoran bien.', stars: 5 },
    { name: 'Ana López', age: 48, message: 'Tienda confiable con 40 años. Nunca me fallaron.', stars: 5 }
  ];

  benefits: Benefit[] = [
    { icon: 'users', title: 'Todos los talles', description: 'Encontrá tu medida perfecta, desde XS hasta 6XL.' },
    { icon: 'star', title: 'Calidad premium', description: 'Ropa duradera y cómoda para toda la familia.' },
    { icon: 'map-pin', title: 'Tienda en Pilar', description: 'Visitá nuestra tienda física en Rafael Nuñez 1081.' },
    { icon: 'credit-card', title: 'Pago fácil', description: 'Efectivo, transferencia o WhatsApp.' }
  ];

  // Contacto
  phone = '0351-1234567';
  whatsapp = '5493511234567';

  // Usuario
  isAuthenticated = false;
  user: any = null;
  isMenuOpen = false;
  private authSubscription!: Subscription;

  // Búsqueda
  searchQuery = '';

  constructor(
    private router: Router,
    private authService: AuthService,
    public categoryService: CategoryService
  ) {}

  ngOnInit(): void {
    this.setupAuthListener();
    this.loadCategories();
  }

  ngOnDestroy(): void {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  private setupAuthListener(): void {
    this.authSubscription = this.authService.isAuthenticated$.subscribe(
      (authenticated) => {
        this.isAuthenticated = authenticated;
        if (authenticated) {
          this.loadUserProfile();
        } else {
          this.user = null;
        }
      }
    );
  }

  private loadUserProfile(): void {
    this.authService.getProfile().subscribe({
      next: (userData) => {
        this.user = userData;
      },
      error: (error) => {
        console.error('Error loading user profile:', error);
      }
    });
  }

  private loadCategories(): void {
    this.categoryService.getCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
        this.categoryService.preloadImages(categories);
      },
      error: (error) => {
        console.error('Error loading categories:', error);
      }
    });
  }

  toggleUserMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu(): void {
    this.isMenuOpen = false;
  }

  getUserInitials(): string {
    if (!this.user?.name) return 'U';
    return this.user.name
      .split(' ')
      .map((word: string) => word.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }

  openLogin(): void {
    this.router.navigate(['/login']);
  }

  openRegister(): void {
    this.router.navigate(['/register']);
  }

  onLogout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.closeMenu();
      },
      error: (error) => {
        console.error('Error al cerrar sesión:', error);
        this.closeMenu();
      }
    });
  }

  navigateToProfile(): void {
    this.closeMenu();
    this.router.navigate(['/profile']);
  }

  navigateToCategory(slug: string): void {
    this.router.navigate(['/products-by-category', slug]);
  }

  onSearch(): void {
    if (this.searchQuery.trim()) {
      // Implementar búsqueda
      console.log('Buscar:', this.searchQuery);
    }
  }

  callPhone(): void {
    window.location.href = `tel:${this.phone}`;
  }

  openWhatsApp(): void {
    const message = encodeURIComponent('Hola, necesito ayuda con mi pedido.');
    window.open(`https://wa.me/${this.whatsapp}?text=${message}`, '_blank');
  }

  openWhatsAppCTA(): void {
    const message = encodeURIComponent('¿Me podés ayudar con un pedido?');
    window.open(`https://wa.me/${this.whatsapp}?text=${message}`, '_blank');
  }

  scrollToCategories(): void {
    const element = document.getElementById('categories');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }
}
