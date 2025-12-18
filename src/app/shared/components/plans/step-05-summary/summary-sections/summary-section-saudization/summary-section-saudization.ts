import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { EMaterialsFormControls } from 'src/app/shared/enums';
import { IStepValidationErrors } from 'src/app/shared/services/plan/validation/product-plan-validation.service';
import { SummarySectionHeader } from '../../shared/summary-section-header/summary-section-header';
import { CommonModule } from '@angular/common';
import { ProductPlanFormService } from 'src/app/shared/services/plan/materials-form-service/product-plan-form-service';

@Component({
  selector: 'app-summary-section-saudization',
  imports: [SummarySectionHeader, CommonModule],
  templateUrl: './summary-section-saudization.html',
  styleUrl: './summary-section-saudization.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SummarySectionSaudization {
  private readonly formService = inject(ProductPlanFormService);

  formGroup = input.required<FormGroup>();
  validationErrors = input<IStepValidationErrors | undefined>();
  hasErrors = input<boolean>(false);
  onEdit = output<void>();

  // Expose enum to template
  readonly EMaterialsFormControls = EMaterialsFormControls;

  // Years array for table columns
  readonly years = [1, 2, 3];

  // Form group accessors
  saudizationFormGroup = computed(() => {
    return this.formGroup().get(EMaterialsFormControls.saudizationFormGroup) as FormGroup;
  });

  attachmentsFormGroup = computed(() => {
    return this.formGroup().get(EMaterialsFormControls.attachmentsFormGroup) as FormGroup;
  });

  // Helper method to get row value for a specific year
  getRowValueForYear(year: number, rowName: string): any {
    return this.formService.getRowValueForYear(year, rowName);
  }

  // Helper method to format value
  formatValue(value: any): string {
    if (value === null || value === undefined || value === '') {
      return '-';
    }
    if (typeof value === 'number') {
      return value.toLocaleString();
    }
    return String(value);
  }

  // Helper method to format percentage
  formatPercentage(value: any): string {
    if (value === null || value === undefined || value === '') {
      return '-';
    }
    if (typeof value === 'number') {
      return `${value}%`;
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

  // Get attachments value
  attachments = computed(() => {
    const attachmentsControl = this.attachmentsFormGroup()?.get(EMaterialsFormControls.attachments);
    if (attachmentsControl instanceof FormGroup) {
      const valueControl = attachmentsControl.get(EMaterialsFormControls.value);
      return valueControl ? valueControl.value : attachmentsControl.value;
    }
    return attachmentsControl?.value ?? null;
  });

  // Check if attachments exist
  hasAttachments = computed(() => {
    const atts = this.attachments();
    return atts && Array.isArray(atts) && atts.length > 0;
  });
}
