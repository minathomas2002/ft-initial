import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { EMaterialsFormControls } from 'src/app/shared/enums';
import { IStepValidationErrors } from 'src/app/shared/services/plan/validation/product-plan-validation.service';
import { CommonModule } from '@angular/common';
import { ProductPlanFormService } from 'src/app/shared/services/plan/product-plan-form-service/product-plan-form-service';
import { TableModule } from 'primeng/table';
import { I18nService } from 'src/app/shared/services/i18n/i18n.service';
import { TranslatePipe } from 'src/app/shared/pipes';
import { ImageErrorDirective } from 'src/app/shared/directives/image-error.directive';
import { SummaryTableCell } from 'src/app/shared/components/plans/summary-table-cell/summary-table-cell';
import { SummarySectionHeader } from 'src/app/shared/components/plans/summary-section-header/summary-section-header';
import { IPageComment, IProductPlanResponse, SaudizationRow } from 'src/app/shared/interfaces/plans.interface';
import { PlanStore } from 'src/app/shared/stores/plan/plan.store';

@Component({
  selector: 'app-summary-section-saudization',
  imports: [SummarySectionHeader, CommonModule, SummaryTableCell, TableModule, TranslatePipe, ImageErrorDirective],
  templateUrl: './summary-section-saudization.html',
  styleUrl: './summary-section-saudization.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SummarySectionSaudization {
  isViewMode = input<boolean>(false);
  private readonly formService = inject(ProductPlanFormService);
  private readonly i18nService = inject(I18nService);
  private readonly planStore = inject(PlanStore);

  formGroup = input.required<FormGroup>();
  pageComments = input<IPageComment[]>([]);
  commentTitle = input<string>('Comments');
  originalPlanResponse = input<IProductPlanResponse | null>(null);
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

  // Helper method to check if a field has comments
  hasFieldComment(fieldKey: string, rowId?: string): boolean {
    return this.pageComments().some(comment =>
      comment.fields?.some(field =>
        field.inputKey === fieldKey &&
        (rowId === undefined || field.id === rowId)
      )
    );
  }

  // Helper method to check if a year cell has comments
  hasYearComment(controlName: string, year: number, rowId?: string): boolean {
    const yearKey = `${controlName}_year${year}`;
    return this.hasFieldComment(yearKey, rowId);
  }

  // Helper method to get before value from original plan response
  getBeforeValue(controlName: string, year: number): any {
    const originalPlan = this.originalPlanResponse();
    if (!originalPlan?.productPlan?.saudization?.saudizationRows) return null;

    const saudizationType = this.getSaudizationType(controlName);
    const row = originalPlan.productPlan.saudization.saudizationRows.find(
      r => r.saudizationType === saudizationType
    );

    if (!row) return null;

    // Map year number to property name (SaudizationRow has year1-year7 properties)
    const yearPropertyMap: Record<number, keyof SaudizationRow> = {
      1: 'year1',
      2: 'year2',
      3: 'year3',
      4: 'year4',
      5: 'year5',
      6: 'year6',
      7: 'year7',
    };

    const property = yearPropertyMap[year];
    return property ? (row[property] ?? null) : null;
  }

  // Helper method to map control name to saudization type
  private getSaudizationType(controlName: string): number {
    const typeMap: Record<string, number> = {
      [EMaterialsFormControls.annualHeadcount]: 1,
      [EMaterialsFormControls.saudizationPercentage]: 2,
      [EMaterialsFormControls.annualTotalCompensation]: 3,
      [EMaterialsFormControls.saudiCompensationPercentage]: 4,
    };
    return typeMap[controlName] ?? 0;
  }

  // Helper method to check if field should show diff
  shouldShowDiff(controlName: string, year: number, currentValue?: any): boolean {
    // Show diff in resubmit mode or view mode (when viewing plan details)
    const wizardMode = this.planStore.wizardMode();
    if (wizardMode !== 'resubmit' && wizardMode !== 'view') return false;
    // Only show diff if field has a comment
    if (!this.hasYearComment(controlName, year)) return false;

    const beforeValue = this.getBeforeValue(controlName, year);
    const afterValue = currentValue;

    // Compare values
    if (beforeValue === afterValue) return false;
    if (beforeValue === null || beforeValue === undefined || beforeValue === '') {
      return afterValue !== null && afterValue !== undefined && afterValue !== '';
    }
    if (afterValue === null || afterValue === undefined || afterValue === '') {
      return true;
    }

    // For numbers, compare directly
    if (typeof beforeValue === 'number' && typeof afterValue === 'number') {
      return beforeValue !== afterValue;
    }

    return String(beforeValue) !== String(afterValue);
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

  // Check if attachments field has validation errors
  hasAttachmentsError = computed(() => {
    return this.hasFieldError(`${EMaterialsFormControls.attachmentsFormGroup}.${EMaterialsFormControls.attachments}`);
  });

  // Get file icon based on file type
  getFileIcon(file: any): string | null {
    if (!file) return null;

    // Check for ZIP files
    if (
      file.name?.toLowerCase().endsWith('.zip') ||
      file.type === 'application/zip' ||
      file.type === 'application/x-zip-compressed'
    ) {
      return 'assets/images/zip.png';
    }

    // Check for PDF files
    if (
      file.name?.toLowerCase().endsWith('.pdf') ||
      file.type === 'application/pdf'
    ) {
      return 'assets/images/pdf.png';
    }

    return null;
  }

  // Table rows data for PrimeNG table
  tableRows = computed(() => {
    this.i18nService.currentLanguage();
    const annualHeadcountControlName = EMaterialsFormControls.annualHeadcount;
    const saudizationPercentageControlName = EMaterialsFormControls.saudizationPercentage;
    const annualTotalCompensationControlName = EMaterialsFormControls.annualTotalCompensation;
    const saudiCompensationPercentageControlName = EMaterialsFormControls.saudiCompensationPercentage;

    const createYearData = (controlName: string, year: number) => {
      const value = this.getRowValueForYear(year, controlName);
      const formattedValue = this.formatValue(value);
      const hasComment = this.hasYearComment(controlName, year);
      const beforeValue = hasComment ? this.getBeforeValue(controlName, year) : null;
      const formattedBeforeValue = beforeValue !== null && beforeValue !== undefined ? this.formatValue(beforeValue) : null;
      
      return {
        [`year${year}`]: formattedValue,
        [`year${year}BeforeValue`]: formattedBeforeValue,
        [`year${year}AfterValue`]: formattedValue,
        [`year${year}ShowDiff`]: this.shouldShowDiff(controlName, year, formattedValue),
        [`year${year}HasError`]: this.getRowHasErrorForYear(year, controlName),
        [`year${year}HasComment`]: hasComment,
      };
    };

    return [
      {
        label: this.i18nService.translate('plans.summary.saudization.annualHeadcount'),
        controlName: annualHeadcountControlName,
        ...createYearData(annualHeadcountControlName, 1),
        ...createYearData(annualHeadcountControlName, 2),
        ...createYearData(annualHeadcountControlName, 3),
        ...createYearData(annualHeadcountControlName, 4),
        ...createYearData(annualHeadcountControlName, 5),
        ...createYearData(annualHeadcountControlName, 6),
        ...createYearData(annualHeadcountControlName, 7),
      },
      {
        label: this.i18nService.translate('plans.summary.saudization.saudizationPercentage'),
        subtitle: this.i18nService.translate('plans.summary.saudization.saudizationSubtitle'),
        controlName: saudizationPercentageControlName,
        ...createYearData(saudizationPercentageControlName, 1),
        ...createYearData(saudizationPercentageControlName, 2),
        ...createYearData(saudizationPercentageControlName, 3),
        ...createYearData(saudizationPercentageControlName, 4),
        ...createYearData(saudizationPercentageControlName, 5),
        ...createYearData(saudizationPercentageControlName, 6),
        ...createYearData(saudizationPercentageControlName, 7),
      },
      {
        label: this.i18nService.translate('plans.summary.saudization.annualTotalCompensation'),
        controlName: annualTotalCompensationControlName,
        ...createYearData(annualTotalCompensationControlName, 1),
        ...createYearData(annualTotalCompensationControlName, 2),
        ...createYearData(annualTotalCompensationControlName, 3),
        ...createYearData(annualTotalCompensationControlName, 4),
        ...createYearData(annualTotalCompensationControlName, 5),
        ...createYearData(annualTotalCompensationControlName, 6),
        ...createYearData(annualTotalCompensationControlName, 7),
      },
      {
        label: this.i18nService.translate('plans.summary.saudization.saudiCompensationPercentage'),
        subtitle: this.i18nService.translate('plans.summary.saudization.saudiCompensationSubtitle'),
        controlName: saudiCompensationPercentageControlName,
        ...createYearData(saudiCompensationPercentageControlName, 1),
        ...createYearData(saudiCompensationPercentageControlName, 2),
        ...createYearData(saudiCompensationPercentageControlName, 3),
        ...createYearData(saudiCompensationPercentageControlName, 4),
        ...createYearData(saudiCompensationPercentageControlName, 5),
        ...createYearData(saudiCompensationPercentageControlName, 6),
        ...createYearData(saudiCompensationPercentageControlName, 7),
      },
    ];
  });
}
