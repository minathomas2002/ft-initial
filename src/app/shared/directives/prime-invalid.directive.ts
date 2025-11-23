import { Directive, effect, ElementRef, inject, input } from '@angular/core';
import { FieldTree } from '@angular/forms/signals';

/**
 * Directive that automatically applies the 'p-invalid' CSS class
 * to PrimeNG form inputs when the field is invalid and touched.
 * 
 * Usage:
 * <input [field]="myField" [appPrimeInvalid]="myField" />
 * 
 * The directive will automatically add/remove the 'p-invalid' class
 * based on the field's validation state.
 */
@Directive({
  selector: '[appPrimeInvalid]',
  standalone: true,
})
export class PrimeInvalidDirective {
  // Accept the same fieldTree that's used in [field] binding
  // The input name must match the binding name in the template
  // Using any to accept any FieldTree variant (FieldTree is invariant in TypeScript)
  appPrimeInvalid = input.required<any>();

  private elementRef = inject(ElementRef<HTMLElement>);

  constructor() {
    // Use effect to reactively update the class based on field state
    effect(() => {
      const fieldTree = this.appPrimeInvalid() as FieldTree<any, any>;
      const fieldState = fieldTree();
      const isInvalid = fieldState.invalid() && fieldState.touched();

      if (isInvalid) {
        this.elementRef.nativeElement.classList.add('p-invalid');
      } else {
        this.elementRef.nativeElement.classList.remove('p-invalid');
      }
    });
  }
}

