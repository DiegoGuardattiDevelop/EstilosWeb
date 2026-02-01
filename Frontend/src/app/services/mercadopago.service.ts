// src/app/services/mercadopago.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MercadoPagoService {
  private mpScript: HTMLScriptElement | null = null;
  private mp: any = null;
  private mpLoaded$ = new BehaviorSubject<boolean>(false);

  constructor(private http: HttpClient) {
    this.initializeMercadoPago();
  }

  /**
   * Cargar Mercado Pago SDK
   */
  private initializeMercadoPago(): void {
    if (this.mpScript) return;

    const script = document.createElement('script');
    script.src = 'https://sdk.mercadopago.com/js/v2';
    script.async = true;
    script.onload = () => {
      this.mp = (window as any).mp;
      if (this.mp) {
        this.mp.configure({
          publicKey: environment.mercadopagoPublicKey || '',
        });
        this.mpLoaded$.next(true);
      }
    };
    document.head.appendChild(script);
    this.mpScript = script;
  }

  /**
   * Verificar si Mercado Pago está cargado
   */
  isMercadoPagoLoaded(): Observable<boolean> {
    return this.mpLoaded$.asObservable();
  }

  /**
   * Obtener instancia de Mercado Pago
   */
  getMercadoPago(): any {
    return this.mp;
  }

  /**
   * Crear preferencia de pago (Checkout Pro)
   */
  createPreference(preferenceData: any): Observable<any> {
    return this.http.post('/api/mercadopago/preference', preferenceData);
  }

  /**
   * Confirmar pago (Card Form)
   */
  confirmPayment(paymentData: any): Observable<any> {
    return this.http.post('/api/mercadopago/payment', paymentData);
  }

  /**
   * Obtener estado de pago
   */
  getPaymentStatus(paymentId: string): Observable<any> {
    return this.http.get(`/api/mercadopago/payment-status/${paymentId}`);
  }

  /**
   * Crear token de tarjeta (para Card Form)
   */
  async createCardToken(cardData: any): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.mp) {
        reject('Mercado Pago SDK not loaded');
        return;
      }

      this.mp.core.create('cardToken', cardData).then((token: any) => {
        resolve(token);
      }).catch((error: any) => {
        reject(error);
      });
    });
  }

  /**
   * Obtener métodos de pago disponibles
   */
  async getPaymentMethods(): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.mp) {
        reject('Mercado Pago SDK not loaded');
        return;
      }

      this.mp.core.fetchData('/v1/payment_methods', { headers: {} })
        .then((response: any) => {
          resolve(response);
        })
        .catch((error: any) => {
          reject(error);
        });
    });
  }

  /**
   * Obtener cuotas disponibles
   */
  async getInstallments(amount: number, paymentMethodId: string): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.mp) {
        reject('Mercado Pago SDK not loaded');
        return;
      }

      this.mp.core.fetchData('/v1/payment_methods/installments', {
        params: {
          amount: amount,
          payment_method_id: paymentMethodId,
        }
      }).then((response: any) => {
        resolve(response);
      }).catch((error: any) => {
        reject(error);
      });
    });
  }
}
