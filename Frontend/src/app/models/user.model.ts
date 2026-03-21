// src/app/models/user.model.ts
export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  province?: string;
  email_verified_at?: string;
  created_at: string;
  updated_at: string;
  orders_count?: number;
}