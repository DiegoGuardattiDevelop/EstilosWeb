import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  user: any;
  loading: boolean = true;
  errorMessage: string = '';
  showError: boolean = false;

  constructor(private authService: AuthService, public router: Router) { }

  ngOnInit(): void {
    this.loadUserProfile();
  }

  private loadUserProfile(): void {
    console.log('🔍 Iniciando carga de perfil...');
    
    this.authService.getProfile().subscribe({
      next: (response: any) => {
        console.log('✅ Respuesta del perfil:', response);
        
        // Manejar la estructura de respuesta de tu API
        if (response.success && response.user) {
          this.user = response.user;
        } else if (response.user) {
          this.user = response.user;
        } else {
          this.user = response;
        }
        
        this.loading = false;
        this.showError = false;
        console.log('✅ Usuario cargado:', this.user);
      },
      error: (error: any) => {
        console.error('❌ Error al obtener el perfil', error);
        this.loading = false;
        
        if (error.status === 401) {
          this.errorMessage = 'Tu sesión ha expirado. Por favor inicia sesión nuevamente.';
          this.showError = true;
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 3000);
        } else {
          this.errorMessage = error.message || 'Error al cargar el perfil. Intenta nuevamente.';
          this.showError = true;
        }
      }
    });
  }

  onLogout() {
    this.authService.logout().subscribe({
      next: (response: any) => {
        console.log('Logout exitoso', response);
        this.router.navigate(['/']);
      },
      error: (error: any) => {
        console.error('Error al cerrar sesión', error);
        // Forzar redirección incluso si hay error
        this.router.navigate(['/']);
      }
    });
  }

  // Método para formatear la fecha de registro
  getMemberSince(): string {
    if (!this.user?.created_at) return 'Enero 2023';
    
    try {
      const date = new Date(this.user.created_at);
      return date.toLocaleDateString('es-ES', { 
        year: 'numeric', 
        month: 'long' 
      });
    } catch {
      return 'Enero 2023';
    }
  }

  // Método para obtener iniciales del usuario
  getUserInitials(): string {
    if (!this.user?.name) return 'U';
    return this.user.name
      .split(' ')
      .map((word: string) => word.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }

  // Método para cerrar mensaje de error manualmente
  closeError(): void {
    this.showError = false;
    this.errorMessage = '';
  }

  // Método para navegar al home
  goToHome(): void {
    this.router.navigate(['/']);
  }
}