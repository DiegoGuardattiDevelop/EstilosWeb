import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  user = {
    name: '',
    email: '',
    password: '',
    password_confirmation: ''
  };
  errorMessage: string = '';
  showError: boolean = false;
  isLoading: boolean = false;

  constructor(private authService: AuthService, private router: Router) { }

  onRegister() {
    // Validaciones básicas
    if (this.user.password !== this.user.password_confirmation) {
      this.errorMessage = 'Las contraseñas no coinciden';
      this.showError = true;
      return;
    }

    if (!this.user.name || !this.user.email || !this.user.password) {
      this.errorMessage = 'Por favor completa todos los campos';
      this.showError = true;
      return;
    }

    this.isLoading = true;
    this.showError = false;
    this.errorMessage = '';

    this.authService.register(this.user).subscribe({
      next: (response) => {
        console.log('Registro exitoso', response);
        this.isLoading = false;
        this.router.navigate(['/profile']);
      },
      error: (error) => {
        console.error('Error en el registro', error);
        this.isLoading = false;
        this.errorMessage = error.message;
        this.showError = true;
        
        // Auto-ocultar el error después de 5 segundos
        setTimeout(() => {
          this.showError = false;
        }, 5000);
      }
    });
  }

  // Método para cerrar el mensaje de error manualmente
  closeError() {
    this.showError = false;
    this.errorMessage = '';
  }
}