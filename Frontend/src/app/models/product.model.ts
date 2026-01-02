// src/app/models/product.model.ts
export interface Product {
image_url: string;
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  image?: string;
  images?: string[];
  category_id?: number;
  slug?: string;
  featured?: boolean;
  active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
  slug?: string;
  image?: string;
  created_at?: string;
  updated_at?: string;
}