import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, takeUntil, Observable } from 'rxjs';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { CartItem } from '../../models/cart-item.model';

interface ShippingMethod {
  id: string;
  name: string;
  description: string;
  cost: number;
  days: number;
}

interface OrderSummary {
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
}

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss']
})
export class CheckoutComponent implements OnInit, OnDestroy {
  currentStep = 1;
  totalSteps = 3;
  
  cartItems$!: Observable<CartItem[]>;
  isLoading = false;
  errorMessage = '';
  paymentAttempted = false;

  // Formularios
  shippingForm!: FormGroup;
  paymentForm!: FormGroup;
  
  // Opciones de envío
  shippingMethods: ShippingMethod[] = [
    {
      id: 'standard',
      name: 'Envío Estándar',
      description: '5-7 días hábiles',
      cost: 50,
      days: 7
    },
    {
      id: 'express',
      name: 'Envío Express',
      description: '2-3 días hábiles',
      cost: 150,
      days: 3
    },
    {
      id: 'overnight',
      name: 'Envío Nocturno',
      description: '24 horas',
      cost: 250,
      days: 1
    }
  ];

  selectedShipping: ShippingMethod | null = null;
  orderSummary: OrderSummary = {
    subtotal: 0,
    shipping: 0,
    tax: 0,
    total: 0
  };

  private destroy$ = new Subject<void>();

  constructor(
    private cartService: CartService,
    private authService: AuthService,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.cartItems$ = this.cartService.getCartItems();
  }

  ngOnInit() {
    this.initializeForms();
    this.calculateOrderSummary();
  }

  private initializeForms() {
    // Formulario de envío (Paso 1 y 2)
    this.shippingForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9\-\+\s]{10,}$/)]],
      address: ['', [Validators.required, Validators.minLength(5)]],
      apartment: [''],
      city: ['', [Validators.required, Validators.minLength(2)]],
      state: ['', [Validators.required]],
      zipCode: ['', [Validators.required, Validators.pattern(/^[0-9]{5,}$/)]],
      shippingMethod: ['', Validators.required]
    });

    // Formulario de pago (Paso 3)
    this.paymentForm = this.fb.group({
      cardName: ['', [Validators.required, Validators.minLength(5)]],
      cardNumber: ['', [Validators.required, Validators.pattern(/^[0-9]{16}$/)]],
      expiryDate: ['', [Validators.required, Validators.pattern(/^(0[1-9]|1[0-2])\/\d{2}$/)]],
      cvv: ['', [Validators.required, Validators.pattern(/^[0-9]{3,4}$/)]],
      billingAddress: [true]
    });

    // Pre-llenar datos del usuario si está autenticado
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        if (user && user.name) {
          const nameParts = user.name.split(' ');
          const firstName = nameParts[0] || '';
          const lastName = nameParts.slice(1).join(' ') || '';
          
          this.shippingForm.patchValue({
            firstName: firstName,
            lastName: lastName,
            email: user.email || ''
          });
        }
      });
  }

  private calculateOrderSummary() {
    this.cartItems$
      .pipe(takeUntil(this.destroy$))
      .subscribe(items => {
        const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const shipping = this.selectedShipping ? this.selectedShipping.cost : 0;
        const tax = subtotal * 0.16; // IVA 16%
        const total = subtotal + shipping + tax;

        this.orderSummary = {
          subtotal,
          shipping,
          tax,
          total
        };
      });
  }

  selectShippingMethod(method: ShippingMethod) {
    this.selectedShipping = method;
    this.shippingForm.patchValue({
      shippingMethod: method.id
    });
    this.calculateOrderSummary();
  }

  nextStep() {
    if (this.currentStep === 1) {
      if (this.shippingForm.valid && this.selectedShipping) {
        this.currentStep = 2;
        window.scrollTo(0, 0);
      } else {
        this.errorMessage = 'Por favor completa todos los campos y selecciona un método de envío';
      }
    } else if (this.currentStep === 2) {
      this.currentStep = 3;
      window.scrollTo(0, 0);
    } else if (this.currentStep === 3) {
      this.submitOrder();
    }
  }

  previousStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
      this.errorMessage = '';
      window.scrollTo(0, 0);
    }
  }

  submitOrder() {
    if (!this.paymentForm.valid) {
      this.paymentAttempted = true;
      this.errorMessage = 'Por favor completa los datos de pago';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    // Simular envío de orden al backend
    setTimeout(() => {
      const orderData = {
        shipping: this.shippingForm.value,
        payment: this.paymentForm.value,
        items: [], // Se llenarían con los items del carrito
        total: this.orderSummary.total
      };

      console.log('Orden enviada:', orderData);

      // Limpiar carrito
      this.cartService.clearCart();

      // Redirigir a confirmación
      this.router.navigate(['/order-confirmation'], {
        queryParams: { orderId: 'ORD-' + Date.now() }
      });

      this.isLoading = false;
    }, 2000);
  }

  cancelCheckout() {
    this.router.navigate(['/cart']);
  }

  // Validadores de formulario
  isFieldInvalid(field: string, form: FormGroup): boolean {
    const formField = form.get(field);
    // Para el formulario de pago, solo mostrar errores si el usuario intentó confirmar
    if (form === this.paymentForm) {
      return !!(formField && formField.invalid && this.paymentAttempted);
    }
    // Para otros formularios, mostrar errores si el campo fue tocado o modificado
    return !!(formField && formField.invalid && (formField.dirty || formField.touched));
  }

  getFieldError(field: string, form: FormGroup): string {
    const formField = form.get(field);
    if (!formField || !formField.errors) return '';

    if (formField.errors['required']) return 'Este campo es requerido';
    if (formField.errors['minlength']) return `Mínimo ${formField.errors['minlength'].requiredLength} caracteres`;
    if (formField.errors['pattern']) return 'Formato inválido';
    if (formField.errors['email']) return 'Email inválido';

    return 'Error en el campo';
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
