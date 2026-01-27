import { ChangeDetectionStrategy, Component, computed, input, output, inject } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { SummaryField } from 'src/app/shared/components/plans/summary-field/summary-field';
import { SummarySectionHeader } from 'src/app/shared/components/plans/summary-section-header/summary-section-header';
import { EMaterialsFormControls, EOpportunityType } from 'src/app/shared/enums';
import { TranslatePipe } from 'src/app/shared/pipes';
import { DatePipe } from '@angular/common';
import { IPageComment, IProductPlanResponse } from 'src/app/shared/interfaces/plans.interface';
import { PlanStore } from 'src/app/shared/stores/plan/plan.store';

@Component({
  selector: 'app-summary-section-overview',
  imports: [SummarySectionHeader, SummaryField, TranslatePipe],
  templateUrl: './summary-section-overview.html',
  styleUrl: './summary-section-overview.scss',
  providers: [DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SummarySectionOverview {
  isViewMode = input<boolean>(false);
  isReviewMode = input<boolean>(false);
  formGroup = input.required<FormGroup>();
  pageComments = input<IPageComment[]>([]);
  commentTitle = input<string>('Comments');
  originalPlanResponse = input<IProductPlanResponse | null>(null);
  onEdit = output<void>();
  private datePipe = inject(DatePipe);
  private readonly planStore = inject(PlanStore);


  // Form group accessors
  basicInformationFormGroup = computed(() => {
    return this.formGroup().get(EMaterialsFormControls.basicInformationFormGroup) as FormGroup;
  });

  companyInformationFormGroup = computed(() => {
    return this.formGroup().get(EMaterialsFormControls.companyInformationFormGroup) as FormGroup;
  });

  locationInformationFormGroup = computed(() => {
    return this.formGroup().get(EMaterialsFormControls.locationInformationFormGroup) as FormGroup;
  });

  localAgentInformationFormGroup = computed(() => {
    return this.formGroup().get(EMaterialsFormControls.localAgentInformationFormGroup) as FormGroup;
  });

  // Helper methods to get values from nested form groups
  getValue(controlPath: string): any {
    const parts = controlPath.split('.');
    let control: any = this.formGroup();

    for (const part of parts) {
      if (control instanceof FormGroup) {
        control = control.get(part);
      } else {
        return null;
      }
    }

    if (control && 'value' in control) {
      // Check if it's a group-input-with-checkbox pattern (has value control)
      const valueControl = control.get(EMaterialsFormControls.value);
      return valueControl ? valueControl.value : control.value;
    }

    return control?.value ?? null;
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

  // Computed values for display
  planTitle = computed(() => this.getValue(`basicInformationFormGroup.${EMaterialsFormControls.planTitle}`));
  opportunityType = computed(() => {
    const value = EOpportunityType[this.getValue(`basicInformationFormGroup.${EMaterialsFormControls.opportunityType}`)]?.toString().toLowerCase() ?? '-';
    return value === '-' ? '-' : value.charAt(0).toUpperCase() + value.slice(1);
  });
  opportunity = computed(() => this.getValue(`basicInformationFormGroup.${EMaterialsFormControls.opportunity}`));
  submissionDate = computed(() => {
    const dateValue = this.getValue(`basicInformationFormGroup.${EMaterialsFormControls.submissionDate}`);
    if (!dateValue) return null;
    const date = new Date(dateValue);
    return this.datePipe.transform(date, 'dd MMM yyyy') ?? null;
  });

  companyName = computed(() => {
    const companyInfo = this.companyInformationFormGroup();
    const companyNameControl = companyInfo?.get(EMaterialsFormControls.companyName);
    if (companyNameControl instanceof FormGroup) {
      return companyNameControl.get(EMaterialsFormControls.value)?.value;
    }
    return null;
  });

  ceoName = computed(() => {
    const companyInfo = this.companyInformationFormGroup();
    const ceoNameControl = companyInfo?.get(EMaterialsFormControls.ceoName);
    if (ceoNameControl instanceof FormGroup) {
      return ceoNameControl.get(EMaterialsFormControls.value)?.value;
    }
    return null;
  });

  ceoEmailID = computed(() => {
    const companyInfo = this.companyInformationFormGroup();
    const ceoEmailControl = companyInfo?.get(EMaterialsFormControls.ceoEmailID);
    if (ceoEmailControl instanceof FormGroup) {
      return ceoEmailControl.get(EMaterialsFormControls.value)?.value;
    }
    return null;
  });

  globalHQLocation = computed(() => {
    const locationInfo = this.locationInformationFormGroup();
    const globalHQControl = locationInfo?.get(EMaterialsFormControls.globalHQLocation);
    if (globalHQControl instanceof FormGroup) {
      return globalHQControl.get(EMaterialsFormControls.value)?.value;
    }
    return null;
  });

  registeredVendorID = computed(() => {
    const locationInfo = this.locationInformationFormGroup();
    const vendorIDControl = locationInfo?.get(EMaterialsFormControls.registeredVendorIDwithSEC);
    if (vendorIDControl instanceof FormGroup) {
      return vendorIDControl.get(EMaterialsFormControls.value)?.value;
    }
    return null;
  });

  hasLocalAgent = computed(() => {
    const locationInfo = this.locationInformationFormGroup();
    return locationInfo?.get(EMaterialsFormControls.doYouCurrentlyHaveLocalAgentInKSA)?.value ?? null;
  });

  localAgentName = computed(() => {
    const localAgentInfo = this.localAgentInformationFormGroup();
    const localAgentNameControl = localAgentInfo?.get(EMaterialsFormControls.localAgentName);
    if (localAgentNameControl instanceof FormGroup) {
      return localAgentNameControl.get(EMaterialsFormControls.value)?.value;
    }
    return null;
  });

  contactPersonName = computed(() => {
    const localAgentInfo = this.localAgentInformationFormGroup();
    const contactPersonControl = localAgentInfo?.get(EMaterialsFormControls.contactPersonName);
    if (contactPersonControl instanceof FormGroup) {
      return contactPersonControl.get(EMaterialsFormControls.value)?.value;
    }
    return null;
  });

  emailID = computed(() => {
    const localAgentInfo = this.localAgentInformationFormGroup();
    const emailControl = localAgentInfo?.get(EMaterialsFormControls.emailID);
    if (emailControl instanceof FormGroup) {
      return emailControl.get(EMaterialsFormControls.value)?.value;
    }
    return null;
  });

  contactNumber = computed(() => {
    const localAgentInfo = this.localAgentInformationFormGroup();
    const contactNumberControl = localAgentInfo?.get(EMaterialsFormControls.contactNumber);
    if (contactNumberControl instanceof FormGroup) {
      const value = contactNumberControl.get(EMaterialsFormControls.value)?.value;
      return value ? value['countryCode'] + value['phoneNumber'] : null;
    }
    return null;
  });

  companyHQLocation = computed(() => {
    const localAgentInfo = this.localAgentInformationFormGroup();
    const companyHQControl = localAgentInfo?.get(EMaterialsFormControls.companyHQLocation);
    if (companyHQControl instanceof FormGroup) {
      return companyHQControl.get(EMaterialsFormControls.value)?.value;
    }
    return null;
  });

  // Helper method to check if a field has comments (without using IDs except for table rows)
  hasFieldComment(fieldKey: string, fieldId?: string): boolean {
    // Check if field has comments - use fieldId only for table rows (value chain, etc.)
    return this.pageComments().some(comment =>
      comment.fields?.some(field =>
        field.inputKey === fieldKey &&
        (fieldId === undefined || field.id === fieldId)
      )
    );
  }

  // Helper method to get before value (original value from plan response) for a field
  getBeforeValue(fieldKey: string): any {
    const originalPlan = this.originalPlanResponse();
    if (!originalPlan?.productPlan) return null;

    const plan = originalPlan.productPlan;

    // Map field keys to plan response paths
    switch (fieldKey) {
      case 'planTitle':
        return plan.overviewCompanyInfo?.basicInfo?.planTitle ?? null;
      case 'companyName':
        return plan.overviewCompanyInfo?.companyInfo?.companyName ?? null;
      case 'ceoName':
        return plan.overviewCompanyInfo?.companyInfo?.ceoName ?? null;
      case 'ceoEmailID':
        return plan.overviewCompanyInfo?.companyInfo?.ceoEmail ?? null;
      case 'globalHQLocation':
        return plan.overviewCompanyInfo?.locationInfo?.globalHQLocation ?? null;
      case 'registeredVendorIDwithSEC':
        return plan.overviewCompanyInfo?.locationInfo?.vendorIdWithSEC ?? null;
      case 'doYouCurrentlyHaveLocalAgentInKSA':
        return plan.overviewCompanyInfo?.locationInfo?.hasLocalAgent ?? null;
      case 'localAgentName':
        return plan.overviewCompanyInfo?.locationInfo?.localAgentName ?? null;
      case 'contactPersonName':
        return plan.overviewCompanyInfo?.locationInfo?.contactPersonName ?? null;
      case 'emailID':
        return plan.overviewCompanyInfo?.locationInfo?.localAgentEmail ?? null;
      case 'contactNumber':
        return plan.overviewCompanyInfo?.locationInfo?.localAgentContactNumber ?? null;
      case 'companyHQLocation':
        return plan.overviewCompanyInfo?.locationInfo?.companyHQLocation ?? null;
      default:
        return null;
    }
  }

  // Helper method to get after value (current form value) for a field
  getAfterValue(fieldKey: string): any {
    const controlPath = this.getControlPathForField(fieldKey);
    return this.getValue(controlPath);
  }

  // Helper method to check if field should show diff (has before and after values and they differ)
  shouldShowDiff(fieldKey: string): boolean {
    // Only show diff in resubmit mode
    if (this.planStore.wizardMode() !== 'resubmit') return false;
    // Only show diff if field has a comment
    if (!this.hasFieldComment(fieldKey)) return false;

    const beforeValue = this.getBeforeValue(fieldKey);
    const afterValue = this.getAfterValue(fieldKey);

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

  // Helper method to get control path for a field key
  private getControlPathForField(fieldKey: string): string {
    const pathMap: Record<string, string> = {
      'planTitle': `basicInformationFormGroup.${EMaterialsFormControls.planTitle}`,
      'companyName': `companyInformationFormGroup.${EMaterialsFormControls.companyName}`,
      'ceoName': `companyInformationFormGroup.${EMaterialsFormControls.ceoName}`,
      'ceoEmailID': `companyInformationFormGroup.${EMaterialsFormControls.ceoEmailID}`,
      'globalHQLocation': `locationInformationFormGroup.${EMaterialsFormControls.globalHQLocation}`,
      'registeredVendorIDwithSEC': `locationInformationFormGroup.${EMaterialsFormControls.registeredVendorIDwithSEC}`,
      'doYouCurrentlyHaveLocalAgentInKSA': `locationInformationFormGroup.${EMaterialsFormControls.doYouCurrentlyHaveLocalAgentInKSA}`,
      'localAgentName': `localAgentInformationFormGroup.${EMaterialsFormControls.localAgentName}`,
      'contactPersonName': `localAgentInformationFormGroup.${EMaterialsFormControls.contactPersonName}`,
      'emailID': `localAgentInformationFormGroup.${EMaterialsFormControls.emailID}`,
      'contactNumber': `localAgentInformationFormGroup.${EMaterialsFormControls.contactNumber}`,
      'companyHQLocation': `localAgentInformationFormGroup.${EMaterialsFormControls.companyHQLocation}`,
    };
    return pathMap[fieldKey] || fieldKey;
  }

  // Computed properties for comment status
  planTitleHasComment = computed(() => this.hasFieldComment('planTitle'));
  companyNameHasComment = computed(() => this.hasFieldComment('companyName'));
  ceoNameHasComment = computed(() => this.hasFieldComment('ceoName'));
  ceoEmailIDHasComment = computed(() => this.hasFieldComment('ceoEmailID'));
  globalHQLocationHasComment = computed(() => this.hasFieldComment('globalHQLocation'));
  registeredVendorIDHasComment = computed(() => this.hasFieldComment('registeredVendorIDwithSEC'));
  hasLocalAgentHasComment = computed(() => this.hasFieldComment('doYouCurrentlyHaveLocalAgentInKSA'));
  localAgentNameHasComment = computed(() => this.hasFieldComment('localAgentName'));
  contactPersonNameHasComment = computed(() => this.hasFieldComment('contactPersonName'));
  emailIDHasComment = computed(() => this.hasFieldComment('emailID'));
  contactNumberHasComment = computed(() => this.hasFieldComment('contactNumber'));
  companyHQLocationHasComment = computed(() => this.hasFieldComment('companyHQLocation'));
}
