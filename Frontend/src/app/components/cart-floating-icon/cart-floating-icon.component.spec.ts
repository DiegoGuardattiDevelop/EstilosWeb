import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CartFloatingIconComponent } from './cart-floating-icon.component';

describe('CartFloatingIconComponent', () => {
  let component: CartFloatingIconComponent;
  let fixture: ComponentFixture<CartFloatingIconComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CartFloatingIconComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CartFloatingIconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
