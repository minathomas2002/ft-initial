import { Directive, effect, ElementRef, inject, input } from '@angular/core';
import { FileuploadComponent } from '../components/utility-components/fileupload/fileupload.component';
import { PhoneInputComponent } from '../components/form/phone-input/phone-input.component';

/**
 * Directive that conditionally applies background and border color classes
 * based on a boolean condition and a color input.
 *
 * Usage:
 * <input [appConditionalColorClass]="true" [color]="'orange'" />
 * <input [appConditionalColorClass]="someCondition" [color]="'red'" />
 * <p-multiselect [appConditionalColorClass]="highlightInput('field')" [color]="selectedInputColor()" ... />
 * <app-phone-input [appConditionalColorClass]="highlightInput('phone')" [color]="selectedInputColor()" ... />
 * <app-fileupload [appConditionalColorClass]="highlightInput('attachments')" [color]="selectedInputColor()" ... />
 *
 * When the boolean is true, it adds:
 * - bg-{color}-50! (background color)
 * - border-{color}-500! (border color)
 *
 * For app-fileupload, classes are set or removed via the component's styleClass
 * input (merged with any existing styleClass). For app-phone-input, classes are
 * applied to both the p-select (country code) and the text input (phone number),
 * with the border applied to the unified container. For p-multiselect, classes are
 * applied to the MultiSelect root container (the visible trigger). For other
 * components, classes are applied to the DOM (nested input when present; file inputs excluded).
 *
 * Note: All possible class combinations are explicitly defined below
 * so Tailwind CSS v4 can detect and include them during build.
 */
@Directive({
  selector: '[appConditionalColorClass]',
  standalone: true,
})
export class ConditionalColorClassDirective {
  /**
   * Boolean input that determines whether to apply the color classes
   */
  appConditionalColorClass = input.required<boolean>();

  /**
   * Color input (e.g., 'orange', 'red', 'blue', etc.)
   * Defaults to 'orange' if not provided
   */
  color = input<string>('orange');

  /**
   * Explicit class mappings for Tailwind CSS v4 JIT detection
   * These classes must be explicitly defined so Tailwind can detect them
   */
  private readonly colorClassMap: Record<string, { bg: string; border: string }> = {
    orange: { bg: 'bg-orange-50!', border: 'border-orange-500!' },
    green: { bg: 'bg-green-50!', border: 'border-green-500!' },
    red: { bg: 'bg-red-50!', border: 'border-red-500!' },
    blue: { bg: 'bg-blue-50!', border: 'border-blue-500!' },
    yellow: { bg: 'bg-yellow-50!', border: 'border-yellow-500!' },
    purple: { bg: 'bg-purple-50!', border: 'border-purple-500!' },
    pink: { bg: 'bg-pink-50!', border: 'border-pink-500!' },
    gray: { bg: 'bg-gray-50!', border: 'border-gray-500!' },
    primary: { bg: 'bg-primary-50!', border: 'border-primary-500!' },
  };

  private elementRef = inject(ElementRef<HTMLElement>);
  private fileupload = inject(FileuploadComponent, { host: true, optional: true });
  private phoneInput = inject(PhoneInputComponent, { host: true, optional: true });

  constructor() {
    // Use effect to reactively update classes based on condition and color
    effect(() => {
      const shouldApply = this.appConditionalColorClass();
      const colorValue = this.color();

      if (this.fileupload) {
        // app-fileupload: set or remove classes via styleClass input
        let classes = '';
        if (shouldApply && colorValue) {
          const m = this.colorClassMap[colorValue];
          if (m) classes = `${m.bg} ${m.border}`;
        }
        this.fileupload.setConditionalHighlightClasses(classes);
        return;
      }

      if (this.phoneInput) {
        // app-phone-input: apply to both p-select and text input, plus border on container
        this.applyPhoneInputClasses(shouldApply, colorValue);
        return;
      }

      // Other elements: apply/remove classes on DOM
      const targetElement = this.getTargetElement();
      this.removeColorClasses(targetElement);
      if (shouldApply && colorValue) {
        const colorClasses = this.colorClassMap[colorValue];
        if (colorClasses) {
          targetElement.classList.add(colorClasses.bg, colorClasses.border);
        }
      }
    });
  }

  /**
   * Gets the target element to apply classes to.
   * - p-multiselect: the root container (visible trigger); never a nested filter input.
   * - input/textarea/select: the element itself.
   * - Other PrimeNG (p-inputnumber, p-select, etc.): nested input when present; file inputs excluded.
   * - Otherwise: the host element.
   */
  private getTargetElement(): HTMLElement {
    const element = this.elementRef.nativeElement;
    const tag = element.tagName.toLowerCase();

    if (tag === 'input' || tag === 'textarea' || tag === 'select') {
      return element;
    }

    // p-multiselect: apply to the root container (the visible trigger/box), not a nested
    // filter input inside the overlay
    if (tag === 'p-multiselect' || element.classList.contains('p-multiselect')) {
      return element;
    }

    const nestedInput = element.querySelector(
      'input:not([type="file"]), textarea, select',
    ) as HTMLElement | null;
    if (nestedInput) {
      return nestedInput;
    }

    return element;
  }

  /**
   * Applies or removes color classes for app-phone-input component.
   * Applies background to both p-select (including wrapper, label, and trigger) and text input,
   * and border to the unified container.
   */
  private applyPhoneInputClasses(shouldApply: boolean, colorValue: string): void {
    const element = this.elementRef.nativeElement;
    
    // Find the unified container (has the border)
    const unifiedContainer = element.querySelector('.unified-phone-input') as HTMLElement | null;
    
    // Find the country selector wrapper (needs background)
    const countryWrapper = element.querySelector('.country-selector-wrapper') as HTMLElement | null;
    
    // Find the p-select element - PrimeNG Select renders as p-select custom element,
    // and inside it there's a .p-select div. We query from the country-selector-wrapper.
    // Try multiple selectors to handle different rendering scenarios
    let selectWrapper = element.querySelector('.country-selector-wrapper p-select .p-select') as HTMLElement | null;
    if (!selectWrapper) {
      // Fallback: query directly for .p-select inside the component
      selectWrapper = element.querySelector('p-select .p-select') as HTMLElement | null;
    }
    if (!selectWrapper) {
      // Another fallback: query for .p-select anywhere in the component
      selectWrapper = element.querySelector('.p-select') as HTMLElement | null;
    }
    
    // Find the p-select label (the visible trigger area)
    const selectLabel = element.querySelector('.country-selector-wrapper .p-select-label') as HTMLElement | null;
    
    // Find the p-select trigger (the button area)
    const selectTrigger = element.querySelector('.country-selector-wrapper .p-select-trigger') as HTMLElement | null;
    
    // Find the text input (phone number)
    const textInput = element.querySelector('input[type="tel"]') as HTMLElement | null;

    const colorClasses = colorValue ? this.colorClassMap[colorValue] : null;

    // Remove classes from all elements first
    const elementsToClean = [unifiedContainer, countryWrapper, selectWrapper, selectLabel, selectTrigger, textInput].filter(Boolean) as HTMLElement[];
    elementsToClean.forEach(el => this.removeColorClasses(el));

    // Apply classes if needed
    if (shouldApply && colorClasses) {
      // Border on the unified container
      if (unifiedContainer) {
        unifiedContainer.classList.add(colorClasses.border);
      }
      
      // Background on the country wrapper (ensures the entire select area has background)
      if (countryWrapper) {
        countryWrapper.classList.add(colorClasses.bg);
      }
      
      // Background on the select wrapper (the actual .p-select div)
      if (selectWrapper) {
        selectWrapper.classList.add(colorClasses.bg);
      }
      
      // Background on the select label (the visible trigger area)
      if (selectLabel) {
        selectLabel.classList.add(colorClasses.bg);
      }
      
      // Background on the select trigger (the button area)
      if (selectTrigger) {
        selectTrigger.classList.add(colorClasses.bg);
      }
      
      // Background on the text input
      if (textInput) {
        textInput.classList.add(colorClasses.bg);
      }
    }
  }

  /**
   * Removes all color-related classes that match the pattern
   * bg-*-50! and border-*-500!
   */
  private removeColorClasses(element: HTMLElement): void {
    const classesToRemove: string[] = [];

    // Collect all classes that match our pattern
    [...element.classList].forEach((className: string) => {
      if (
        (className.startsWith('bg-') && className.endsWith('-50!')) ||
        (className.startsWith('border-') && className.endsWith('-500!'))
      ) {
        classesToRemove.push(className);
      }
    });

    // Remove the collected classes
    classesToRemove.forEach((className: string) => {
      element.classList.remove(className);
    });
  }
}

/*
 * Tailwind CSS v4 Safelist - Explicit class definitions for JIT detection
 * These classes are referenced above to ensure Tailwind includes them in the build
 */
// bg-orange-50! border-orange-500!
// bg-green-50! border-green-500!
// bg-red-50! border-red-500!
// bg-blue-50! border-blue-500!
// bg-yellow-50! border-yellow-500!
// bg-purple-50! border-purple-500!
// bg-pink-50! border-pink-500!
// bg-gray-50! border-gray-500!
// bg-primary-50! border-primary-500!
