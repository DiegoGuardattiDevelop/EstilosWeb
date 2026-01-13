import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors, withFetch } from '@angular/common/http';

import { routes } from './app.routes';
import { AuthInterceptor } from './services/auth.interceptor';
import { OrderService } from './services/order.service';
import { ShippingService } from './services/shipping.service';
// import { AuthGuard } from './auth.guard';


export const appConfig: ApplicationConfig = {
  providers: [
    // Provee las rutas de la aplicación
    provideRouter(routes),

    // Provee el cliente HTTP con el interceptor de autenticación
    provideHttpClient( withFetch(), withInterceptors([AuthInterceptor])),
    
    // Provee el servicio de órdenes
    OrderService,
    
    // Provee el servicio de envío
    ShippingService
  ]
};
