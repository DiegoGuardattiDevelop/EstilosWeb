// src/app/services/auth.service.ts
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { User } from '../models/user.model';    


export interface AuthResponse {
  success: boolean;
  access_token: string;
  token_type: string;
  user: User;
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8000/api';

  // Observable para el estado de autenticación
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasToken());
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  // Observable para el usuario actual
  private currentUserSubject = new BehaviorSubject<User | null>(this.getStoredUser());
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }

  private hasToken(): boolean {
    if (isPlatformBrowser(this.platformId)) {
      return !!localStorage.getItem('access_token');
    }
    return false;
  }

  private getStoredUser(): User | null {
    if (isPlatformBrowser(this.platformId)) {
      const userStr = localStorage.getItem('current_user');
      return userStr ? JSON.parse(userStr) : null;
    }
    return null;
  }

  public getToken(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem('access_token');
    }
    return null;
  }

  private setAuthData(token: string, user: User): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('access_token', token);
      localStorage.setItem('current_user', JSON.stringify(user));
    }
    this.isAuthenticatedSubject.next(true);
    this.currentUserSubject.next(user);
  }

  private clearAuthData(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('current_user');
    }
    this.isAuthenticatedSubject.next(false);
    this.currentUserSubject.next(null);
  }

  /**
   * Registra un nuevo usuario en la API de Laravel.
   */
  public register(user: any): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, user)
      .pipe(
        tap((response: AuthResponse) => {
          console.log('🔐 Register - Guardando token y usuario');
          this.setAuthData(response.access_token, response.user);
        }),
        catchError(this.handleRegisterError.bind(this))
      );
  }

  /**
   * Inicia sesión en la API de Laravel.
   */
  public login(credentials: any): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials)
      .pipe(
        tap((response: AuthResponse) => {
          console.log('🔐 Login - Guardando token y usuario');
          this.setAuthData(response.access_token, response.user);
        }),
        catchError(this.handleLoginError.bind(this))
      );
  }

  /**
   * Cierra la sesión del usuario.
   */
  public logout(): Observable<any> {
    // Realizar petición al servidor primero
    return this.http.post(`${this.apiUrl}/logout`, {}).pipe(
      tap(() => {
        // Limpiar datos locales después de éxito en el servidor
        this.clearAuthData();
        this.router.navigate(['/login']);
      }),
      catchError(error => {
        // Limpiar datos locales incluso si hay error en el servidor
        this.clearAuthData();
        this.router.navigate(['/login']);
        return this.handleError(error);
      })
    );
  }

  /**
   * Obtiene el perfil del usuario autenticado.
   */
  public getProfile(): Observable<any> {
    return this.http.get(`${this.apiUrl}/profile`).pipe(
      tap((response: any) => {
        if (response.success && response.user) {
          this.currentUserSubject.next(response.user);
          if (isPlatformBrowser(this.platformId)) {
            localStorage.setItem('current_user', JSON.stringify(response.user));
          }
        }
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Verifica si el usuario está autenticado
   */
  public isLoggedIn(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  /**
   * Obtiene el usuario actual
   */
  public getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Obtiene headers de autenticación para las peticiones HTTP
   */
  public getAuthHeaders(): { [header: string]: string } {
    const token = this.getToken();
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }

  // Los métodos de manejo de errores se mantienen igual que los tuyos
  private handleRegisterError(error: any): Observable<never> {
    console.error('Registration error occurred:', error);
    
    if (error.status === 422 && error.error.errors) {
      const validationErrors = error.error.errors;
      
      if (validationErrors.email) {
        const emailError = validationErrors.email[0];
        if (emailError.includes('already been taken') || emailError.includes('ya ha sido tomado')) {
          return throwError(() => new Error('El correo electrónico ya está registrado'));
        }
        return throwError(() => new Error(emailError));
      }
      
      if (validationErrors.password) {
        return throwError(() => new Error(validationErrors.password[0]));
      }
      
      if (validationErrors.name) {
        return throwError(() => new Error(validationErrors.name[0]));
      }
      
      const firstError = Object.values(validationErrors)[0];
      const errorMessage = Array.isArray(firstError) ? firstError[0] : firstError;
      return throwError(() => new Error(errorMessage));
    }
    
    return this.handleCommonErrors(error, 'registro');
  }

  private handleLoginError(error: any): Observable<never> {
    console.error('Login error occurred:', error);
    
    if (error.status === 401) {
      return throwError(() => new Error('Credenciales incorrectas. Verifica tu email y contraseña.'));
    }
    
    if (error.status === 422 && error.error.errors) {
      const validationErrors = error.error.errors;
      const firstError = Object.values(validationErrors)[0];
      const errorMessage = Array.isArray(firstError) ? firstError[0] : firstError;
      return throwError(() => new Error(errorMessage));
    }
    
    return this.handleCommonErrors(error, 'inicio de sesión');
  }

  private handleCommonErrors(error: any, context: string): Observable<never> {
    const errorMap: { [key: number]: string } = {
      0: `Error de conexión. Verifica tu internet e intenta el ${context} nuevamente.`,
      400: `Datos de ${context} inválidos.`,
      404: `Servicio de ${context} no disponible.`,
      409: `El usuario ya existe.`,
      429: `Demasiados intentos. Por favor espera unos minutos.`,
      500: `Error del servidor. Por favor intenta el ${context} más tarde.`,
      503: `Servicio no disponible temporalmente.`
    };
    
    const errorMessage = errorMap[error.status] || 
                        error.error?.message || 
                        error.message || 
                        `Error desconocido en el ${context}`;
    
    return throwError(() => new Error(errorMessage));
  }

  private handleError(error: any): Observable<never> {
    console.error('An error occurred:', error);
    
    if (error.status === 422 && error.error.errors) {
      const validationErrors = error.error.errors;
      const firstError = Object.values(validationErrors)[0];
      const errorMessage = Array.isArray(firstError) ? firstError[0] : firstError;
      return throwError(() => new Error(errorMessage));
    }
    
    const errorMessage = error.error?.message || error.message || 'Server error';
    return throwError(() => new Error(errorMessage));
  }
}