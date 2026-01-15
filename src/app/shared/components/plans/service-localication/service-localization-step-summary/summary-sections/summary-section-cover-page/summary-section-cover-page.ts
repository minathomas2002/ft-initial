import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { FormArray, FormGroup } from '@angular/forms';
import { EMaterialsFormControls } from 'src/app/shared/enums';
import { IPageComment } from 'src/app/shared/interfaces/plans.interface';
import { SummarySectionHeader } from '../../../../summary-section-header/summary-section-header';
import { SummaryField } from '../../../../summary-field/summary-field';
import { SummaryTableCell } from '../../../../summary-table-cell/summary-table-cell';
import { TableModule } from 'primeng/table';

@Component({
  selector: 'app-summary-section-cover-page',
  imports: [SummarySectionHeader, SummaryField, SummaryTableCell, TableModule],
  templateUrl: './summary-section-cover-page.html',
  styleUrl: './summary-section-cover-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SummarySectionCoverPage {
  isViewMode = input<boolean>(false);
  formGroup = input.required<FormGroup>();
  pageComments = input<IPageComment[]>([]);
  commentTitle = input<string>('Comments');
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
  planTitle = computed(() => {
    const companyInfo = this.coverPageCompanyInformationFormGroup();
    const planTitleControl = companyInfo?.get(EMaterialsFormControls.planTitle);
    if (planTitleControl instanceof FormGroup) {
      return planTitleControl.get(EMaterialsFormControls.value)?.value;
    }
    return null;
  });

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

  // Check if a field has a comment
  hasFieldComment(fieldKey: string, section?: string, rowId?: string): boolean {
    // Helper function to check if inputKey matches the fieldKey
    // Handles cases where inputKey might have an index suffix (e.g., 'fieldName_0', 'fieldName_1')
    const matchesInputKey = (inputKey: string): boolean => {
      // Exact match
      if (inputKey === fieldKey) return true;
      // Match with section prefix
      if (section && inputKey === `${section}.${fieldKey}`) return true;
      // Match with index suffix (for table rows): 'fieldKey_0', 'fieldKey_1', etc.
      if (inputKey.startsWith(fieldKey + '_') && /^\d+$/.test(inputKey.substring(fieldKey.length + 1))) return true;
      // Match with section prefix and index suffix: 'section.fieldKey_0', 'section.fieldKey_1', etc.
      if (section && inputKey.startsWith(`${section}.${fieldKey}_`) && /^\d+$/.test(inputKey.substring(`${section}.${fieldKey}`.length + 1))) return true;
      return false;
    };

    // For investor view mode, check if any field with this inputKey has an ID in correctedFieldIds
    if (this.correctedFieldIds().length > 0) {
      const hasCorrectedField = this.pageComments().some(comment =>
        comment.fields?.some(field =>
          matchesInputKey(field.inputKey) &&
          (!section || field.section === section) &&
          field.id &&
          this.correctedFieldIds().includes(field.id) &&
          (rowId === undefined || field.id === rowId)
        )
      );
      if (hasCorrectedField) {
        return true;
      }
    }

    // Check if field has comments
    return this.pageComments().some(comment =>
      comment.fields?.some(field =>
        matchesInputKey(field.inputKey) &&
        (!section || field.section === section) &&
        (rowId === undefined || field.id === rowId)
      )
    );
  }

  // Computed properties for comment status
  planTitleHasComment = computed(() => this.hasFieldComment('planTitle', 'companyInformation'));
  companyNameHasComment = computed(() => this.hasFieldComment('companyName', 'companyInformation'));

  // For services array items
  hasServiceItemComment(index: number): boolean {
    const servicesArray = this.servicesFormArray();
    if (!servicesArray || index >= servicesArray.length) return false;
    const serviceGroup = servicesArray.at(index) as FormGroup;
    const rowId = serviceGroup.get('rowId')?.value;
    return this.hasFieldComment('serviceName', 'services', rowId);
  }
}
