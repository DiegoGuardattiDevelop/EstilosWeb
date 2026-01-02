import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from './services/auth.service';
import { map, take, tap } from 'rxjs/operators';

export const AuthGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  console.log('🛡️ AuthGuard ejecutado para:', state.url);

  return authService.isAuthenticated$.pipe(
    take(1),
    tap(isAuthenticated => {
      console.log('🛡️ Estado de autenticación:', isAuthenticated);
      console.log('🛡️ Token en localStorage:', authService.getToken());
    }),
    map(isAuthenticated => {
      if (isAuthenticated) {
        console.log('🛡️ Acceso permitido a /profile');
        return true;
      } else {
        console.log('🛡️ Acceso denegado - redirigiendo a /login');
        router.navigate(['/login']);
        return false;
      }
    })
  );
};