// src/app/components/cart-floating-icon/cart-floating-icon.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable, combineLatest, Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import { CartService } from '../../services/cart.service';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-cart-floating-icon',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cart-floating-icon.component.html',
  styleUrls: ['./cart-floating-icon.component.scss']
})
export class CartFloatingIconComponent implements OnInit, OnDestroy {
  cartItemsCount$!: Observable<number>;
  shouldShowIcon$!: Observable<boolean>;
  isGuest$!: Observable<boolean>; // 🆕 Cambiar a Observable
  hasReachedLimit$!: Observable<boolean>; // 🆕 Cambiar a Observable
  isPulsing = false;

  private destroy$ = new Subject<void>();

  constructor(
    private cartService: CartService, 
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.cartItemsCount$ = this.cartService.getTotalItems();
    
    // 🆕 Usar Observables reactivos en lugar de variables estáticas
    this.isGuest$ = this.authService.isAuthenticated$.pipe(
      map(isAuthenticated => !isAuthenticated)
    );
    
    this.hasReachedLimit$ = combineLatest([
      this.cartService.getCartItems(),
      this.isGuest$
    ]).pipe(
      map(([items, isGuest]) => {
        if (!isGuest) return false; // Usuarios logueados no tienen límite
        
        const totalProducts = items.length;
        const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
        return totalProducts >= 2 || totalItems >= 2;
      })
    );
    
    // Determinar si debería mostrar el icono
    this.shouldShowIcon$ = combineLatest([
      this.cartService.getCartItems(),
      this.isGuest$
    ]).pipe(
      map(([items, isGuest]) => {
        // Mostrar icono si: está autenticado O (es invitado y tiene items)
        return !isGuest || items.length > 0;
      })
    );
    
    // Escuchar cuando se agregan productos para animar
    this.cartService.getCartItems()
      .pipe(takeUntil(this.destroy$))
      .subscribe(items => {
        if (items.length > 0) {
          this.animateIcon();
        }
      });
  }

  private animateIcon(): void {
    this.isPulsing = true;
    setTimeout(() => {
      this.isPulsing = false;
    }, 600);
  }

  onCartClick(): void {
    console.log('🛒 Navegando al carrito...');
    this.router.navigate(['/cart']);
  }

  getTooltipMessage(): string {
    // 🆕 Usar valores actuales en lugar de variables obsoletas
    let message = 'Ver carrito de compras';
    
    // Esta función se llama desde el template, pero para ser reactiva
    // es mejor manejarlo en el template con async pipe
    return message;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}