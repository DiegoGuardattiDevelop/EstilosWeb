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

  private orderService = inject(OrderService);
  
  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.orderId = this.route.snapshot.paramMap.get('orderId') || '';
    
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

  trackOrder() {
    // Navegar a la página de seguimiento de pedido
    this.router.navigate(['/order-tracking', this.orderId]);
  }

  continueShopping() {
    this.router.navigate(['/']);
  }
}