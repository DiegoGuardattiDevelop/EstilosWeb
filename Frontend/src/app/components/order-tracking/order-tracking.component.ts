import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { OrderService } from '../../services/order.service';

@Component({
  selector: 'app-order-tracking',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './order-tracking.component.html',
  styleUrls: ['./order-tracking.component.scss']
})
export class OrderTrackingComponent implements OnInit {
  orderId: string = '';
  orderDetails: any = null;
  trackingStatus: string = 'loading';
  isLoading: boolean = true;
  errorMessage: string = '';
  
  private orderService = inject(OrderService);

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.orderId = this.route.snapshot.paramMap.get('orderId') || '';
    
    if (this.orderId) {
      this.loadOrderTracking();
    } else {
      this.errorMessage = 'No se encontró el número de orden';
      this.isLoading = false;
      this.trackingStatus = 'error';
    }
  }

  loadOrderTracking() {
    this.orderService.trackOrder(this.orderId).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.orderDetails = response.order;
          this.trackingStatus = response.order.status;
        } else {
          this.errorMessage = response.message || 'Error al cargar el seguimiento del pedido';
          this.trackingStatus = 'error';
        }
        this.isLoading = false;
      },
      error: (error: any) => {
        this.errorMessage = 'Error al conectar con el servidor';
        this.isLoading = false;
        this.trackingStatus = 'error';
        console.error('Error loading order tracking:', error);
      }
    });
  }

  getStatusText(status: string): string {
    const statuses: { [key: string]: string } = {
      'pending': 'Pendiente',
      'confirmed': 'Confirmado',
      'processing': 'Procesando',
      'shipped': 'Enviado',
      'delivered': 'Entregado',
      'cancelled': 'Cancelado'
    };
    return statuses[status] || status;
  }

  getStatusIcon(status: string): string {
    const icons: { [key: string]: string } = {
      'pending': 'fas fa-clock',
      'confirmed': 'fas fa-check-circle',
      'processing': 'fas fa-sync-alt fa-spin',
      'shipped': 'fas fa-truck',
      'delivered': 'fas fa-box-open',
      'cancelled': 'fas fa-times-circle'
    };
    return icons[status] || 'fas fa-question-circle';
  }

  continueShopping() {
    window.location.href = '/';
  }

  contactSupport() {
    window.location.href = 'mailto:soporte@estilosweb.com';
  }
}
