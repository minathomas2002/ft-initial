import {
  AfterViewInit,
  Directive,
  effect,
  ElementRef,
  inject,
  input,
  OnDestroy,
} from '@angular/core';
import { NgControl } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { MultiSelect } from 'primeng/multiselect';
import { Select } from 'primeng/select';

/**
 * Shows the placeholder when the control is enabled (with or without value, including null).
 * Hides the placeholder when the control is disabled.
 *
 * Use on: input (text), p-inputnumber, pTextarea, p-select, p-multiselect, etc.
 * Pass the placeholder text as the directive input; the directive will show it when enabled
 * and hide it when disabled.
 *
 * Usage:
 *   <input pInputText [formControl]="ctrl" [appHidePlaceholderWhenDisabledEmpty]="'Enter name'" />
 *   <p-inputnumber [formControl]="ctrl" [appHidePlaceholderWhenDisabledEmpty]="'Enter land'" />
 *   <textarea pTextarea [formControl]="ctrl" [appHidePlaceholderWhenDisabledEmpty]="'Enter specs'" />
 *   <p-select [formControl]="ctrl" [appHidePlaceholderWhenDisabledEmpty]="'Select'" />
 *   <p-multiselect [formControl]="ctrl" [appHidePlaceholderWhenDisabledEmpty]="'Select items'" />
 */
@Directive({
  selector: '[appHidePlaceholderWhenDisabledEmpty]',
  standalone: true,
})
export class HidePlaceholderWhenDisabledEmptyDirective
  implements AfterViewInit, OnDestroy {
  /** Placeholder text to show when the control is enabled or has a value. */
  appHidePlaceholderWhenDisabledEmpty = input<string>('');

  private readonly elementRef = inject(ElementRef<HTMLElement>);
  private readonly ngControl = inject(NgControl, { optional: true });
  /** When directive is on p-select, we update the component's placeholder input so the label reacts. */
  private readonly hostSelect = inject(Select, { optional: true, host: true });
  /** When directive is on p-multiselect, we update the component's placeholder input so the label reacts. */
  private readonly hostMultiSelect = inject(MultiSelect, { optional: true, host: true });
  private readonly destroy$ = new Subject<void>();
  /** Original placeholder (from input or captured from element) so we can restore when re-enabled. */
  private storedPlaceholder: string | null = null;

  constructor() {
    effect(() => {
      this.appHidePlaceholderWhenDisabledEmpty();
      this.scheduleUpdate();
    });
  }

  ngAfterViewInit(): void {
    const control = this.ngControl?.control;
    if (!control) {
      this.updatePlaceholder();
      return;
    }
    // React to value changes (e.g. user types or value is patched)
    control.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.scheduleUpdate());
    // React to status changes (disabled / enabled) so placeholder updates immediately
    control.statusChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.scheduleUpdate());
    // Initial run (schedule so initial disabled state is applied after view is ready)
    this.scheduleUpdate();
  }

  /** Schedules placeholder update after the current tick so disabled/enabled changes are applied. */
  private scheduleUpdate(): void {
    queueMicrotask(() => this.updatePlaceholder());
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private getTargetElement(): HTMLElement | null {
    const element = this.elementRef.nativeElement;
    const tag = element.tagName.toLowerCase();

    if (tag === 'input' || tag === 'textarea' || tag === 'select') {
      return element;
    }

    const nested = element.querySelector(
      'input:not([type="file"]), textarea, select'
    ) as HTMLElement | null;
    return nested ?? element;
  }

  private updatePlaceholder(): void {
    const control = this.ngControl?.control;
    const fromInput = this.appHidePlaceholderWhenDisabledEmpty() ?? '';

    // Keep original: prefer directive input; if empty, capture from element or p-select/p-multiselect once so we can restore when re-enabled
    if (fromInput) {
      this.storedPlaceholder = fromInput;
    } else if (this.storedPlaceholder === null) {
      if (this.hostSelect) {
        const current = this.hostSelect.placeholder();
        this.storedPlaceholder = current ?? '';
      } else if (this.hostMultiSelect) {
        const current = this.hostMultiSelect.placeholder();
        this.storedPlaceholder = current ?? '';
      } else {
        const target = this.getTargetElement();
        const fromElement = target?.getAttribute('placeholder');
        this.storedPlaceholder = fromElement ?? '';
      }
    }

    const placeholderToShow = (fromInput || this.storedPlaceholder) ?? '';

    const shouldHide = !!control?.disabled;

    const valueToApply = shouldHide ? '' : placeholderToShow;

    // p-select and p-multiselect show placeholder via their label; update the component's placeholder input so it reacts to disabled/enabled
    if (this.hostSelect) {
      this.hostSelect.placeholder = valueToApply;
    }
    if (this.hostMultiSelect) {
      this.hostMultiSelect.placeholder = valueToApply;
    }

    const target = this.getTargetElement();
    if (target) {
      target.setAttribute('placeholder', valueToApply);
    }
  }
}
