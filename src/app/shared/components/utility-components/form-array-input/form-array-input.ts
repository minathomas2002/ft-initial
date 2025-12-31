import {
  ChangeDetectionStrategy,
  Component,
  input,
  TemplateRef,
  ContentChild,
  computed,
  signal,
  effect,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { NgTemplateOutlet } from '@angular/common';
import { FormArray, FormGroup, AbstractControl } from '@angular/forms';
import { TranslatePipe } from 'src/app/shared/pipes/translate.pipe';
import { CamelCaseToWordPipe } from 'src/app/shared/pipes';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-form-array-input',
  imports: [ButtonModule, TableModule, NgTemplateOutlet, TranslatePipe, CamelCaseToWordPipe, TooltipModule],
  templateUrl: './form-array-input.html',
  styleUrl: './form-array-input.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormArrayInput {
  hideAddButton = input<boolean>(false);
  // Accept FormArray instead of FieldTree
  // Using input instead of model since FormArray is mutable and changes are reflected automatically
  formArray = input.required<FormArray>({ alias: 'ft' });
  addButtonMessage = input<string>('Add');
  maxItems = input<number>(10);
  scrollHeight = input<string>('400px');
  hideDeleteButton = input<boolean>(false);
  // Function to create a new empty item when adding (returns FormGroup)
  createNewItem = input<() => FormGroup>(() => {
    throw new Error('createNewItem must be provided');
  });
  // Optionally show an index column at the start of the table
  showIndexColumn = input<boolean>(false);
  // Label for the index column header
  indexColumnLabel = input<string>('#');
  // Keys to exclude from column headers
  excludeKeys = input<string[]>([]);
  // Header tooltips - map of key names to tooltip text
  headerTooltips = input<Record<string, string>>({});

  @ContentChild('itemTemplate', { read: TemplateRef }) itemTemplate?: TemplateRef<{
    $implicit: AbstractControl;
    index: number;
    itemValue: any;
  }>;

  @ViewChild('tableWrapper', { read: ElementRef }) tableWrapper?: ElementRef<HTMLDivElement>;

  // Signal to track FormArray structure changes (length changes) for reactivity
  private structureUpdateTrigger = signal(0);
  // Track the current length to detect structure changes
  private currentLength = 0;
  // Stable array reference - only recreated when structure changes
  private stableRowsArray: any[] = [];

  constructor() {
    // Initialize stable rows array when formArray input changes
    effect(() => {
      const formArray = this.formArray();
      if (formArray) {
        // Initial setup - create stable array reference
        this.currentLength = formArray.length;
        this.stableRowsArray = formArray.value || [];
        this.structureUpdateTrigger.update((v) => v + 1);
      }
    });
  }

  // Helper method to update stable rows array when structure changes
  private updateStableRowsArray() {
    const formArray = this.formArray();
    if (!formArray) return;
    const newLength = formArray.length;
    if (newLength !== this.currentLength) {
      this.currentLength = newLength;
      // Recreate array reference when structure changes
      this.stableRowsArray = formArray.value || [];
      this.structureUpdateTrigger.update((v) => v + 1);
    }
  }

  // Get array value from FormArray
  // Returns a stable array reference that only changes when structure (length) changes
  // This prevents PrimeNG table from re-rendering rows when form control values change
  rows = computed(() => {
    const formArray = this.formArray();
    if (!formArray) return [];
    // Read the signal to make computed reactive to structure changes
    this.structureUpdateTrigger();
    // Return stable array reference - only changes when structure changes
    // Note: The objects inside will have updated values, but the array reference stays stable
    return this.stableRowsArray;
  });

  keys = computed(() => {
    console.log(this.formArray())
    const objectsArray = this.rows();
    if (!objectsArray || objectsArray.length === 0) return [];

    const firstObject = objectsArray[0];
    if (!firstObject || typeof firstObject !== 'object' || firstObject === null) return [];

    // Exclude 'rowId' and any keys specified in excludeKeys input
    const keysToExclude = ['rowId', ...this.excludeKeys()];
    return Object.keys(firstObject).filter((key) => !keysToExclude.includes(key));
  });

  // Get FormControl/FormGroup for a specific index
  getItemControl(index: number): AbstractControl | undefined {
    const formArray = this.formArray();
    if (!formArray) return undefined;
    return formArray.at(index);
  }

  onDeleteHandler(index: number) {
    const formArray = this.formArray();
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
    // Update stable rows array when structure changes
    this.updateStableRowsArray();
  }

  onAddHandler() {
    const formArray = this.formArray();
    if (!formArray) return;

    if (formArray.length >= this.maxItems()) return;

    const newItem = this.createNewItem()();
    formArray.push(newItem);
    // Update stable rows array when structure changes
    this.updateStableRowsArray();

    // Focus the first input in the newly added row after DOM update
    this.focusFirstInputInLastRow();
  }

  private focusFirstInputInLastRow() {
    // Use setTimeout to wait for Angular's change detection to complete
    // This ensures the DOM is updated before trying to focus
    setTimeout(() => {
      if (!this.tableWrapper?.nativeElement) return;

      // Query the table body within the p-table component
      const tableElement = this.tableWrapper.nativeElement.querySelector('.p-datatable-tbody');
      if (!tableElement) return;

      const rows = tableElement.querySelectorAll('tr');
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
        const actualInput =
          firstInput.tagName === 'INPUT' || firstInput.tagName === 'TEXTAREA'
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
