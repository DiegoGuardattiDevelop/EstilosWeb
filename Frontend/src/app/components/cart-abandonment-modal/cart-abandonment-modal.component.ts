import { Component, EventEmitter, Output, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-cart-abandonment-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal-overlay" *ngIf="isOpen" (click)="onOverlayClick($event)">
      <div class="modal-container" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <div class="modal-icon">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
        </div>
        
        <h2 id="modal-title" class="modal-title">¿Estás seguro de irte?</h2>
        
        <p class="modal-message">
          Tu carrito tiene productos reservados. Si sales ahora, podrías perderlos.
        </p>
        
        <div class="modal-discount" *ngIf="showDiscount">
          <span class="discount-badge">🎁 Oferta especial</span>
          <p>¡Completa tu compra en las próximas 2 horas y obtén un <strong>10% de descuento</strong>!</p>
        </div>
        
        <div class="modal-actions">
          <button 
            class="btn btn-secondary" 
            (click)="onStay()" 
            autofocus>
            Quedarme en checkout
          </button>
          <button 
            class="btn btn-primary" 
            (click)="onLeave()">
            Salir del checkout
          </button>
        </div>
        
        <p class="modal-note">
          <small>No te mostraremos este mensaje de nuevo en esta sesión.</small>
        </p>
      </div>
    </div>
  `,
  styles: [`
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.6);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      animation: fadeIn 0.2s ease-out;
    }

    .modal-container {
      background: white;
      border-radius: 16px;
      padding: 32px;
      max-width: 420px;
      width: 90%;
      text-align: center;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      animation: slideUp 0.3s ease-out;
    }

    .modal-icon {
      width: 64px;
      height: 64px;
      margin: 0 auto 20px;
      color: #f59e0b;
    }

    .modal-icon svg {
      width: 100%;
      height: 100%;
    }

    .modal-title {
      font-size: 1.5rem;
      font-weight: 700;
      color: #1f2937;
      margin: 0 0 12px;
    }

    .modal-message {
      color: #6b7280;
      margin: 0 0 20px;
      line-height: 1.6;
    }

    .modal-discount {
      background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
      border-radius: 12px;
      padding: 16px;
      margin-bottom: 24px;
    }

    .discount-badge {
      display: inline-block;
      background: #f59e0b;
      color: white;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 600;
      margin-bottom: 8px;
    }

    .modal-discount p {
      margin: 8px 0 0;
      color: #92400e;
      font-size: 0.9rem;
    }

    .modal-actions {
      display: flex;
      gap: 12px;
      justify-content: center;
      flex-wrap: wrap;
    }

    .btn {
      padding: 12px 24px;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      border: none;
      font-size: 1rem;
    }

    .btn-secondary {
      background: #f3f4f6;
      color: #374151;
    }

    .btn-secondary:hover {
      background: #e5e7eb;
    }

    .btn-primary {
      background: #2563eb;
      color: white;
    }

    .btn-primary:hover {
      background: #1d4ed8;
    }

    .modal-note {
      margin-top: 16px;
      color: #9ca3af;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes slideUp {
      from { 
        opacity: 0;
        transform: translateY(20px);
      }
      to { 
        opacity: 1;
        transform: translateY(0);
      }
    }

    @media (max-width: 480px) {
      .modal-container {
        padding: 24px;
        margin: 16px;
      }
      
      .modal-actions {
        flex-direction: column;
      }
      
      .btn {
        width: 100%;
      }
    }
  `]
})
export class CartAbandonmentModalComponent {
  @Output() confirmedLeave = new EventEmitter<void>();
  @Output() confirmedStay = new EventEmitter<void>();

  isOpen = false;
  showDiscount = true;
  private hasShownModal = false;
  private userHasInteracted = false;

  constructor(private router: Router) {}

  /**
   * Abre el modal si no se ha mostrado antes en esta sesión
   */
  open(): void {
    const sessionKey = 'cart_abandonment_modal_shown';
    const wasShown = sessionStorage.getItem(sessionKey);

    if (!wasShown && !this.hasShownModal) {
      this.isOpen = true;
      this.hasShownModal = true;
      this.userHasInteracted = false;
      document.body.style.overflow = 'hidden';
    }
  }

  /**
   * Cierra el modal sin confirmar salida
   */
  onStay(): void {
    this.isOpen = false;
    document.body.style.overflow = '';
    this.confirmedStay.emit();
    this.userHasInteracted = true;
  }

  /**
   * Confirma la salida del checkout
   */
  onLeave(): void {
    this.isOpen = false;
    document.body.style.overflow = '';
    this.confirmedLeave.emit();
    
    // Marcar como mostrado para no mostrar en la misma sesión
    sessionStorage.setItem('cart_abandonment_modal_shown', 'true');
  }

  /**
   * Maneja el click en el overlay
   */
  onOverlayClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.onStay();
    }
  }

  /**
   * Resetea el estado del modal (para nueva sesión)
   */
  reset(): void {
    this.hasShownModal = false;
    this.isOpen = false;
  }

  /**
   * Verifica si el modal fue mostrado en esta sesión
   */
  wasShownInSession(): boolean {
    return this.hasShownModal;
  }
}
