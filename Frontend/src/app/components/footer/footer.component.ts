// src/app/components/footer/footer.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http'; // ✅ Solo HttpClient
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

interface FooterData {
  companyInfo: {
    name: string;
    description: string;
    phone: string;
    email: string;
    address: string;
  };
  socialLinks: SocialLink[];
  quickLinks: QuickLink[];
}

interface SocialLink {
  name: string;
  url: string;
  icon: string;
}

interface QuickLink {
  name: string;
  route: string;
  icon: string;
}

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule,
    // ❌ QUITAR HttpClientModule de aquí - se importa a nivel de app
  ],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit {
  footerData: FooterData = this.getDefaultData();
  currentYear: number = new Date().getFullYear();
  isLoading: boolean = false;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    // this.loadFooterData();
    this.footerData = this.getDefaultData(); 
  }

  private loadFooterData(): void {
    this.isLoading = true;
    
    this.http.get<FooterData>('/api/footer-data').pipe(
      catchError(error => {
        console.error('Error loading footer data:', error);
        return of(this.getDefaultData());
      })
    ).subscribe({
      next: (data) => {
        this.footerData = data;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('HTTP Error:', error);
        this.footerData = this.getDefaultData();
        this.isLoading = false;
      }
    });
  }

  private getDefaultData(): FooterData {
    return {
      companyInfo: {
        name: 'Tu Empresa',
        description: 'Soluciones innovadoras y de calidad',
        phone: '+1 234 567 890',
        email: 'info@empresa.com',
        address: 'Calle Principal #123'
      },
      socialLinks: [
        { name: 'Facebook', url: '#', icon: 'fab fa-facebook-f' },
        { name: 'Twitter', url: '#', icon: 'fab fa-twitter' },
        { name: 'Instagram', url: '#', icon: 'fab fa-instagram' },
        { name: 'LinkedIn', url: '#', icon: 'fab fa-linkedin-in' }
      ],
      quickLinks: [
        // { name: 'Inicio', route: '/', icon: 'fas fa-home' },
        { name: 'Quiénes Somos', route: '/about', icon: 'fas fa-info-circle' },
        // { name: 'Servicios', route: '/services', icon: 'fas fa-concierge-bell' },
        { name: 'Contacto', route: '/contact', icon: 'fas fa-envelope' }
      ]
    };
  }

  openWhatsApp(): void {
    const message = 'Hola, me gustaría obtener más información';
    const url = `https://wa.me/${this.footerData.companyInfo.phone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  }

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}