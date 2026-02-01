// src/app/services/payment.service.ts
import { Injectable } from '@angular/core';


import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {

  constructor(private http: HttpClient) {}

  createPaymentIntent(amount: number, currency: string = 'usd'): Observable<any> {
    return this.http.post('/api/create-payment-intent', {
      amount: amount * 100,
      currency
    });
  }

  confirmPayment(clientSecret: string, paymentMethod: any): Observable<any> {
    return this.http.post('/api/confirm-payment', {
      clientSecret,
      paymentMethod
    });
  }
}