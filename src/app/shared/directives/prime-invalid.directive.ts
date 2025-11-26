import { Directive, effect, ElementRef, inject, input } from '@angular/core';
import { AbstractControl } from '@angular/forms';

/**
 * Directive that automatically applies the 'p-invalid' CSS class
 * to PrimeNG form inputs when the field is invalid and touched.
 * 
 * Usage:
 * <input [formControl]="myControl" [appPrimeInvalid]="myControl" />
 * 
 * The directive will automatically add/remove the 'p-invalid' class
 * based on the field's validation state.
 */
@Directive({
  selector: '[appPrimeInvalid]',
  standalone: true,
})
export class PrimeInvalidDirective {
  // Accept AbstractControl (FormControl, FormGroup, etc.)
  appPrimeInvalid = input.required<AbstractControl>();

  private elementRef = inject(ElementRef<HTMLElement>);

  constructor() {
    // Use effect to reactively update the class based on field state
    effect(() => {
      const control = this.appPrimeInvalid();
      const isInvalid = control ? (control.invalid && control.touched) : false;

      if (isInvalid) {
        this.elementRef.nativeElement.classList.add('p-invalid');
      } else {
        this.elementRef.nativeElement.classList.remove('p-invalid');
      }
    });
  }
}

