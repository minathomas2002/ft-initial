import { ChangeDetectionStrategy, Component, computed, input, output, inject } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { EMaterialsFormControls, EOpportunityStatus, EOpportunityType } from 'src/app/shared/enums';
import { IStepValidationErrors } from 'src/app/shared/services/plan/validation/product-plan-validation.service';
import { SummarySectionHeader } from '../../shared/summary-section-header/summary-section-header';
import { SummaryField } from '../../shared/summary-field/summary-field';
import { ProductPlanFormService } from 'src/app/shared/services/plan/materials-form-service/product-plan-form-service';

@Component({
  selector: 'app-summary-section-overview',
  imports: [SummarySectionHeader, SummaryField],
  templateUrl: './summary-section-overview.html',
  styleUrl: './summary-section-overview.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SummarySectionOverview {
  private readonly formService = inject(ProductPlanFormService);

  formGroup = input.required<FormGroup>();
  validationErrors = input<IStepValidationErrors | undefined>();
  hasErrors = input<boolean>(false);
  onEdit = output<void>();

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
    if (!this.validationErrors()) {
      return false;
    }
    return this.validationErrors()!.fieldErrors.has(fieldPath);
  }

  onEditClick(): void {
    this.onEdit.emit();
  }

  // Computed values for display
  planTitle = computed(() => this.getValue(`basicInformationFormGroup.${EMaterialsFormControls.planTitle}`));
  opportunityType = computed(() =>
    EOpportunityType[this.getValue(`basicInformationFormGroup.${EMaterialsFormControls.opportunityType}`)]?.toString().toLowerCase() ?? '-'
  );
  opportunity = computed(() => this.getValue(`basicInformationFormGroup.${EMaterialsFormControls.opportunity}`));
  submissionDate = computed(() => this.getValue(`basicInformationFormGroup.${EMaterialsFormControls.submissionDate}`));

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
      return contactNumberControl.get(EMaterialsFormControls.value)?.value;
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
}
