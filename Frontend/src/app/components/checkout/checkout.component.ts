import { Component, OnInit, OnDestroy, AfterViewInit, ViewChild, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, takeUntil, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { PaymentService } from '../../services/payment.service';
import { CartItem } from '../../models/cart-item.model';
import { loadStripe, Stripe, StripeElements, StripeCardElement } from '@stripe/stripe-js';
import { CartAbandonmentModalComponent } from '../cart-abandonment-modal/cart-abandonment-modal.component';

interface ShippingMethod {
  id: string;
  name: string;
  description: string;
  cost: number;
  estimatedDays: number;
  isFree?: boolean;
}

interface ShippingRequest {
  country?: string;
  state?: string;
  city?: string;
  zipCode?: string;
  cartTotal?: number;
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
  imports: [CommonModule, RouterModule, ReactiveFormsModule, CartAbandonmentModalComponent],
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss']
})
export class CheckoutComponent implements OnInit, OnDestroy, AfterViewInit {
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
    // Métodos de envío estáticos (se reemplazarán con datos dinámicos del backend)
    // {
    //   id: 'standard',
    //   name: 'Envío Estándar',
    //   description: '5-7 días hábiles',
    //   cost: 50,
    //   estimatedDays: 7
    // },
    // {
    //   id: 'express',
    //   name: 'Envío Express',
    //   description: '2-3 días hábiles',
    //   cost: 150,
    //   estimatedDays: 3
    // },
    // {
    //   id: 'overnight',
    //   name: 'Envío Nocturno',
    //   description: '24 horas',
    //   cost: 250,
    //   estimatedDays: 1
    // }
  ];

  selectedShipping: ShippingMethod | null = null;
  orderSummary: OrderSummary = {
    subtotal: 0,
    shipping: 0,
    tax: 0,
    total: 0
  };

  // Stripe properties
  stripe: Stripe | null = null;
  elements: StripeElements | null = null;
  cardElement: StripeCardElement | null = null;
  clientSecret: string = '';

  // Referencia al elemento DOM de Stripe
  @ViewChild('cardElement') cardElementRef!: ElementRef;
  
  // Modal de abandono de carrito
  @ViewChild(CartAbandonmentModalComponent) abandonmentModal!: CartAbandonmentModalComponent;
  
  // Estado para evitar bucle de confirmación
  private isNavigatingAway = false;
  private hasFormChanges = false;
  
  private destroy$ = new Subject<void>();

  constructor(
    private cartService: CartService,
    private authService: AuthService,
    private paymentService: PaymentService,
    private router: Router,
    private fb: FormBuilder,
    private http: HttpClient
  ) {
    this.cartItems$ = this.cartService.getCartItems();
  }

  ngOnInit() {
    this.initializeForms();
    this.calculateOrderSummary();
    this.loadShippingMethods();
    this.setupFormChangeDetection();
    this.setupAbandonmentTracking();
  }

  /**
   * Detecta cambios en el formulario para activar la protección de abandono
   */
  private setupFormChangeDetection(): void {
    this.shippingForm.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.hasFormChanges = true;
    });
  }

  /**
   * Configura el tracking de abandono de carrito
   */
  private setupAbandonmentTracking(): void {
    // Abrir modal cuando el usuario intenta salir del checkout
    this.router.events.pipe(takeUntil(this.destroy$)).subscribe(() => {
      if (this.hasFormChanges && !this.isNavigatingAway) {
        // Verificar si hay productos en el carrito
        this.cartItems$.pipe(takeUntil(this.destroy$)).subscribe(items => {
          if (items.length > 0 && !this.abandonmentModal?.wasShownInSession()) {
            this.abandonmentModal?.open();
          }
        });
      }
    });
  }

  /**
   * Maneja el intento de salida del checkout
   */
  onAbandonmentConfirmed(): void {
    this.isNavigatingAway = true;
    
    // Registrar abandono en analytics
    this.trackAbandonment();
    
    // Registrar carrito abandonado en backend
    this.registerAbandonedCart();
  }

  /**
   * Registra el abandono del carrito en el backend
   */
  private registerAbandonedCart(): void {
    const email = this.shippingForm.get('email')?.value;
    
    // Obtener items del carrito
    this.cartService.getCartItems().pipe(takeUntil(this.destroy$)).subscribe(items => {
      if (email && items.length > 0) {
        this.http.post('/api/cart-abandonment', {
          email: email,
          cartItems: items,
          checkoutStep: this.currentStep,
          timestamp: new Date().toISOString()
        }).subscribe({
          next: () => console.log('Carrito abandonado registrado'),
          error: (err) => console.error('Error al registrar carrito abandonado:', err)
        });
      }
    });
  }

  /**
   * Tracking de abandono para analytics
   */
  private trackAbandonment(): void {
    // Aquí se integraría con Google Analytics, Facebook Pixel, etc.
    const abandonmentData = {
      event: 'checkout_abandonment',
      step: this.currentStep,
      cartValue: this.orderSummary.total,
      timestamp: new Date().toISOString()
    };
    
    console.log('Checkout abandonment tracked:', abandonmentData);
    
    // Ejemplo de integración con window.dataLayer (Google Analytics)
    if (typeof window !== 'undefined' && (window as any).dataLayer) {
      (window as any).dataLayer.push(abandonmentData);
    }
  }

  /**
   * Maneja cuando el usuario decide quedarse en el checkout
   */
  onStayInCheckout(): void {
    this.hasFormChanges = false;
  }


  ngAfterViewInit() {
    // Asegurar que el DOM esté listo antes de montar Stripe
    setTimeout(() => {
      this.initializeStripe();
    }, 100);
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

  private async initializeStripe() {
    this.stripe = await this.paymentService.getStripe();
    if (this.stripe) {
      this.elements = this.stripe.elements();
      this.cardElement = this.elements.create('card');
      // Montar el elemento en el contenedor correcto
      if (this.cardElementRef && this.cardElementRef.nativeElement) {
        this.cardElement.mount(this.cardElementRef.nativeElement);
      }
    }
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

  private loadShippingMethods(): void {
    this.isLoading = true;
    
    // Obtener datos del formulario para calcular envíos
    const country = this.shippingForm.get('country')?.value || 'MX';
    const state = this.shippingForm.get('state')?.value || '';
    const city = this.shippingForm.get('city')?.value || '';
    const zipCode = this.shippingForm.get('zipCode')?.value || '';
    const cartTotal = this.orderSummary.subtotal;

    // Intentar cargar métodos de envío desde el backend
    this.http.get('/api/shipping-methods', {
      params: {
        country: country,
        state: state,
        city: city,
        zipCode: zipCode,
        cartTotal: cartTotal
      }
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (methods: any) => {
          this.shippingMethods = methods;
          if (methods.length > 0) {
            this.selectShippingMethod(methods[0]);
          }
          this.isLoading = false;
        },
        error: (error: any) => {
          console.error('Error loading shipping methods:', error);
          // Usar métodos estáticos de respaldo si falla la carga desde el backend
          this.shippingMethods = [
            {
              id: 'standard',
              name: 'Envío Estándar',
              description: '5-7 días hábiles',
              cost: 50,
              estimatedDays: 7,
              isFree: false
            },
            {
              id: 'express',
              name: 'Envío Express',
              description: '2-3 días hábiles',
              cost: 150,
              estimatedDays: 3,
              isFree: false
            },
            {
              id: 'overnight',
              name: 'Envío Nocturno',
              description: 'Entrega al día siguiente',
              cost: 250,
              estimatedDays: 1,
              isFree: false
            }
          ];
          
          // Seleccionar el primer método de envío por defecto
          if (this.shippingMethods.length > 0) {
            this.selectShippingMethod(this.shippingMethods[0]);
          }
          
          this.isLoading = false;
        }
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

  isNextButtonDisabled(): boolean {
    if (this.currentStep === 1) {
      return !this.shippingForm.valid || !this.selectedShipping || this.isLoading;
    } else if (this.currentStep === 2) {
      return this.isLoading;
    } else if (this.currentStep === 3) {
      return this.isLoading;
    }
    return true;
  }

  previousStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
      this.errorMessage = '';
      window.scrollTo(0, 0);
    }
  }

  async submitOrder() {
    if (!this.stripe || !this.cardElement) {
      this.errorMessage = 'Error de configuración de pago';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    try {
      // Crear PaymentIntent
      const paymentIntentResponse = await this.paymentService.createPaymentIntent(this.orderSummary.total).toPromise();
      this.clientSecret = paymentIntentResponse.clientSecret;

      // Confirmar pago con Stripe
      const { error, paymentIntent } = await this.stripe.confirmCardPayment(this.clientSecret, {
        payment_method: {
          card: this.cardElement,
          billing_details: {
            name: this.shippingForm.value.firstName + ' ' + this.shippingForm.value.lastName,
            email: this.shippingForm.value.email,
            phone: this.shippingForm.value.phone,
            address: {
              line1: this.shippingForm.value.address,
              city: this.shippingForm.value.city,
              state: this.shippingForm.value.state,
              postal_code: this.shippingForm.value.zipCode,
              country: 'MX' // Cambiar según el país
            }
          }
        }
      });

      if (error) {
        this.errorMessage = error.message || 'Error en el pago';
        this.isLoading = false;
        return;
      }

      if (paymentIntent.status === 'succeeded') {
        // Obtener items del carrito
        const cartItems = await this.cartItems$.toPromise();
        const orderItems = cartItems?.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity,
          price: item.price
        })) || [];

        // Enviar orden al backend
        const orderData = {
          shipping: this.shippingForm.value,
          paymentIntentId: paymentIntent.id,
          items: orderItems,
          total: this.orderSummary.total
        };

        // Enviar al backend
        let orderResponse: any = null;
        try {
          orderResponse = await this.http.post('/api/orders', orderData).toPromise();
          console.log('Orden creada exitosamente:', orderResponse);
        } catch (error) {
          console.error('Error al crear la orden:', error);
          this.errorMessage = 'Error al procesar tu orden';
          this.isLoading = false;
          return;
        }

        // Limpiar carrito
        this.cartService.clearCart();

        // Redirigir a confirmación con el ID real de la orden
        if (orderResponse && orderResponse.order && orderResponse.order.id) {
          this.router.navigate(['/order-confirmation', orderResponse.order.id]);
        } else {
          this.router.navigate(['/order-confirmation'], {
            queryParams: { orderId: 'ORD-' + Date.now() }
          });
        }
      }
    } catch (error) {
      this.errorMessage = 'Error procesando el pago';
      console.error('Payment error:', error);
    }

    this.isLoading = false;
  }

  cancelCheckout() {
    // Mostrar modal de confirmación antes de cancelar
    this.abandonmentModal.open();
  }

  /**
   * Confirma la salida del checkout (desde el modal)
   */
  confirmExit(): void {
    this.isNavigatingAway = true;
    this.onAbandonmentConfirmed();
    this.router.navigate(['/cart']);
  }

  /**
   * Maneja cuando el usuario decide quedarse en el checkout
   */
  onStayInCheckoutHandler(): void {
    this.hasFormChanges = false;
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

  /**
   * Previene salida accidental del navegador
   */
  @HostListener('window:beforeunload', ['$event'])
  onBeforeUnload(event: BeforeUnloadEvent): void {
    if (this.hasFormChanges && this.currentStep < 3) {
      event.preventDefault();
      event.returnValue = '';
    }
  }

  /**
   * Maneja cambios de hash en la URL
   */
  @HostListener('window:hashchange', ['$event'])
  onHashChange(event: HashChangeEvent): void {
    if (this.hasFormChanges && !this.isNavigatingAway) {
      event.preventDefault();
      this.abandonmentModal.open();
    }
  }
}
