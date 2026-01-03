// src/app/services/category.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { tap, catchError, shareReplay, map } from 'rxjs/operators'; // Se agregó 'map'
import { environment } from '../../environments/environment';

export interface Category {
  id: number;
  name: string;
  slug: string;
  image_url: string;
  description_short: string;
  description_long: string;
  color: string;
  text_color: string;
}

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private apiUrl = `${environment.apiUrl}/categories`;
  private cache$: Observable<Category[]> | null = null;

  constructor(private http: HttpClient) {}

  getCategories(): Observable<Category[]> {
    if (this.cache$) {
      return this.cache$;
    }

    this.cache$ = this.http.get<Category[]>(this.apiUrl).pipe(
      tap(categories => {
        this.preloadImages(categories);
      }),
      shareReplay(1),
      catchError(error => {
        this.cache$ = null;
        return throwError(() => error);
      })
    );
    return this.cache$;
  }

  // 👇 Método corregido: devuelve un Observable<Category | undefined>
  getCategoryBySlug(slug: string): Observable<Category | undefined> {
    return this.getCategories().pipe(
      map(categories => categories.find(category => category.slug === slug))
    );
  }

  private preloadImages(categories: Category[]): void {
    if (typeof window !== 'undefined') {
      categories.forEach(category => {
        const img = new Image();
        img.src = category.image_url;
      });
    }
  }

  clearCache(): void {
    this.cache$ = null;
  }
}