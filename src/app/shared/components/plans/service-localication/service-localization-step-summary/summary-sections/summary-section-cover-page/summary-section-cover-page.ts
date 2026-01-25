import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { FormArray, FormGroup } from '@angular/forms';
import { EMaterialsFormControls } from 'src/app/shared/enums';
import { IFieldInformation, IPageComment, IServiceLocalizationPlanResponse } from 'src/app/shared/interfaces/plans.interface';
import { SummarySectionHeader } from '../../../../summary-section-header/summary-section-header';
import { SummaryField } from '../../../../summary-field/summary-field';
import { SummaryTableCell } from '../../../../summary-table-cell/summary-table-cell';
import { TableModule } from 'primeng/table';
import { PlanStore } from 'src/app/shared/stores/plan/plan.store';

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
  originalPlanResponse = input<IServiceLocalizationPlanResponse | null>(null);
  onEdit = output<void>();
  private readonly planStore = inject(PlanStore);

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

  // Check if a field is resolved/corrected by investor (based on correctedFieldIds)
  isFieldResolved(fieldKey: string, section?: string, rowId?: string): boolean {
    if (this.correctedFieldIds().length === 0) return false;

    const corrected = this.correctedFieldIds();

    const normalizedKeyForField = (field: IFieldInformation): string | null => {
      if (!field.inputKey) return null;
      if (field.section && field.inputKey.startsWith(field.section + '.')) {
        return field.inputKey;
      }
      if (field.section) {
        return `${field.section}.${field.inputKey}`;
      }
      return field.inputKey;
    };

    const isCorrected = (field: IFieldInformation): boolean => {
      // For array rows, require rowId match via field.id to avoid marking every row corrected.
      if (rowId !== undefined) {
        return !!field.id && field.id === rowId && corrected.includes(field.id);
      }

      if (field.id && corrected.includes(field.id)) return true;
      const key = normalizedKeyForField(field);
      return !!key && corrected.includes(key);
    };

    const matchesInputKey = (inputKey: string): boolean => {
      if (inputKey === fieldKey) return true;
      if (section && inputKey === `${section}.${fieldKey}`) return true;
      if (inputKey.startsWith(fieldKey + '_') && /^\d+$/.test(inputKey.substring(fieldKey.length + 1))) return true;
      if (
        section &&
        inputKey.startsWith(`${section}.${fieldKey}_`) &&
        /^\d+$/.test(inputKey.substring(`${section}.${fieldKey}`.length + 1))
      )
        return true;
      return false;
    };

    return this.pageComments().some((comment) =>
      comment.fields?.some(
        (field) =>
          matchesInputKey(field.inputKey) &&
          (!section || field.section === section) &&
          isCorrected(field)
      )
    );
  }

  // Computed properties for comment status
  planTitleHasComment = computed(() => this.hasFieldComment('planTitle', 'companyInformation'));
  companyNameHasComment = computed(() => this.hasFieldComment('companyName', 'companyInformation'));

  planTitleIsResolved = computed(() => this.isFieldResolved('planTitle', 'companyInformation'));
  companyNameIsResolved = computed(() => this.isFieldResolved('companyName', 'companyInformation'));

  // For services array items
  hasServiceItemComment(index: number): boolean {
    const servicesArray = this.servicesFormArray();
    if (!servicesArray || index >= servicesArray.length) return false;
    const serviceGroup = servicesArray.at(index) as FormGroup;
    const rowId = serviceGroup.get('rowId')?.value;
    return this.hasFieldComment('serviceName', 'services', rowId);
  }

  isServiceItemResolved(index: number): boolean {
    const servicesArray = this.servicesFormArray();
    if (!servicesArray || index >= servicesArray.length) return false;
    const serviceGroup = servicesArray.at(index) as FormGroup;
    const rowId = serviceGroup.get('rowId')?.value;
    return this.isFieldResolved('serviceName', 'services', rowId);
  }

  // Helper method to get before value (original value from plan response) for a field
  getBeforeValue(fieldKey: string, index?: number): any {
    const originalPlan = this.originalPlanResponse();
    if (!originalPlan?.servicePlan) return null;

    const plan = originalPlan.servicePlan;

    // Map field keys to plan response paths
    switch (fieldKey) {
      case 'planTitle':
        return plan.planTitle ?? null;
      case 'companyName':
        return plan.companyInformationSection?.companyName ?? null;
      case 'serviceName':
        if (index !== undefined && plan.services && plan.services[index]) {
          return plan.services[index].serviceName ?? null;
        }
        return null;
      default:
        return null;
    }
  }

  // Helper method to get after value (current form value) for a field
  getAfterValue(fieldKey: string, index?: number): any {
    if (fieldKey === 'planTitle') {
      return this.planTitle();
    } else if (fieldKey === 'companyName') {
      return this.companyName();
    } else if (fieldKey === 'serviceName' && index !== undefined) {
      const servicesArray = this.servicesFormArray();
      if (!servicesArray || index >= servicesArray.length) return null;
      const serviceGroup = servicesArray.at(index) as FormGroup;
      const serviceNameControl = serviceGroup.get(EMaterialsFormControls.serviceName);
      if (serviceNameControl instanceof FormGroup) {
        return serviceNameControl.get(EMaterialsFormControls.value)?.value;
      }
      return serviceNameControl?.value ?? null;
    }
    return null;
  }

  // Helper method to check if field should show diff (has before and after values and they differ)
  shouldShowDiff(fieldKey: string, index?: number): boolean {
    // Only show diff in resubmit mode
    if (this.planStore.wizardMode() !== 'resubmit') return false;
    // Only show diff if field has a comment
    if (index !== undefined) {
      // For array items, check comment with rowId
      const servicesArray = this.servicesFormArray();
      if (!servicesArray || index >= servicesArray.length) return false;
      const serviceGroup = servicesArray.at(index) as FormGroup;
      const rowId = serviceGroup.get('rowId')?.value;
      if (!this.hasFieldComment(fieldKey, 'services', rowId)) return false;
    } else {
      if (!this.hasFieldComment(fieldKey, 'companyInformation')) return false;
    }

    const beforeValue = this.getBeforeValue(fieldKey, index);
    const afterValue = this.getAfterValue(fieldKey, index);

    // Compare values
    if (beforeValue === afterValue) return false;
    if (beforeValue === null || beforeValue === undefined || beforeValue === '') {
      return afterValue !== null && afterValue !== undefined && afterValue !== '';
    }
    if (afterValue === null || afterValue === undefined || afterValue === '') {
      return true;
    }

    // For objects, compare by JSON stringify
    if (typeof beforeValue === 'object' && typeof afterValue === 'object') {
      return JSON.stringify(beforeValue) !== JSON.stringify(afterValue);
    }

    return String(beforeValue) !== String(afterValue);
  }
}
