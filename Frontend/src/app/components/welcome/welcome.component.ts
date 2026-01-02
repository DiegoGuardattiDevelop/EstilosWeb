import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-welcome',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="welcome-container">
      <!-- Fondo animado -->
      <div class="background-shapes">
        <div *ngFor="let shape of shapes" class="shape" [ngClass]="shape.class" [style]="shape.style"></div>
      </div>
      
      <!-- Contenido principal -->
      <div class="welcome-content">
        <div class="logo-container">
          <svg class="logo-icon" viewBox="0 0 24 24">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
          </svg>
        </div>
        
        <h1 class="welcome-title">
          <span class="title-word" *ngFor="let word of titleWords; let i = index" [style.animation-delay]="i * 0.2 + 's'">
            {{word}}
          </span>
        </h1>
        
        <p class="welcome-subtitle">
          Descubre nuestra exclusiva colección
        </p>
        
        <div class="progress-bar">
          <div class="progress-fill"></div>
        </div>
        
        <button class="skip-button" (click)="skipAnimation()">
          Saltar introducción
        </button>
      </div>
    </div>
  `,
  styles: [`
    .welcome-container {
      position: relative;
      width: 100%;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
    }
    
    .background-shapes {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      overflow: hidden;
    }
    
    .shape {
      position: absolute;
      opacity: 0.6;
      border-radius: 50%;
      animation: float 15s infinite linear;
    }
    
    .shape.circle {
      border-radius: 50%;
    }
    
    .shape.triangle {
      width: 0;
      height: 0;
      border-style: solid;
      border-radius: 0;
      background: transparent !important;
    }
    
    .welcome-content {
      position: relative;
      z-index: 2;
      text-align: center;
      padding: 2rem;
      max-width: 800px;
      width: 90%;
    }
    
    .logo-container {
      margin-bottom: 2rem;
    }
    
    .logo-icon {
      width: 80px;
      height: 80px;
      fill: #4a6cf7;
      animation: pulse 2s infinite alternate;
    }
    
    .welcome-title {
      font-size: clamp(2rem, 5vw, 3.5rem);
      font-weight: 800;
      margin-bottom: 1.5rem;
      color: #1e293b;
      line-height: 1.2;
    }
    
    .title-word {
      display: inline-block;
      opacity: 0;
      transform: translateY(20px);
      animation: fadeInUp 0.8s forwards;
    }
    
    .welcome-subtitle {
      font-size: 1.25rem;
      color: #64748b;
      margin-bottom: 2rem;
      opacity: 0;
      animation: fadeIn 1s 1.5s forwards;
    }
    
    .progress-bar {
      width: 100%;
      height: 6px;
      background: #e2e8f0;
      border-radius: 3px;
      margin: 2rem auto;
      overflow: hidden;
      max-width: 300px;
    }
    
    .progress-fill {
      height: 100%;
      width: 0;
      background: #4a6cf7;
      border-radius: 3px;
      animation: progressFill 3s linear forwards;
    }
    
    .skip-button {
      background: transparent;
      border: none;
      color: #64748b;
      font-size: 0.9rem;
      cursor: pointer;
      opacity: 0;
      animation: fadeIn 0.5s 2s forwards;
      transition: all 1.5 s ease;
    }
    
    .skip-button:hover {
      color: #4a6cf7;
      text-decoration: underline;
    }
    
    /* Animaciones */
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    
    @keyframes fadeInUp {
      from { 
        opacity: 0;
        transform: translateY(20px);
      }
      to { 
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    @keyframes float {
      0% {
        transform: translateY(0) rotate(0deg);
      }
      100% {
        transform: translateY(-1000px) rotate(720deg);
      }
    }
    
    @keyframes pulse {
      from {
        transform: scale(1);
      }
      to {
        transform: scale(1.1);
      }
    }
    
    @keyframes progressFill {
      from { width: 0; }
      to { width: 100%; }
    }
  `]
})
export class WelcomeComponent implements OnInit {
  titleWords = ['¡Bienvenido',  'a',  'nuestra',  'tienda!'];
  shapes: any[] = [];
  redirectTimeout: any;

  constructor(private router: Router) { }

  ngOnInit(): void {
    this.createShapes();
    this.redirectTimeout = setTimeout(() => {
      this.router.navigate(['/home']);
    }, 1500);
  }

  createShapes(): void {
    const colors = ['#4a6cf7', '#7c3aed', '#10b981', '#f59e0b', '#ef4444'];
    const types = ['circle', 'triangle'];
    
    for (let i = 0; i < 15; i++) {
      const size = Math.random() * 100 + 50;
      const color = colors[Math.floor(Math.random() * colors.length)];
      const type = types[Math.floor(Math.random() * types.length)];
      
      const shape = {
        class: type,
        style: `
          width: ${size}px;
          height: ${type === 'circle' ? size : 0}px;
          ${type === 'triangle' ? `border-width: 0 ${size/2}px ${size}px ${size/2}px; border-color: transparent transparent ${color} transparent;` : `background: ${color};`}
          left: ${Math.random() * 100}%;
          top: ${Math.random() * 100 + 100}%;
          animation-duration: ${Math.random() * 20 + 10}s;
          animation-delay: ${Math.random() * 5}s;
        `
      };
      
      this.shapes.push(shape);
    }
  }

  skipAnimation(): void {
    clearTimeout(this.redirectTimeout);
    this.router.navigate(['/home']);
  }
}