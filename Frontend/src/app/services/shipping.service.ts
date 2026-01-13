import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

interface ShippingMethod {
  id: string;
  name: string;
  description: string;
  cost: number;
  estimatedDays: number;
  isFree: boolean;
}

interface ShippingRequest {
  country?: string;
  state?: string;
  city?: string;
  zipCode?: string;
  cartTotal?: number;
}

interface ShippingCostRequest {
  shippingMethod: string;
  country: string;
  state?: string;
  city?: string;
  zipCode?: string;
  cartTotal: number;
}

interface ShippingCostResponse {
  shippingCost: number;
  estimatedDays: number;
  isFree: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ShippingService {
  private apiUrl = `${environment.apiUrl}/shipping-methods`;

  constructor(private http: HttpClient) { }

  /**
   * Obtener métodos de envío disponibles
   */
  getShippingMethods(params?: ShippingRequest): Observable<ShippingMethod[]> {
    return this.http.get<ShippingMethod[]>(this.apiUrl, { params: params as any });
  }

  /**
   * Calcular costo de envío para un método específico
   */
  calculateShippingCost(data: ShippingCostRequest): Observable<ShippingCostResponse> {
    return this.http.post<ShippingCostResponse>(`${environment.apiUrl}/calculate-shipping`, data);
  }

  /**
   * Obtener método de envío por ID
   */
  getShippingMethodById(methods: ShippingMethod[], id: string): ShippingMethod | undefined {
    return methods.find(method => method.id === id);
  }

  /**
   * Calcular fecha estimada de entrega
   */
  calculateEstimatedDeliveryDate(days: number): string {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toLocaleDateString('es-ES', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }
}