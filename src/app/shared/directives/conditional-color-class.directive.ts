import { Directive, effect, ElementRef, inject, input } from '@angular/core';
import { FileuploadComponent } from '../components/utility-components/fileupload/fileupload.component';

/**
 * Directive that conditionally applies background and border color classes
 * based on a boolean condition and a color input.
 *
 * Usage:
 * <input [appConditionalColorClass]="true" [color]="'orange'" />
 * <input [appConditionalColorClass]="someCondition" [color]="'red'" />
 * <app-fileupload [appConditionalColorClass]="highlightInput('attachments')" [color]="selectedInputColor()" ... />
 *
 * When the boolean is true, it adds:
 * - bg-{color}-50! (background color)
 * - border-{color}-500! (border color)
 *
 * For app-fileupload, classes are set or removed via the component's styleClass
 * input (merged with any existing styleClass). For other components, classes
 * are applied to the DOM (nested input when present; file inputs excluded).
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
   * For PrimeNG components like p-inputnumber, p-select, etc.,
   * finds the nested input element. File inputs are excluded.
   * Otherwise, returns the element itself.
   */
  private getTargetElement(): HTMLElement {
    const element = this.elementRef.nativeElement;

    if (
      element.tagName.toLowerCase() === 'input' ||
      element.tagName.toLowerCase() === 'textarea' ||
      element.tagName.toLowerCase() === 'select'
    ) {
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
