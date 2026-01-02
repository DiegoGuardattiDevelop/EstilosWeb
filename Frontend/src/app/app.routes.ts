import { Routes } from '@angular/router';
import { AuthGuard } from './auth.guard';
// import { WelcomeComponent } from './components/welcome/welcome.component';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { ProfileComponent } from './components/profile/profile.component';
import { ProductsByCategoryComponent } from './products-by-category/products-by-category.component';
import { ProductDetailComponent } from './components/product-detail/product-detail.component';
import { CartComponent } from './cart/cart.component';
import { CheckoutComponent } from './components/checkout/checkout.component';
import { FormsModule } from '@angular/forms';
export const routes: Routes = [
  // Ruta de bienvenida, que será la primera que se vea.
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  
  // Ruta principal que muestra las categorías (la antigua lógica de "tienda").
  { path: 'home', component: HomeComponent },
  
  // Ruta para ver los productos de una categoría específica.
  { path: 'products-by-category/:slug', component: ProductsByCategoryComponent },
  { path: 'product/:slug', component: ProductDetailComponent },
  { path: 'cart/:slug', component: CartComponent }, // Ruta del carrito con slug opcional
  { path: 'cart', component: CartComponent },
  { path: 'checkout', component: CheckoutComponent, canActivate: [AuthGuard] },
  { path: 'order-confirmation', component: HomeComponent }, // Temporalmente redirige a home, crear OrderConfirmationComponent después
  // Rutas de autenticación.
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  
  // Ruta de perfil protegida por el guardia de autenticación.
  { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard] },
  
  // Si no se encuentra ninguna ruta, redirige a la ruta de bienvenida.
  { path: '**', redirectTo: '' }
];
