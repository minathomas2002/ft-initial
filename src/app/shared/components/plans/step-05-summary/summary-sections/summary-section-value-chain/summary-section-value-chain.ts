import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { FormArray, FormGroup } from '@angular/forms';
import { EMaterialsFormControls } from 'src/app/shared/enums';
import { IStepValidationErrors } from 'src/app/shared/services/plan/validation/product-plan-validation.service';
import { SummarySectionHeader } from '../../shared/summary-section-header/summary-section-header';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-summary-section-value-chain',
  imports: [SummarySectionHeader, CommonModule],
  templateUrl: './summary-section-value-chain.html',
  styleUrl: './summary-section-value-chain.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SummarySectionValueChain {
  formGroup = input.required<FormGroup>();
  validationErrors = input<IStepValidationErrors | undefined>();
  hasErrors = input<boolean>(false);
  onEdit = output<void>();

  // Expose enum to template
  readonly EMaterialsFormControls = EMaterialsFormControls;

  // Form group accessors
  designEngineeringFormGroup = computed(() => {
    return this.formGroup().get(EMaterialsFormControls.designEngineeringFormGroup) as FormGroup;
  });

  sourcingFormGroup = computed(() => {
    return this.formGroup().get(EMaterialsFormControls.sourcingFormGroup) as FormGroup;
  });

  manufacturingFormGroup = computed(() => {
    return this.formGroup().get(EMaterialsFormControls.manufacturingFormGroup) as FormGroup;
  });

  assemblyTestingFormGroup = computed(() => {
    return this.formGroup().get(EMaterialsFormControls.assemblyTestingFormGroup) as FormGroup;
  });

  afterSalesFormGroup = computed(() => {
    return this.formGroup().get(EMaterialsFormControls.afterSalesFormGroup) as FormGroup;
  });

  // Helper method to get FormArray items
  getSectionItems(sectionFormGroup: FormGroup | null): FormGroup[] {
    if (!sectionFormGroup) return [];
    const itemsArray = sectionFormGroup.get('items') as FormArray;
    if (!itemsArray) return [];
    return itemsArray.controls.filter(control => control instanceof FormGroup) as FormGroup[];
  }

  // Helper method to get value from nested form group
  getValue(formGroup: FormGroup, controlName: string): any {
    const control = formGroup.get(controlName);
    if (control instanceof FormGroup) {
      const valueControl = control.get(EMaterialsFormControls.value);
      return valueControl ? valueControl.value : control.value;
    }
    return control?.value ?? null;
  }

  // Helper to format value for display
  formatValue(value: any): string {
    if (value === null || value === undefined || value === '') {
      return '-';
    }
    if (typeof value === 'object' && value !== null) {
      if (value.name) {
        return value.name;
      }
      return JSON.stringify(value);
    }
    return String(value);
  }

  hasFieldError(fieldPath: string): boolean {
    if (!this.validationErrors()) {
      return false;
    }
    return this.validationErrors()!.fieldErrors.has(fieldPath);
  }

  onEditClick(): void {
    this.onEdit.emit();
  }

  // Computed arrays for each section
  designEngineeringItems = computed(() => this.getSectionItems(this.designEngineeringFormGroup()));
  sourcingItems = computed(() => this.getSectionItems(this.sourcingFormGroup()));
  manufacturingItems = computed(() => this.getSectionItems(this.manufacturingFormGroup()));
  assemblyTestingItems = computed(() => this.getSectionItems(this.assemblyTestingFormGroup()));
  afterSalesItems = computed(() => this.getSectionItems(this.afterSalesFormGroup()));
}
