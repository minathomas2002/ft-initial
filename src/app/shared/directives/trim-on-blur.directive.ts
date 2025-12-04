import { Directive, ElementRef, HostListener, Optional, Self } from '@angular/core';
import { NgControl } from '@angular/forms';

/**
 * Directive that automatically trims whitespace from input and textarea values
 * when the user leaves the field (on blur event).
 * 
 * Works with both reactive forms (FormControl) and template-driven forms (ngModel).
 * Automatically applies to all input and textarea elements in the system.
 * 
 * The directive will automatically trim the value when the field loses focus.
 */
@Directive({
  selector: 'input:not([type="checkbox"]):not([type="radio"]):not([type="button"]):not([type="submit"]):not([type="reset"]):not([type="file"]):not([type="hidden"]):not([type="image"]), textarea',
  standalone: true,
})
export class TrimOnBlurDirective {
  constructor(
    private elementRef: ElementRef<HTMLInputElement | HTMLTextAreaElement>,
    @Optional() @Self() private ngControl: NgControl | null
  ) { }

  @HostListener('blur')
  onBlur(): void {
    const element = this.elementRef.nativeElement;
    const currentValue = element.value;

    if (currentValue && typeof currentValue === 'string') {
      const trimmedValue = currentValue.trim();

      // Only update if the value actually changed
      if (trimmedValue !== currentValue) {
        // Update the form control if available (reactive forms)
        if (this.ngControl && this.ngControl.control) {
          // Set the form control value - this will update the input via Angular's binding
          this.ngControl.control.setValue(trimmedValue, { emitEvent: true, onlySelf: false });
        } else {
          // For template-driven forms or when no control, update element and trigger events
          element.value = trimmedValue;
          element.dispatchEvent(new Event('input', { bubbles: true }));
        }
      }
    }
  }
}

