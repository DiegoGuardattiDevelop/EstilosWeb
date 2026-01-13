import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { OrderService } from './../../services/order.service';

@Component({
  selector: 'app-order-confirmation',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './order-confirmation.component.html',
  styleUrls: ['./order-confirmation.component.scss']
})
export class OrderConfirmationComponent implements OnInit {
  orderId: string = '';
  orderDetails: any = null;
  isLoading: boolean = true;
  errorMessage: string = '';
  orderNumber: string = '';
  orderDate: string = '';
  estimatedDelivery: string = '';

  private orderService = inject(OrderService);
  
  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    // Obtener el ID de la orden de los parámetros de ruta o query params
    this.orderId = this.route.snapshot.paramMap.get('orderId') ||
                  this.route.snapshot.queryParamMap.get('orderId') || '';
    
    if (this.orderId) {
      this.loadOrderDetails();
    } else {
      this.errorMessage = 'No se encontró el número de orden';
      this.isLoading = false;
    }
  }

  loadOrderDetails() {
    this.orderService.getOrderDetails(this.orderId).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.orderDetails = response.order;
          this.orderNumber = this.orderDetails.order_number || this.orderId;
          this.orderDate = this.formatDate(this.orderDetails.created_at);
          this.estimatedDelivery = this.calculateEstimatedDelivery(this.orderDetails.shipping_method?.estimatedDays);
        } else {
          this.errorMessage = response.message || 'Error al cargar los detalles del pedido';
        }
        this.isLoading = false;
      },
      error: (error: any) => {
        this.errorMessage = 'Error al conectar con el servidor';
        this.isLoading = false;
        console.error('Error loading order details:', error);
      }
    });
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  calculateEstimatedDelivery(days: number = 7): string {
    if (!days) return 'Calculando...';
    
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  trackOrder() {
    // Navegar a la página de seguimiento de pedido
    this.router.navigate(['/order-tracking', this.orderId]);
  }

  continueShopping() {
    this.router.navigate(['/']);
  }
}