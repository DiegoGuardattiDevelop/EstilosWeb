import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';

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

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.orderId = this.route.snapshot.queryParams['orderId'] || 'ORD-' + Date.now();
    
    // Simular datos de orden (en producción vendría del backend)
    this.orderDetails = {
      orderId: this.orderId,
      date: new Date().toLocaleDateString('es-ES'),
      status: 'Pagado',
      total: 1250.00,
      items: [
        { name: 'Camisa Casual', quantity: 1, price: 800.00 },
        { name: 'Pantalón Jeans', quantity: 1, price: 450.00 }
      ],
      shipping: {
        method: 'Envío Estándar',
        address: 'Calle Principal 123, Ciudad, CP 12345',
        estimatedDelivery: '5-7 días hábiles'
      }
    };
  }

  trackOrder() {
    // Lógica para rastrear pedido
    console.log('Rastreando pedido:', this.orderId);
  }

  continueShopping() {
    // Redirigir al home
    window.location.href = '/';
  }
}