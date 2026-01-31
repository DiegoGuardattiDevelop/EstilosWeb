import { Routes } from '@angular/router';
import { AuthGuard } from './auth.guard';
import { HomeComponent } from './home/home.component';
import { ProductsByCategoryComponent } from './products-by-category/products-by-category.component';

export const routes: Routes = [
  // Ruta de bienvenida, que será la primera que se vea.
  { path: '', redirectTo: 'home', pathMatch: 'full' },
   
  // Ruta principal que muestra las categorías (la antigua lógica de "tienda").
  { path: 'home', component: HomeComponent },
  
  // Ruta para ver los productos de una categoría específica.
  { path: 'products-by-category/:slug', component: ProductsByCategoryComponent },
  
  // Lazy Loading: ProductDetail (usado frecuentemente pero no en home)
  {
    path: 'product/:slug',
    loadComponent: () => import('./components/product-detail/product-detail.component').then(m => m.ProductDetailComponent)
  },
  
  // Lazy Loading: CartComponent
  {
    path: 'cart/:slug',
    loadComponent: () => import('./cart/cart.component').then(m => m.CartComponent)
  },
  {
    path: 'cart',
    loadComponent: () => import('./cart/cart.component').then(m => m.CartComponent)
  },
  
  // Lazy Loading: Checkout (protegido, usado solo alfinalizar compra)
  {
    path: 'checkout',
    loadComponent: () => import('./components/checkout/checkout.component').then(m => m.CheckoutComponent),
    canActivate: [AuthGuard]
  },
  
  // Lazy Loading: OrderConfirmation (usado solo después de comprar)
  {
    path: 'order-confirmation/:orderId',
    loadComponent: () => import('./components/order-confirmation/order-confirmation.component').then(m => m.OrderConfirmationComponent)
  },
  
  // Lazy Loading: OrderTracking (protegido)
  {
    path: 'order-tracking/:orderId',
    loadComponent: () => import('./components/order-tracking/order-tracking.component').then(m => m.OrderTrackingComponent),
    canActivate: [AuthGuard]
  },
  
  // Lazy Loading: Auth (login/register/profile)
  {
    path: 'login',
    loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./components/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'profile',
    loadComponent: () => import('./components/profile/profile.component').then(m => m.ProfileComponent),
    canActivate: [AuthGuard]
  },
  
  // Si no se encuentra ninguna ruta, redirige a la ruta de bienvenida.
  { path: '**', redirectTo: '' }
];
