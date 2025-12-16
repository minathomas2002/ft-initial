import { ChangeDetectionStrategy, Component, input, TemplateRef, ContentChild, computed, signal, effect, ViewChild, ElementRef } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { NgTemplateOutlet } from '@angular/common';
import { FormArray, FormGroup, AbstractControl } from '@angular/forms';
import { TranslatePipe } from 'src/app/shared/pipes/translate.pipe';
import { CamelCaseToWordPipe } from 'src/app/shared/pipes';

@Component({
  selector: 'app-form-array-input',
  imports: [
    ButtonModule,
    NgTemplateOutlet,
    TranslatePipe,
    CamelCaseToWordPipe,
  ],
  templateUrl: './form-array-input.html',
  styleUrl: './form-array-input.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormArrayInput {
  // Accept FormArray instead of FieldTree
  // Using input instead of model since FormArray is mutable and changes are reflected automatically
  ft = input.required<FormArray>();
  addButtonMessage = input<string>('Add');
  maxItems = input<number>(10);
  // Function to create a new empty item when adding (returns FormGroup)
  createNewItem = input<() => FormGroup>(() => {
    throw new Error('createNewItem must be provided');
  });

  @ContentChild('itemTemplate', { read: TemplateRef }) itemTemplate?: TemplateRef<{
    $implicit: AbstractControl;
    index: number;
    itemValue: any;
  }>;

  @ViewChild('tableBody', { read: ElementRef }) tableBody?: ElementRef<HTMLTableSectionElement>;

  // Signal to track FormArray changes for reactivity
  private updateTrigger = signal(0);

  constructor() {
    // Track FormArray changes to trigger computed updates
    effect(() => {
      const formArray = this.ft();
      if (formArray) {
        // Subscribe to valueChanges to detect mutations
        const subscription = formArray.valueChanges.subscribe(() => {
          this.updateTrigger.update(v => v + 1);
        });
        // Initial trigger
        this.updateTrigger.update(v => v + 1);
        // Cleanup subscription when effect re-runs or component is destroyed
        return () => subscription.unsubscribe();
      }
      return undefined;
    });
  }

  // Get the array value from FormArray
  // Reading updateTrigger signal makes the computed reactive to FormArray mutations
  objects = computed(() => {
    const formArray = this.ft();
    if (!formArray) return [];
    // Read the signal to make computed reactive
    this.updateTrigger();
    return formArray.value || [];
  });

  keys = computed(() => {
    const objectsArray = this.objects();
    if (!objectsArray || objectsArray.length === 0) return [];

    const firstObject = objectsArray[0];
    if (!firstObject || typeof firstObject !== 'object' || firstObject === null) return [];

    return Object.keys(firstObject);
  });

  // Get FormControl/FormGroup for a specific index
  getItemControl(index: number): AbstractControl | undefined {
    const formArray = this.ft();
    if (!formArray) return undefined;
    return formArray.at(index);
  }

  onDeleteHandler(index: number) {
    const formArray = this.ft();
    if (!formArray) return;

    const currentLength = formArray.length;
    if (currentLength > 1) {
      formArray.removeAt(index);
    } else {
      // Keep at least one item with empty values
      formArray.clear();
      const newItem = this.createNewItem()();
      formArray.push(newItem);
    }
    // Trigger update to refresh computed signal
    this.updateTrigger.update(v => v + 1);
  }

  onAddHandler() {
    const formArray = this.ft();
    if (!formArray) return;

    if (formArray.length >= this.maxItems()) return;

    const newItem = this.createNewItem()();
    formArray.push(newItem);
    // Trigger update to refresh computed signal
    this.updateTrigger.update(v => v + 1);

    // Focus the first input in the newly added row after DOM update
    this.focusFirstInputInLastRow();
  }

  private focusFirstInputInLastRow() {
    // Use setTimeout to wait for Angular's change detection to complete
    // This ensures the DOM is updated before trying to focus
    setTimeout(() => {
      if (!this.tableBody?.nativeElement) return;

      const rows = this.tableBody.nativeElement.querySelectorAll('tr');
      if (rows.length === 0) return;

      // Get the last row (newly added)
      const lastRow = rows[rows.length - 1];

      // Find the first focusable input element (input, textarea, select, or PrimeNG input wrapper)
      const firstInput = lastRow.querySelector<HTMLElement>(
        'input:not([type="hidden"]):not([disabled]), ' +
        'textarea:not([disabled]), ' +
        'select:not([disabled]), ' +
        '.p-inputtext input, ' +
        '.p-textarea textarea, ' +
        '.p-select .p-select-trigger, ' +
        '.p-autocomplete input, ' +
        '.p-dropdown .p-dropdown-trigger, ' +
        '.p-datepicker input, ' +
        '.p-inputnumber input'
      );

      if (firstInput) {
        // For PrimeNG components, focus the actual input element inside
        const actualInput = firstInput.tagName === 'INPUT' || firstInput.tagName === 'TEXTAREA'
          ? firstInput
          : firstInput.querySelector<HTMLElement>('input, textarea');

        if (actualInput) {
          actualInput.focus();
        } else {
          firstInput.focus();
        }
      }
    }, 10);
  }
}
