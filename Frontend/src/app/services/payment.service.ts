// src/app/services/payment.service.ts
import { Injectable } from '@angular/core';
import { loadStripe, Stripe, StripeElements, StripeCardElement } from '@stripe/stripe-js';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private stripePromise: Promise<Stripe | null>;
  private stripe: Stripe | null = null;

  constructor(private http: HttpClient) {
    this.stripePromise = loadStripe(environment.stripePublishableKey);
  }

  async getStripe(): Promise<Stripe | null> {
    if (!this.stripe) {
      this.stripe = await this.stripePromise;
    }
    return this.stripe;
  }

  createPaymentIntent(amount: number, currency: string = 'usd'): Observable<any> {
    return this.http.post('/api/create-payment-intent', {
      amount: amount * 100, // Stripe expects amount in cents
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