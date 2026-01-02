// src/app/models/cart-item.model.ts
import { Product } from './product.model';

export interface CartItem {
  id: number;
  product: Product;
  quantity: number;
  price: number;
  
  // Campos opcionales para compatibilidad con API
  product_id?: number;
  user_id?: number;
  created_at?: string;
  updated_at?: string;
}