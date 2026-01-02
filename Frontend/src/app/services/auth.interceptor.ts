import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';

/**
 * @name AuthInterceptor
 * @description
 * Este interceptor HTTP se encarga de adjuntar el token de autenticación
 * a todas las peticiones salientes a la API de Laravel.
 * Si un token está presente en el AuthService, lo añade al header
 * de Authorization de cada petición.
 */
export const AuthInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  // Si existe el token, clona la petición y añade el header de autorización.
  // Esto asegura que cada petición a la API sea autenticada.
  if (token) {
    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(authReq);
  }

  // Si no hay token, continúa con la petición original.
  return next(req);
};
