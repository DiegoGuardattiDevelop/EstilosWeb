import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  credentials = {
    email: '',
    password: ''
  };
  errorMessage: string = '';
  isLoading: boolean = false;

  constructor(private authService: AuthService, private router: Router) { }

  onLogin() {
    this.isLoading = true;
    this.errorMessage = '';

    this.authService.login(this.credentials).subscribe({
      next: (response) => {
        console.log('✅ Login exitoso', response);
        this.isLoading = false;
        
        // Esperar un poco para que el estado de autenticación se actualice
        setTimeout(() => {
          console.log('🔄 Intentando navegar a /profile...');
          this.router.navigate(['/profile']).then(success => {
            if (success) {
              console.log('✅ Navegación a /profile exitosa');
            } else {
              console.error('❌ Falló la navegación a /profile');
              // Intentar navegar al home como fallback
              this.router.navigate(['/']);
            }
          }).catch(error => {
            console.error('❌ Error en navegación:', error);
            this.router.navigate(['/']);
          });
        }, 200);
      },
      error: (error) => {
        console.error('❌ Error en login:', error);
        this.isLoading = false;
        this.errorMessage = error.message || 'Credenciales incorrectas. Por favor, inténtalo de nuevo.';
      }
    });
  }
}