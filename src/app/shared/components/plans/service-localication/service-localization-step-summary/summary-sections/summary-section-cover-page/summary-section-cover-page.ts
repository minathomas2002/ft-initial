import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { FormArray, FormGroup } from '@angular/forms';
import { EMaterialsFormControls } from 'src/app/shared/enums';
import { IPageComment } from 'src/app/shared/interfaces/plans.interface';
import { SummarySectionHeader } from '../../../../summary-section-header/summary-section-header';
import { SummaryTableCell } from '../../../../summary-table-cell/summary-table-cell';
import { TableModule } from 'primeng/table';

@Component({
  selector: 'app-summary-section-cover-page',
  imports: [SummarySectionHeader, SummaryTableCell, TableModule],
  templateUrl: './summary-section-cover-page.html',
  styleUrl: './summary-section-cover-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SummarySectionCoverPage {
  isViewMode = input<boolean>(false);
  formGroup = input.required<FormGroup>();
  investorComments = input<IPageComment[]>([]);
  correctedFieldIds = input<string[]>([]);
  onEdit = output<void>();

  // Form group accessors
  coverPageCompanyInformationFormGroup = computed(() => {
    return this.formGroup().get(EMaterialsFormControls.coverPageCompanyInformationFormGroup) as FormGroup;
  });

  servicesFormArray = computed(() => {
    return this.formGroup().get(EMaterialsFormControls.servicesFormGroup) as FormArray;
  });

  hasFieldError(fieldPath: string): boolean {
    const parts = fieldPath.split('.');
    let control: any = this.formGroup();

    for (const part of parts) {
      if (control instanceof FormGroup || control instanceof FormArray) {
        control = control.get(part);
      } else {
        return false;
      }
    }

    if (control && control.invalid && (control.dirty || control.touched)) {
      return true;
    }

    return false;
  }

  onEditClick(): void {
    this.onEdit.emit();
  }

  // Computed values for Company Information
  companyName = computed(() => {
    const companyInfo = this.coverPageCompanyInformationFormGroup();
    const companyNameControl = companyInfo?.get(EMaterialsFormControls.companyName);
    if (companyNameControl instanceof FormGroup) {
      return companyNameControl.get(EMaterialsFormControls.value)?.value;
    }
    return null;
  });

  // Services array
  services = computed(() => {
    const servicesArray = this.servicesFormArray();
    if (!servicesArray) return [];

    return Array.from({ length: servicesArray.length }, (_, i) => {
      const group = servicesArray.at(i) as FormGroup;
      return {
        serviceName: group.get(EMaterialsFormControls.serviceName)?.get(EMaterialsFormControls.value)?.value ?? group.get(EMaterialsFormControls.serviceName)?.value,
      };
    });
  });

  hasServiceItemFieldError(index: number, controlName: string): boolean {
    return this.hasFieldError(`servicesFormGroup.${index}.${controlName}.value`);
  }
}
