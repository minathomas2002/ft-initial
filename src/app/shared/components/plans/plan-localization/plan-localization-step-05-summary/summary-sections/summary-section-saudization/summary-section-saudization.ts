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
import { SummaryComments } from 'src/app/shared/components/plans/summary-comments/summary-comments';
import { IPageComment } from 'src/app/shared/interfaces/plans.interface';

@Component({
  selector: 'app-summary-section-saudization',
  imports: [SummarySectionHeader, CommonModule, SummaryTableCell, SummaryComments, TableModule, TranslatePipe, ImageErrorDirective],
  templateUrl: './summary-section-saudization.html',
  styleUrl: './summary-section-saudization.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SummarySectionSaudization {
  isViewMode = input<boolean>(false);
  private readonly formService = inject(ProductPlanFormService);
  private readonly i18nService = inject(I18nService);

  formGroup = input.required<FormGroup>();
  pageComments = input<IPageComment[]>([]);
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

    return [
      {
        label: this.i18nService.translate('plans.summary.saudization.annualHeadcount'),
        controlName: annualHeadcountControlName,
        year1: this.getRowValueForYear(1, annualHeadcountControlName),
        year1HasError: this.getRowHasErrorForYear(1, annualHeadcountControlName),
        year1HasComment: this.hasYearComment(annualHeadcountControlName, 1),
        year2: this.getRowValueForYear(2, annualHeadcountControlName),
        year2HasError: this.getRowHasErrorForYear(2, annualHeadcountControlName),
        year2HasComment: this.hasYearComment(annualHeadcountControlName, 2),
        year3: this.getRowValueForYear(3, annualHeadcountControlName),
        year3HasError: this.getRowHasErrorForYear(3, annualHeadcountControlName),
        year3HasComment: this.hasYearComment(annualHeadcountControlName, 3),
        year4: this.getRowValueForYear(4, annualHeadcountControlName),
        year4HasError: this.getRowHasErrorForYear(4, annualHeadcountControlName),
        year4HasComment: this.hasYearComment(annualHeadcountControlName, 4),
        year5: this.getRowValueForYear(5, annualHeadcountControlName),
        year5HasError: this.getRowHasErrorForYear(5, annualHeadcountControlName),
        year5HasComment: this.hasYearComment(annualHeadcountControlName, 5),
        year6: this.getRowValueForYear(6, annualHeadcountControlName),
        year6HasError: this.getRowHasErrorForYear(6, annualHeadcountControlName),
        year6HasComment: this.hasYearComment(annualHeadcountControlName, 6),
        year7: this.getRowValueForYear(7, annualHeadcountControlName),
        year7HasError: this.getRowHasErrorForYear(7, annualHeadcountControlName),
        year7HasComment: this.hasYearComment(annualHeadcountControlName, 7),
      },
      {
        label: this.i18nService.translate('plans.summary.saudization.saudizationPercentage'),
        subtitle: this.i18nService.translate('plans.summary.saudization.saudizationSubtitle'),
        controlName: saudizationPercentageControlName,
        year1: this.getRowValueForYear(1, saudizationPercentageControlName),
        year1HasError: this.getRowHasErrorForYear(1, saudizationPercentageControlName),
        year1HasComment: this.hasYearComment(saudizationPercentageControlName, 1),
        year2: this.getRowValueForYear(2, saudizationPercentageControlName),
        year2HasError: this.getRowHasErrorForYear(2, saudizationPercentageControlName),
        year2HasComment: this.hasYearComment(saudizationPercentageControlName, 2),
        year3: this.getRowValueForYear(3, saudizationPercentageControlName),
        year3HasError: this.getRowHasErrorForYear(3, saudizationPercentageControlName),
        year3HasComment: this.hasYearComment(saudizationPercentageControlName, 3),
        year4: this.getRowValueForYear(4, saudizationPercentageControlName),
        year4HasError: this.getRowHasErrorForYear(4, saudizationPercentageControlName),
        year4HasComment: this.hasYearComment(saudizationPercentageControlName, 4),
        year5: this.getRowValueForYear(5, saudizationPercentageControlName),
        year5HasError: this.getRowHasErrorForYear(5, saudizationPercentageControlName),
        year5HasComment: this.hasYearComment(saudizationPercentageControlName, 5),
        year6: this.getRowValueForYear(6, saudizationPercentageControlName),
        year6HasError: this.getRowHasErrorForYear(6, saudizationPercentageControlName),
        year6HasComment: this.hasYearComment(saudizationPercentageControlName, 6),
        year7: this.getRowValueForYear(7, saudizationPercentageControlName),
        year7HasError: this.getRowHasErrorForYear(7, saudizationPercentageControlName),
        year7HasComment: this.hasYearComment(saudizationPercentageControlName, 7),
      },
      {
        label: this.i18nService.translate('plans.summary.saudization.annualTotalCompensation'),
        controlName: annualTotalCompensationControlName,
        year1: this.getRowValueForYear(1, annualTotalCompensationControlName),
        year1HasError: this.getRowHasErrorForYear(1, annualTotalCompensationControlName),
        year1HasComment: this.hasYearComment(annualTotalCompensationControlName, 1),
        year2: this.getRowValueForYear(2, annualTotalCompensationControlName),
        year2HasError: this.getRowHasErrorForYear(2, annualTotalCompensationControlName),
        year2HasComment: this.hasYearComment(annualTotalCompensationControlName, 2),
        year3: this.getRowValueForYear(3, annualTotalCompensationControlName),
        year3HasError: this.getRowHasErrorForYear(3, annualTotalCompensationControlName),
        year3HasComment: this.hasYearComment(annualTotalCompensationControlName, 3),
        year4: this.getRowValueForYear(4, annualTotalCompensationControlName),
        year4HasError: this.getRowHasErrorForYear(4, annualTotalCompensationControlName),
        year4HasComment: this.hasYearComment(annualTotalCompensationControlName, 4),
        year5: this.getRowValueForYear(5, annualTotalCompensationControlName),
        year5HasError: this.getRowHasErrorForYear(5, annualTotalCompensationControlName),
        year5HasComment: this.hasYearComment(annualTotalCompensationControlName, 5),
        year6: this.getRowValueForYear(6, annualTotalCompensationControlName),
        year6HasError: this.getRowHasErrorForYear(6, annualTotalCompensationControlName),
        year6HasComment: this.hasYearComment(annualTotalCompensationControlName, 6),
        year7: this.getRowValueForYear(7, annualTotalCompensationControlName),
        year7HasError: this.getRowHasErrorForYear(7, annualTotalCompensationControlName),
        year7HasComment: this.hasYearComment(annualTotalCompensationControlName, 7),
      },
      {
        label: this.i18nService.translate('plans.summary.saudization.saudiCompensationPercentage'),
        subtitle: this.i18nService.translate('plans.summary.saudization.saudiCompensationSubtitle'),
        controlName: saudiCompensationPercentageControlName,
        year1: this.getRowValueForYear(1, saudiCompensationPercentageControlName),
        year1HasError: this.getRowHasErrorForYear(1, saudiCompensationPercentageControlName),
        year1HasComment: this.hasYearComment(saudiCompensationPercentageControlName, 1),
        year2: this.getRowValueForYear(2, saudiCompensationPercentageControlName),
        year2HasError: this.getRowHasErrorForYear(2, saudiCompensationPercentageControlName),
        year2HasComment: this.hasYearComment(saudiCompensationPercentageControlName, 2),
        year3: this.getRowValueForYear(3, saudiCompensationPercentageControlName),
        year3HasError: this.getRowHasErrorForYear(3, saudiCompensationPercentageControlName),
        year3HasComment: this.hasYearComment(saudiCompensationPercentageControlName, 3),
        year4: this.getRowValueForYear(4, saudiCompensationPercentageControlName),
        year4HasError: this.getRowHasErrorForYear(4, saudiCompensationPercentageControlName),
        year4HasComment: this.hasYearComment(saudiCompensationPercentageControlName, 4),
        year5: this.getRowValueForYear(5, saudiCompensationPercentageControlName),
        year5HasError: this.getRowHasErrorForYear(5, saudiCompensationPercentageControlName),
        year5HasComment: this.hasYearComment(saudiCompensationPercentageControlName, 5),
        year6: this.getRowValueForYear(6, saudiCompensationPercentageControlName),
        year6HasError: this.getRowHasErrorForYear(6, saudiCompensationPercentageControlName),
        year6HasComment: this.hasYearComment(saudiCompensationPercentageControlName, 6),
        year7: this.getRowValueForYear(7, saudiCompensationPercentageControlName),
        year7HasError: this.getRowHasErrorForYear(7, saudiCompensationPercentageControlName),
        year7HasComment: this.hasYearComment(saudiCompensationPercentageControlName, 7),
      },
    ];
  });
}
