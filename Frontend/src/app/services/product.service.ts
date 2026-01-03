// src/app/services/product.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { Product } from '../models/product.model';
import { environment } from '../../environments/environment';
/**
 * Interface que representa un producto.
 * Asegúrate de que las propiedades coincidan con la estructura de tu API.
 */
// export interface Product {
//   id: number;
//   name: string;
//   slug: string;
//   description: string;
//   description_short: string;
//   price: number;
//   stock: number;
//   image_url: string;
//   category_id: number;
//   category?: {
//     id: number;
//     name: string;
//     color: string;
//   };
//   created_at?: string;
//   updated_at?: string;
// }

/**
 * Interface para la respuesta de una API con paginación.
 * Adapta esto si tu API no retorna un objeto con `data`.
 */
export interface PaginatedProductsResponse {
  data: Product[];
  current_page: number;
  last_page: number;
  total: number;
  links: { url: string | null; label: string; active: boolean }[];
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;

}

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/products`;

  /**
   * Obtiene un producto individual por su slug.
   * @param slug El slug del producto.
   * @returns Un Observable con los datos del producto.
   */
  getProductBySlug(slug: string): Observable<Product> {
    console.log('🔍 Buscando producto con slug:', slug);
    
    const url = `${this.apiUrl}/slug/${slug}`;
    console.log('📡 URL de la API:', url);
    
    return this.http.get<{success: boolean, data: Product}>(url).pipe(
      tap(response => console.log('✅ Respuesta completa de la API:', response)),
      map(response => {
        if (response.success && response.data) {
          console.log('✅ Producto extraído:', response.data);
          return response.data;
        } else {
          throw new Error('Producto no encontrado');
        }
      }),
      tap(product => console.log('🎯 Producto final para el componente:', product)),
      catchError(error => {
        console.error('❌ Error en la API:', error);
        console.error('📋 Status:', error.status);
        console.error('📋 Mensaje:', error.message);
        return throwError(() => error);
      })
    );
  }

  /**
   * Obtiene un producto individual por su ID.
   * @param id El ID del producto.
   * @returns Un Observable con los datos del producto.
   */
  getProductById(id: number): Observable<Product> {
    console.log('🔍 Buscando producto con ID:', id);
    
    const url = `${this.apiUrl}/${id}`;
    console.log('📡 URL de la API:', url);
    
    return this.http.get<{success: boolean, data: Product}>(url).pipe(
      map(response => {
        if (response.success && response.data) {
          return response.data;
        } else {
          throw new Error('Producto no encontrado');
        }
      }),
      catchError(error => {
        console.error('❌ Error en la API:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Obtiene todos los productos filtrados por un slug de categoría.
   * @param categorySlug El slug de la categoría a filtrar.
   * @returns Un Observable con la lista de productos.
   */
  getProductsByCategory(categorySlug: string): Observable<PaginatedProductsResponse> {
    console.log('🔍 Buscando productos de categoría:', categorySlug);
    
    const params = new HttpParams().set('category_slug', categorySlug);
    return this.http.get<PaginatedProductsResponse>(this.apiUrl, { params }).pipe(
      tap(response => console.log('✅ Productos encontrados:', response.data?.length)),
      catchError(error => {
        console.error('❌ Error fetching products by category:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Obtiene una lista paginada y filtrada de productos.
   * @param categorySlug Slug de la categoría para filtrar.
   * @param searchTerm Término de búsqueda.
   * @param minPrice Precio mínimo.
   * @param maxPrice Precio máximo.
   * @param sortBy Campo para ordenar.
   * @param sortOrder Dirección de orden.
   * @param page Número de página actual.
   * @param perPage Cantidad de productos por página.
   * @returns Un Observable con la respuesta de productos paginados.
   */
  getProducts(
    categorySlug?: string | null,
    searchTerm?: string | null,
    minPrice?: number | null,
    maxPrice?: number | null,
    sortBy: string = 'created_at',
    sortOrder: 'asc' | 'desc' = 'desc',
    page: number = 1,
    perPage: number = 12
  ): Observable<PaginatedProductsResponse> {
    console.log('🔍 Buscando productos con filtros:', {
      categorySlug, searchTerm, minPrice, maxPrice, sortBy, sortOrder, page, perPage
    });

    let params = new HttpParams();
    
    if (categorySlug) {
      params = params.set('category_slug', categorySlug);
    }
    if (searchTerm) {
      params = params.set('search', searchTerm);
    }
    if (minPrice !== null && minPrice !== undefined) {
      params = params.set('min_price', minPrice.toString());
    }
    if (maxPrice !== null && maxPrice !== undefined) {
      params = params.set('max_price', maxPrice.toString());
    }
    params = params.set('sort_by', sortBy);
    params = params.set('sort_order', sortOrder);
    params = params.set('page', page.toString());
    params = params.set('per_page', perPage.toString());

    return this.http.get<PaginatedProductsResponse>(this.apiUrl, { params }).pipe(
      tap(response => console.log('✅ Productos encontrados:', response.data?.length)),
      catchError(error => {
        console.error('❌ Error fetching products:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Obtiene todos los productos sin paginación (para búsquedas, filtros simples, etc.)
   * @returns Un Observable con todos los productos.
   */
  getAllProducts(): Observable<Product[]> {
    console.log('🔍 Obteniendo todos los productos');
    
    return this.http.get<{data: Product[]}>(this.apiUrl).pipe(
      map(response => response.data),
      tap(products => console.log('✅ Total de productos:', products.length)),
      catchError(error => {
        console.error('❌ Error fetching all products:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Busca productos por término de búsqueda
   * @param query Término de búsqueda
   * @returns Un Observable con los productos que coinciden
   */
  searchProducts(query: string): Observable<Product[]> {
    console.log('🔍 Buscando productos con query:', query);
    
    const params = new HttpParams().set('search', query);
    return this.http.get<{data: Product[]}>(this.apiUrl, { params }).pipe(
      map(response => response.data),
      tap(products => console.log('✅ Productos encontrados en búsqueda:', products.length)),
      catchError(error => {
        console.error('❌ Error searching products:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Obtiene productos relacionados (misma categoría)
   * @param productId ID del producto actual
   * @param categoryId ID de la categoría
   * @param limit Límite de productos relacionados
   * @returns Un Observable con productos relacionados
   */
  getRelatedProducts(productId: number, categoryId: number, limit: number = 4): Observable<Product[]> {
    console.log('🔍 Buscando productos relacionados:', { productId, categoryId, limit });
    
    const params = new HttpParams()
      .set('category_id', categoryId.toString())
      .set('exclude', productId.toString())
      .set('limit', limit.toString());

    return this.http.get<{data: Product[]}>(this.apiUrl, { params }).pipe(
      map(response => response.data),
      tap(products => console.log('✅ Productos relacionados encontrados:', products.length)),
      catchError(error => {
        console.error('❌ Error fetching related products:', error);
        return throwError(() => error);
      })
    );
  }
}