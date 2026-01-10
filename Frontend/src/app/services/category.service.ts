// src/app/services/category.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface Category {
  id: number;
  name: string;
  slug: string;
  image_url?: string;
  description_short?: string;
  description_long?: string;
  color?: string;
  text_color?: string;
  products_count?: number;
}

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private apiUrl = `${environment.apiUrl}/categories`;
  private cache$: Observable<Category[]> | null = null;

  constructor(private http: HttpClient) { }

  /**
   * Obtiene todas las categorías desde el backend o desde el caché
   */
  getCategories(): Observable<Category[]> {
    // Si ya tenemos datos en caché, los devolvemos
    if (this.cache$) {
      return this.cache$;
    }

    // Si no hay caché, hacemos la petición al backend
    this.cache$ = this.http.get<Category[]>(this.apiUrl).pipe(
      map(categories => {
        // Preprocesar las categorías si es necesario
        return categories.map(category => ({
          ...category,
          // Asegurarse de que el slug esté en minúsculas
          slug: category.slug ? category.slug.toLowerCase() : ''
        }));
      }),
      catchError(error => {
        console.error('Error loading categories:', error);
        // Devolver datos mock en caso de error
        return of(this.getMockCategories());
      })
    );

    return this.cache$;
  }

  /**
   * Obtiene una categoría específica por su slug
   */
  getCategoryBySlug(slug: string): Observable<Category | undefined> {
    return this.getCategories().pipe(
      map(categories => categories.find(category => category.slug === slug.toLowerCase()))
    );
  }

  /**
   * Genera la URL completa para una categoría
   */
  getCategoryUrl(slug: string): string {
    return `/products-by-category/${slug}`;
  }

  /**
   * Obtiene la URL de la imagen de una categoría
   */
  getCategoryImageUrl(imageUrl: string | undefined): string {
    if (!imageUrl) {
      return '/assets/images/placeholder.jpg';
    }

    // Si es una URL completa, devolverla directamente
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }

    // Si es una ruta relativa, construir la URL completa
    if (imageUrl.startsWith('storage/')) {
      return `${environment.apiUrl.replace('/api', '')}/${imageUrl}`;
    }

    // Por defecto, asumir que está en storage
    return `${environment.apiUrl.replace('/api', '')}/storage/categories/${imageUrl}`;
  }

  /**
   * Limpia el caché de categorías
   */
  clearCache(): void {
    this.cache$ = null;
  }

  /**
   * Datos mock para usar en caso de error o durante el desarrollo
   */
  private getMockCategories(): Category[] {
    return [
      { id: 1, name: 'Mujer', slug: 'mujer', image_url: 'Femenino.png', products_count: 250 },
      { id: 2, name: 'Hombre', slug: 'hombre', image_url: 'Masculino.png', products_count: 180 },
      { id: 3, name: 'Niños', slug: 'ninos', image_url: 'Niños.png', products_count: 120 },
      { id: 4, name: 'Lencería', slug: 'lenceria', image_url: 'Lenceria.png', products_count: 90 },
      { id: 5, name: 'Accesorios', slug: 'accesorios', image_url: 'Accesorios.png', products_count: 75 },
      { id: 6, name: 'Outlet', slug: 'outlet', image_url: 'Outlet.png', products_count: 45 }
    ];
  }

  /**
   * Precarga las imágenes de las categorías para mejorar el rendimiento
   */
  preloadImages(categories: Category[]): void {
    if (typeof window !== 'undefined') {
      categories.forEach(category => {
        if (category.image_url) {
          const img = new Image();
          img.src = this.getCategoryImageUrl(category.image_url);
        }
      });
    }
  }
}