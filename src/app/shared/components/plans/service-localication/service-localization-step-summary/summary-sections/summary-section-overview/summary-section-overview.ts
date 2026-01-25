import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { FormArray, FormGroup } from '@angular/forms';
import { EMaterialsFormControls, EYesNo } from 'src/app/shared/enums';
import { PlanStore } from 'src/app/shared/stores/plan/plan.store';
import { IPageComment, IServiceLocalizationPlanResponse } from 'src/app/shared/interfaces/plans.interface';
import { SummarySectionHeader } from '../../../../summary-section-header/summary-section-header';
import { SummaryField } from '../../../../summary-field/summary-field';
import { SummaryTableCell } from '../../../../summary-table-cell/summary-table-cell';
import { TableModule } from 'primeng/table';
import { ServicePlanFormService } from 'src/app/shared/services/plan/service-plan-form-service/service-plan-form-service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-summary-section-overview',
  imports: [SummarySectionHeader, SummaryField, SummaryTableCell, TableModule],
  templateUrl: './summary-section-overview.html',
  styleUrl: './summary-section-overview.scss',
  providers: [DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SummarySectionOverview {
  isViewMode = input<boolean>(false);
  formGroup = input.required<FormGroup>();
  pageComments = input<IPageComment[]>([]);
  commentTitle = input<string>('Comments');
  correctedFieldIds = input<string[]>([]);
  originalPlanResponse = input<IServiceLocalizationPlanResponse | null>(null);
  onEdit = output<void>();

  planYesOrNoEnum = EYesNo;
  planStore = inject(PlanStore);
  serviceForm = inject(ServicePlanFormService);
  private datePipe = inject(DatePipe);

  constructor() {
    // Ensure service names are synced even if the user never visited the step component
    this.serviceForm.syncServicesFromCoverPageToOverview();
  }

  // Form group accessors
  basicInformationFormGroup = computed(() => {
    return this.formGroup().get(EMaterialsFormControls.basicInformationFormGroup) as FormGroup;
  });

  companyInformationFormGroup = computed(() => {
    return this.formGroup().get(EMaterialsFormControls.overviewCompanyInformationFormGroup) as FormGroup;
  });

  locationInformationFormGroup = computed(() => {
    return this.formGroup().get(EMaterialsFormControls.locationInformationFormGroup) as FormGroup;
  });

  localAgentInformationFormGroup = computed(() => {
    return this.formGroup().get(EMaterialsFormControls.localAgentInformationFormGroup) as FormGroup;
  });

  serviceDetailsFormArray = computed(() => {
    return this.formGroup().get(EMaterialsFormControls.serviceDetailsFormGroup) as FormArray;
  });

  // Helper method to get values
  getValue(controlPath: string): any {
    const parts = controlPath.split('.');
    let control: any = this.formGroup();

    for (const part of parts) {
      if (control instanceof FormGroup || control instanceof FormArray) {
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

  // Basic Information
  opportunity = computed(() => this.getValue(`basicInformationFormGroup.${EMaterialsFormControls.opportunity}`));
  // submissionDate = computed(() => this.getValue(`basicInformationFormGroup.${EMaterialsFormControls.submissionDate}`));

  submissionDate = computed(() => {
    const dateValue = this.getValue(`basicInformationFormGroup.${EMaterialsFormControls.submissionDate}`);
    if (!dateValue) return null;
    const date = new Date(dateValue);
    console.log(this.datePipe.transform(date, 'dd MMM yyyy'));

    return this.datePipe.transform(date, 'dd MMM yyyy') ?? null;
  });


  // Company Information
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

  // Location Information
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

  benaRegisteredVendorID = computed(() => {
    const locationInfo = this.locationInformationFormGroup();
    const benaVendorIDControl = locationInfo?.get(EMaterialsFormControls.benaRegisteredVendorID);
    if (benaVendorIDControl instanceof FormGroup) {
      return benaVendorIDControl.get(EMaterialsFormControls.value)?.value;
    }
    return null;
  });

  hasLocalAgent = computed(() => {
    const locationInfo = this.locationInformationFormGroup();
    return locationInfo?.get(EMaterialsFormControls.doYouCurrentlyHaveLocalAgentInKSA)?.value ?? null;
  });

  // Local Agent Information
  localAgentDetails = computed(() => {
    const localAgentInfo = this.localAgentInformationFormGroup();
    const localAgentDetailsControl = localAgentInfo?.get(EMaterialsFormControls.localAgentDetails);
    if (localAgentDetailsControl instanceof FormGroup) {
      return localAgentDetailsControl.get(EMaterialsFormControls.value)?.value;
    }
    return null;
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
    const contactPersonNameControl = localAgentInfo?.get(EMaterialsFormControls.contactPersonName);
    if (contactPersonNameControl instanceof FormGroup) {
      return contactPersonNameControl.get(EMaterialsFormControls.value)?.value;
    }
    return null;
  });

  emailID = computed(() => {
    const localAgentInfo = this.localAgentInformationFormGroup();
    const emailIDControl = localAgentInfo?.get(EMaterialsFormControls.emailID);
    if (emailIDControl instanceof FormGroup) {
      return emailIDControl.get(EMaterialsFormControls.value)?.value;
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

  companyLocation = computed(() => {
    const localAgentInfo = this.localAgentInformationFormGroup();
    const companyLocationControl = localAgentInfo?.get(EMaterialsFormControls.companyLocation);
    if (companyLocationControl instanceof FormGroup) {
      return companyLocationControl.get(EMaterialsFormControls.value)?.value;
    }
    return null;
  });

  // Service Details
  serviceDetails = computed(() => {
    const detailsArray = this.serviceDetailsFormArray();
    if (!detailsArray) return [];

    return Array.from({ length: detailsArray.length }, (_, i) => {
      const group = detailsArray.at(i) as FormGroup;
      const getValueFromControl = (controlName: string) => {
        const ctrl = group.get(controlName);
        if (ctrl instanceof FormGroup) {
          return ctrl.get(EMaterialsFormControls.value)?.value;
        }
        return ctrl?.value;
      };

      return {
        serviceName: getValueFromControl(EMaterialsFormControls.serviceName),
        serviceType: ((): string | null => {
          const raw = getValueFromControl(EMaterialsFormControls.serviceType);
          const option = this.planStore.serviceTypeOptions().find(o => o.id === String(raw));
          return option ? option.name : raw;
        })(),
        serviceCategory: ((): string | null => {
          const raw = getValueFromControl(EMaterialsFormControls.serviceCategory);
          const option = this.planStore.serviceCategoryOptions().find(o => o.id === String(raw));
          return option ? option.name : raw;
        })(),
        serviceDescription: getValueFromControl(EMaterialsFormControls.serviceDescription),
        serviceProvidedTo: ((): string | null => {
          const raw = getValueFromControl(EMaterialsFormControls.serviceProvidedTo);
          const ids = Array.isArray(raw) ? raw : raw == null ? [] : [raw];
          const labels = ids
            .map((id) => this.planStore.serviceProvidedToOptions().find((o) => o.id === String(id))?.name ?? String(id))
            .filter((x) => !!x);

          return labels.length ? labels.join(', ') : null;
        })(),
        totalBusinessDoneLast5Years: getValueFromControl(EMaterialsFormControls.totalBusinessDoneLast5Years),
        serviceTargetedForLocalization: ((): string | null => {
          const raw = getValueFromControl(EMaterialsFormControls.serviceTargetedForLocalization);
          const option = this.planStore.yesNoOptions().find(o => o.id === String(raw));
          return option ? option.name : raw;
        })(),
        expectedLocalizationDate: getValueFromControl(EMaterialsFormControls.expectedLocalizationDate),
        serviceLocalizationMethodology: ((): string | null => {
          const raw = getValueFromControl(EMaterialsFormControls.serviceLocalizationMethodology);
          const option = this.planStore.localizationMethodologyOptions().find(o => o.id === String(raw));
          return option ? option.name : raw;
        })(),
      };
    });
  });

  hasServiceDetailFieldError(index: number, controlName: string): boolean {
    return this.hasFieldError(`serviceDetailsFormGroup.${index}.${controlName}.value`);
  }

  // Check if a field has a comment
  hasFieldComment(fieldKey: string, section?: string, fieldId?: string): boolean {
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
          (fieldId === undefined || field.id === fieldId)
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
        (fieldId === undefined || field.id === fieldId)
      )
    );
  }

  // Check if a field is resolved/corrected by investor (based on correctedFieldIds)
  isFieldResolved(fieldKey: string, section?: string, fieldId?: string): boolean {
    if (this.correctedFieldIds().length === 0) return false;

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
          !!field.id &&
          this.correctedFieldIds().includes(field.id) &&
          (fieldId === undefined || field.id === fieldId)
      )
    );
  }

  // Computed properties for comment status
  opportunityHasComment = computed(() => this.hasFieldComment('opportunity', 'basicInformation'));
  submissionDateHasComment = computed(() => this.hasFieldComment('submissionDate', 'basicInformation'));
  companyNameHasComment = computed(() => this.hasFieldComment('companyName', 'overviewCompanyInformation'));
  ceoNameHasComment = computed(() => this.hasFieldComment('ceoName', 'overviewCompanyInformation'));
  ceoEmailIDHasComment = computed(() => this.hasFieldComment('ceoEmailID', 'overviewCompanyInformation'));
  globalHQLocationHasComment = computed(() => this.hasFieldComment('globalHQLocation', 'locationInformation'));
  registeredVendorIDHasComment = computed(() => this.hasFieldComment('registeredVendorIDwithSEC', 'locationInformation'));
  benaRegisteredVendorIDHasComment = computed(() => this.hasFieldComment('benaRegisteredVendorID', 'locationInformation'));
  hasLocalAgentHasComment = computed(() => this.hasFieldComment('doYouCurrentlyHaveLocalAgentInKSA', 'locationInformation'));
  localAgentDetailsHasComment = computed(() => this.hasFieldComment('localAgentDetails', 'localAgentInformation'));
  localAgentNameHasComment = computed(() => this.hasFieldComment('localAgentName', 'localAgentInformation'));
  contactPersonNameHasComment = computed(() => this.hasFieldComment('contactPersonName', 'localAgentInformation'));
  emailIDHasComment = computed(() => this.hasFieldComment('emailID', 'localAgentInformation'));
  contactNumberHasComment = computed(() => this.hasFieldComment('contactNumber', 'localAgentInformation'));
  companyLocationHasComment = computed(() => this.hasFieldComment('companyLocation', 'localAgentInformation'));

  // Computed properties for resolved/corrected status
  opportunityIsResolved = computed(() => this.isFieldResolved('opportunity', 'basicInformation'));
  submissionDateIsResolved = computed(() => this.isFieldResolved('submissionDate', 'basicInformation'));
  companyNameIsResolved = computed(() => this.isFieldResolved('companyName', 'overviewCompanyInformation'));
  ceoNameIsResolved = computed(() => this.isFieldResolved('ceoName', 'overviewCompanyInformation'));
  ceoEmailIDIsResolved = computed(() => this.isFieldResolved('ceoEmailID', 'overviewCompanyInformation'));
  globalHQLocationIsResolved = computed(() => this.isFieldResolved('globalHQLocation', 'locationInformation'));
  registeredVendorIDIsResolved = computed(() => this.isFieldResolved('registeredVendorIDwithSEC', 'locationInformation'));
  benaRegisteredVendorIDIsResolved = computed(() => this.isFieldResolved('benaRegisteredVendorID', 'locationInformation'));
  hasLocalAgentIsResolved = computed(() => this.isFieldResolved('doYouCurrentlyHaveLocalAgentInKSA', 'locationInformation'));
  localAgentDetailsIsResolved = computed(() => this.isFieldResolved('localAgentDetails', 'localAgentInformation'));
  localAgentNameIsResolved = computed(() => this.isFieldResolved('localAgentName', 'localAgentInformation'));
  contactPersonNameIsResolved = computed(() => this.isFieldResolved('contactPersonName', 'localAgentInformation'));
  emailIDIsResolved = computed(() => this.isFieldResolved('emailID', 'localAgentInformation'));
  contactNumberIsResolved = computed(() => this.isFieldResolved('contactNumber', 'localAgentInformation'));
  companyLocationIsResolved = computed(() => this.isFieldResolved('companyLocation', 'localAgentInformation'));

  // For service details array items
  hasServiceDetailComment(index: number, fieldKey: string): boolean {
    const detailsArray = this.serviceDetailsFormArray();
    if (!detailsArray || index >= detailsArray.length) return false;
    const serviceGroup = detailsArray.at(index) as FormGroup;
    const rowId = serviceGroup.get('rowId')?.value;
    return this.hasFieldComment(fieldKey, 'serviceDetails', rowId);
  }

  isServiceDetailResolved(index: number, fieldKey: string): boolean {
    const detailsArray = this.serviceDetailsFormArray();
    if (!detailsArray || index >= detailsArray.length) return false;
    const serviceGroup = detailsArray.at(index) as FormGroup;
    const rowId = serviceGroup.get('rowId')?.value;
    return this.isFieldResolved(fieldKey, 'serviceDetails', rowId);
  }

  // Helper method to get before value (original value from plan response) for a field
  getBeforeValue(fieldKey: string, index?: number): any {
    const originalPlan = this.originalPlanResponse();
    if (!originalPlan?.servicePlan) return null;

    const plan = originalPlan.servicePlan;
    const companyInfo = plan.companyInformationSection;
    const localAgent = plan.localAgentDetailSection;

    // Map field keys to plan response paths
    switch (fieldKey) {
      case 'opportunity':
        // Opportunity is not stored in the plan response, return null
        return null;
      case 'submissionDate':
        // Submission date is not stored in the plan response, return null
        return null;
      case 'companyName':
        return companyInfo?.companyName ?? null;
      case 'ceoName':
        return companyInfo?.ceoName ?? null;
      case 'ceoEmailID':
        return companyInfo?.ceoEmail ?? null;
      case 'globalHQLocation':
        return companyInfo?.globalHQLocation ?? null;
      case 'registeredVendorIDwithSEC':
        return companyInfo?.secVendorId ?? null;
      case 'benaRegisteredVendorID':
        return companyInfo?.benaVendorId ?? null;
      case 'doYouCurrentlyHaveLocalAgentInKSA':
        return companyInfo?.hasLocalAgent ?? null;
      case 'localAgentDetails':
        return companyInfo?.localAgentDetails ?? null;
      case 'localAgentName':
        return localAgent?.localAgentName ?? null;
      case 'contactPersonName':
        return localAgent?.agentContactPerson ?? null;
      case 'emailID':
        return localAgent?.agentEmail ?? null;
      case 'contactNumber':
        return localAgent?.agentContactNumber ?? null;
      case 'companyLocation':
        return localAgent?.agentCompanyLocation ?? null;
      case 'serviceName':
      case 'serviceType':
      case 'serviceCategory':
      case 'serviceDescription':
      case 'serviceProvidedTo':
      case 'totalBusinessDoneLast5Years':
      case 'serviceTargetedForLocalization':
      case 'expectedLocalizationDate':
      case 'serviceLocalizationMethodology':
        if (index !== undefined && plan.services && plan.services[index]) {
          const service = plan.services[index];
          switch (fieldKey) {
            case 'serviceName':
              return service.serviceName ?? null;
            case 'serviceType':
              return service.serviceType ?? null;
            case 'serviceCategory':
              return service.serviceCategory ?? null;
            case 'serviceDescription':
              return service.serviceDescription ?? null;
            case 'serviceProvidedTo':
              return service.serviceProvidedTo ?? null;
            case 'totalBusinessDoneLast5Years':
              return service.totalBusinessLast5Years ?? null;
            case 'serviceTargetedForLocalization':
              return service.targetedForLocalization ?? null;
            case 'expectedLocalizationDate':
              return service.expectedLocalizationDate ?? null;
            case 'serviceLocalizationMethodology':
              return service.serviceLocalizationMethodology ?? null;
          }
        }
        return null;
      default:
        return null;
    }
  }

  // Helper method to get after value (current form value) for a field
  getAfterValue(fieldKey: string, index?: number): any {
    if (fieldKey === 'opportunity') {
      return this.opportunity();
    } else if (fieldKey === 'submissionDate') {
      return this.submissionDate();
    } else if (fieldKey === 'companyName') {
      return this.companyName();
    } else if (fieldKey === 'ceoName') {
      return this.ceoName();
    } else if (fieldKey === 'ceoEmailID') {
      return this.ceoEmailID();
    } else if (fieldKey === 'globalHQLocation') {
      return this.globalHQLocation();
    } else if (fieldKey === 'registeredVendorIDwithSEC') {
      return this.registeredVendorID();
    } else if (fieldKey === 'benaRegisteredVendorID') {
      return this.benaRegisteredVendorID();
    } else if (fieldKey === 'doYouCurrentlyHaveLocalAgentInKSA') {
      return this.hasLocalAgent();
    } else if (fieldKey === 'localAgentDetails') {
      return this.localAgentDetails();
    } else if (fieldKey === 'localAgentName') {
      return this.localAgentName();
    } else if (fieldKey === 'contactPersonName') {
      return this.contactPersonName();
    } else if (fieldKey === 'emailID') {
      return this.emailID();
    } else if (fieldKey === 'contactNumber') {
      return this.contactNumber();
    } else if (fieldKey === 'companyLocation') {
      return this.companyLocation();
    } else if (index !== undefined) {
      // For service details array items
      const detailsArray = this.serviceDetailsFormArray();
      if (!detailsArray || index >= detailsArray.length) return null;
      const serviceGroup = detailsArray.at(index) as FormGroup;
      const getValueFromControl = (controlName: string) => {
        const ctrl = serviceGroup.get(controlName);
        if (ctrl instanceof FormGroup) {
          return ctrl.get(EMaterialsFormControls.value)?.value;
        }
        return ctrl?.value;
      };
      switch (fieldKey) {
        case 'serviceName':
          return getValueFromControl(EMaterialsFormControls.serviceName);
        case 'serviceType':
          return getValueFromControl(EMaterialsFormControls.serviceType);
        case 'serviceCategory':
          return getValueFromControl(EMaterialsFormControls.serviceCategory);
        case 'serviceDescription':
          return getValueFromControl(EMaterialsFormControls.serviceDescription);
        case 'serviceProvidedTo':
          return getValueFromControl(EMaterialsFormControls.serviceProvidedTo);
        case 'totalBusinessDoneLast5Years':
          return getValueFromControl(EMaterialsFormControls.totalBusinessDoneLast5Years);
        case 'serviceTargetedForLocalization':
          return getValueFromControl(EMaterialsFormControls.serviceTargetedForLocalization);
        case 'expectedLocalizationDate':
          return getValueFromControl(EMaterialsFormControls.expectedLocalizationDate);
        case 'serviceLocalizationMethodology':
          return getValueFromControl(EMaterialsFormControls.serviceLocalizationMethodology);
      }
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
      const detailsArray = this.serviceDetailsFormArray();
      if (!detailsArray || index >= detailsArray.length) return false;
      const serviceGroup = detailsArray.at(index) as FormGroup;
      const rowId = serviceGroup.get('rowId')?.value;
      if (!this.hasFieldComment(fieldKey, 'serviceDetails', rowId)) return false;
    } else {
      // Determine section based on fieldKey
      let section: string | undefined;
      if (['opportunity', 'submissionDate'].includes(fieldKey)) {
        section = 'basicInformation';
      } else if (['companyName', 'ceoName', 'ceoEmailID'].includes(fieldKey)) {
        section = 'overviewCompanyInformation';
      } else if (['globalHQLocation', 'registeredVendorIDwithSEC', 'benaRegisteredVendorID', 'doYouCurrentlyHaveLocalAgentInKSA'].includes(fieldKey)) {
        section = 'locationInformation';
      } else if (['localAgentDetails', 'localAgentName', 'contactPersonName', 'emailID', 'contactNumber', 'companyLocation'].includes(fieldKey)) {
        section = 'localAgentInformation';
      }
      if (!this.hasFieldComment(fieldKey, section)) return false;
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

    // For arrays, compare by JSON stringify
    if (Array.isArray(beforeValue) && Array.isArray(afterValue)) {
      return JSON.stringify(beforeValue.sort()) !== JSON.stringify(afterValue.sort());
    }

    // For objects, compare by JSON stringify
    if (typeof beforeValue === 'object' && typeof afterValue === 'object') {
      return JSON.stringify(beforeValue) !== JSON.stringify(afterValue);
    }

    return String(beforeValue) !== String(afterValue);
  }
}
