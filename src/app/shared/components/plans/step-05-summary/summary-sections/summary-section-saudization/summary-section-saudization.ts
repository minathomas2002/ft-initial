import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { EMaterialsFormControls } from 'src/app/shared/enums';
import { IStepValidationErrors } from 'src/app/shared/services/plan/validation/product-plan-validation.service';
import { SummarySectionHeader } from '../../shared/summary-section-header/summary-section-header';
import { CommonModule } from '@angular/common';
import { ProductPlanFormService } from 'src/app/shared/services/plan/materials-form-service/product-plan-form-service';
import { SummaryTableCell } from '../../shared/summary-table-cell/summary-table-cell';
import { TableModule } from 'primeng/table';

@Component({
  selector: 'app-summary-section-saudization',
  imports: [SummarySectionHeader, CommonModule, SummaryTableCell, TableModule],
  templateUrl: './summary-section-saudization.html',
  styleUrl: './summary-section-saudization.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SummarySectionSaudization {
  private readonly formService = inject(ProductPlanFormService);

  formGroup = input.required<FormGroup>();
  onEdit = output<void>();

  // Expose enum to template
  readonly EMaterialsFormControls = EMaterialsFormControls;

  // Years array for table columns
  readonly years = [1, 2, 3, 4, 5, 6, 7];

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

  getRowHasErrorForYear(year: number, rowName: string): any {
    return this.formService.getRowHasErrorForYear(year, rowName);
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
    const parts = fieldPath.split('.');
    let control: any = this.formGroup();

    for (const part of parts) {
      if (control instanceof FormGroup) {
        control = control.get(part);
      } else {
        return false;
      }
    }

    if (control && control.invalid && control.dirty) {
      return true;
    }

    return false;
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

  // Table rows data for PrimeNG table
  tableRows = computed(() => {
    return [
      {
        label: 'Annual Headcount (#)',
        controlName: EMaterialsFormControls.annualHeadcount,
        year1: this.getRowValueForYear(1, EMaterialsFormControls.annualHeadcount),
        year1HasError: this.getRowHasErrorForYear(1, EMaterialsFormControls.annualHeadcount),
        year2: this.getRowValueForYear(2, EMaterialsFormControls.annualHeadcount),
        year2HasError: this.getRowHasErrorForYear(2, EMaterialsFormControls.annualHeadcount),
        year3: this.getRowValueForYear(3, EMaterialsFormControls.annualHeadcount),
        year3HasError: this.getRowHasErrorForYear(3, EMaterialsFormControls.annualHeadcount),
        year4: this.getRowValueForYear(4, EMaterialsFormControls.annualHeadcount),
        year4HasError: this.getRowHasErrorForYear(4, EMaterialsFormControls.annualHeadcount),
        year5: this.getRowValueForYear(5, EMaterialsFormControls.annualHeadcount),
        year5HasError: this.getRowHasErrorForYear(5, EMaterialsFormControls.annualHeadcount),
        year6: this.getRowValueForYear(6, EMaterialsFormControls.annualHeadcount),
        year6HasError: this.getRowHasErrorForYear(6, EMaterialsFormControls.annualHeadcount),
        year7: this.getRowValueForYear(7, EMaterialsFormControls.annualHeadcount),
        year7HasError: this.getRowHasErrorForYear(7, EMaterialsFormControls.annualHeadcount),
      },
      {
        label: 'Saudization %',
        subtitle: '(No. of Saudi employees / Total employees)',
        controlName: EMaterialsFormControls.saudizationPercentage,
        year1: this.getRowValueForYear(1, EMaterialsFormControls.saudizationPercentage),
        year1HasError: this.getRowHasErrorForYear(1, EMaterialsFormControls.saudizationPercentage),
        year2: this.getRowValueForYear(2, EMaterialsFormControls.saudizationPercentage),
        year2HasError: this.getRowHasErrorForYear(2, EMaterialsFormControls.saudizationPercentage),
        year3: this.getRowValueForYear(3, EMaterialsFormControls.saudizationPercentage),
        year3HasError: this.getRowHasErrorForYear(3, EMaterialsFormControls.saudizationPercentage),
        year4: this.getRowValueForYear(4, EMaterialsFormControls.saudizationPercentage),
        year4HasError: this.getRowHasErrorForYear(4, EMaterialsFormControls.saudizationPercentage),
        year5: this.getRowValueForYear(5, EMaterialsFormControls.saudizationPercentage),
        year5HasError: this.getRowHasErrorForYear(5, EMaterialsFormControls.saudizationPercentage),
        year6: this.getRowValueForYear(6, EMaterialsFormControls.saudizationPercentage),
        year6HasError: this.getRowHasErrorForYear(6, EMaterialsFormControls.saudizationPercentage),
        year7: this.getRowValueForYear(7, EMaterialsFormControls.saudizationPercentage),
        year7HasError: this.getRowHasErrorForYear(7, EMaterialsFormControls.saudizationPercentage),
      },
      {
        label: 'Annual Total Compensation (SAR)',
        controlName: EMaterialsFormControls.annualTotalCompensation,
        year1: this.getRowValueForYear(1, EMaterialsFormControls.annualTotalCompensation),
        year1HasError: this.getRowHasErrorForYear(1, EMaterialsFormControls.annualTotalCompensation),
        year2: this.getRowValueForYear(2, EMaterialsFormControls.annualTotalCompensation),
        year2HasError: this.getRowHasErrorForYear(2, EMaterialsFormControls.annualTotalCompensation),
        year3: this.getRowValueForYear(3, EMaterialsFormControls.annualTotalCompensation),
        year3HasError: this.getRowHasErrorForYear(3, EMaterialsFormControls.annualTotalCompensation),
        year4: this.getRowValueForYear(4, EMaterialsFormControls.annualTotalCompensation),
        year4HasError: this.getRowHasErrorForYear(4, EMaterialsFormControls.annualTotalCompensation),
        year5: this.getRowValueForYear(5, EMaterialsFormControls.annualTotalCompensation),
        year5HasError: this.getRowHasErrorForYear(5, EMaterialsFormControls.annualTotalCompensation),
        year6: this.getRowValueForYear(6, EMaterialsFormControls.annualTotalCompensation),
        year6HasError: this.getRowHasErrorForYear(6, EMaterialsFormControls.annualTotalCompensation),
        year7: this.getRowValueForYear(7, EMaterialsFormControls.annualTotalCompensation),
        year7HasError: this.getRowHasErrorForYear(7, EMaterialsFormControls.annualTotalCompensation),
      },
      {
        label: 'Saudi Compensation %',
        subtitle: '(Saudi compensation / Total compensation)',
        controlName: EMaterialsFormControls.saudiCompensationPercentage,
        year1: this.getRowValueForYear(1, EMaterialsFormControls.saudiCompensationPercentage),
        year1HasError: this.getRowHasErrorForYear(1, EMaterialsFormControls.saudiCompensationPercentage),
        year2: this.getRowValueForYear(2, EMaterialsFormControls.saudiCompensationPercentage),
        year2HasError: this.getRowHasErrorForYear(2, EMaterialsFormControls.saudiCompensationPercentage),
        year3: this.getRowValueForYear(3, EMaterialsFormControls.saudiCompensationPercentage),
        year3HasError: this.getRowHasErrorForYear(3, EMaterialsFormControls.saudiCompensationPercentage),
        year4: this.getRowValueForYear(4, EMaterialsFormControls.saudiCompensationPercentage),
        year4HasError: this.getRowHasErrorForYear(4, EMaterialsFormControls.saudiCompensationPercentage),
        year5: this.getRowValueForYear(5, EMaterialsFormControls.saudiCompensationPercentage),
        year5HasError: this.getRowHasErrorForYear(5, EMaterialsFormControls.saudiCompensationPercentage),
        year6: this.getRowValueForYear(6, EMaterialsFormControls.saudiCompensationPercentage),
        year6HasError: this.getRowHasErrorForYear(6, EMaterialsFormControls.saudiCompensationPercentage),
        year7: this.getRowValueForYear(7, EMaterialsFormControls.saudiCompensationPercentage),
        year7HasError: this.getRowHasErrorForYear(7, EMaterialsFormControls.saudiCompensationPercentage),
      },
    ];
  });
}
