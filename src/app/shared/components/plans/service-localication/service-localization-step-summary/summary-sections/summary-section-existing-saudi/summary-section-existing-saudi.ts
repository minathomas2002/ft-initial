import { ChangeDetectionStrategy, Component, computed, input, output, inject } from '@angular/core';
import { FormArray, FormGroup } from '@angular/forms';
import { EMaterialsFormControls } from 'src/app/shared/enums';
import { ServicePlanFormService } from 'src/app/shared/services/plan/service-plan-form-service/service-plan-form-service';
import { PlanStore } from 'src/app/shared/stores/plan/plan.store';
import { IPageComment } from 'src/app/shared/interfaces/plans.interface';
import { SummarySectionHeader } from '../../../../summary-section-header/summary-section-header';
import { SummaryField } from '../../../../summary-field/summary-field';
import { SummaryTableCell } from '../../../../summary-table-cell/summary-table-cell';
import { TableModule } from 'primeng/table';

@Component({
  selector: 'app-summary-section-existing-saudi',
  imports: [SummarySectionHeader, SummaryTableCell, TableModule],
  templateUrl: './summary-section-existing-saudi.html',
  styleUrl: './summary-section-existing-saudi.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SummarySectionExistingSaudi {
  isViewMode = input<boolean>(false);
  formGroup = input.required<FormGroup>();
  pageComments = input<IPageComment[]>([]);
  commentTitle = input<string>('Comments');
  correctedFieldIds = input<string[]>([]);
  onEdit = output<void>();

  EMaterialsFormControls = EMaterialsFormControls;
  serviceForm = inject(ServicePlanFormService);
  planStore = inject(PlanStore);

  constructor() {
    // Ensure service names are synced even if the user never visited the step component
    this.serviceForm.syncServicesFromCoverPageToExistingSaudi();
  }

  yearColumns = computed(() => this.serviceForm.upcomingYears(5));

  yearControlKeys = [
    EMaterialsFormControls.firstYear,
    EMaterialsFormControls.secondYear,
    EMaterialsFormControls.thirdYear,
    EMaterialsFormControls.fourthYear,
    EMaterialsFormControls.fifthYear,
  ];

  // Form group accessors
  saudiCompanyDetailsFormArray = computed(() => {
    return this.formGroup().get(EMaterialsFormControls.saudiCompanyDetailsFormGroup) as FormArray;
  });

  collaborationPartnershipFormArray = computed(() => {
    return this.formGroup().get(EMaterialsFormControls.collaborationPartnershipFormGroup) as FormArray;
  });

  entityLevelFormArray = computed(() => {
    return this.formGroup().get(EMaterialsFormControls.entityLevelFormGroup) as FormArray;
  });

  serviceLevelFormArray = computed(() => {
    return this.formGroup().get(EMaterialsFormControls.serviceLevelFormGroup) as FormArray;
  });

  // Attachments live under the shared service-localization form's attachments group
  // (currently created in step 4 builder, but displayed under Existing Saudi summary).
  attachmentsFormGroup = computed(() => {
    return this.serviceForm.attachmentsFormGroup;
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

  // Saudi Company Details array
  saudiCompanyDetails = computed(() => {
    const detailsArray = this.saudiCompanyDetailsFormArray();
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
        saudiCompanyName: getValueFromControl(EMaterialsFormControls.saudiCompanyName),
        registeredVendorIDwithSEC: getValueFromControl(EMaterialsFormControls.registeredVendorIDwithSEC),
        benaRegisteredVendorID: getValueFromControl(EMaterialsFormControls.benaRegisteredVendorID),
        companyType: getValueFromControl(EMaterialsFormControls.companyType),
        qualificationStatus: getValueFromControl(EMaterialsFormControls.qualificationStatus),
        products: getValueFromControl(EMaterialsFormControls.products),
        companyOverview: getValueFromControl(EMaterialsFormControls.companyOverview),
        keyProjectsExecutedByContractorForSEC: getValueFromControl(EMaterialsFormControls.keyProjectsExecutedByContractorForSEC),
        companyOverviewKeyProjectDetails: getValueFromControl(EMaterialsFormControls.companyOverviewKeyProjectDetails),
        companyOverviewOther: getValueFromControl(EMaterialsFormControls.companyOverviewOther),
      };
    });
  });

  hasSaudiCompanyFieldError(index: number, controlName: string): boolean {
    return this.hasFieldError(`saudiCompanyDetailsFormGroup.${index}.${controlName}.value`);
  }

  // Collaboration Partnership array
  collaborationPartnership = computed(() => {
    const partnershipArray = this.collaborationPartnershipFormArray();
    if (!partnershipArray) return [];

    return Array.from({ length: partnershipArray.length }, (_, i) => {
      const group = partnershipArray.at(i) as FormGroup;
      const getValueFromControl = (controlName: string) => {
        const ctrl = group.get(controlName);
        if (ctrl instanceof FormGroup) {
          return ctrl.get(EMaterialsFormControls.value)?.value;
        }
        return ctrl?.value;
      };

      return {
        agreementType: getValueFromControl(EMaterialsFormControls.agreementType),
        agreementOtherDetails: getValueFromControl(EMaterialsFormControls.agreementOtherDetails),
        agreementSigningDate: getValueFromControl(EMaterialsFormControls.agreementSigningDate),
        supervisionOversight: getValueFromControl(EMaterialsFormControls.supervisionOversightEntity),
        whyChoseThisCompany: getValueFromControl(EMaterialsFormControls.whyChoseThisCompany),
        summaryOfKeyAgreementClauses: getValueFromControl(EMaterialsFormControls.summaryOfKeyAgreementClauses),
        provideAgreementCopy: getValueFromControl(EMaterialsFormControls.provideAgreementCopy),
      };
    });
  });

  hasCollaborationFieldError(index: number, controlName: string): boolean {
    return this.hasFieldError(`collaborationPartnershipFormGroup.${index}.${controlName}.value`);
  }

  // Entity Level data
  entityLevel = computed(() => {
    const entityArray = this.entityLevelFormArray();
    if (!entityArray || entityArray.length === 0) return null;

    const group = entityArray.at(0) as FormGroup;
    const getValueFromControl = (controlName: string) => {
      const ctrl = group.get(controlName);
      if (ctrl instanceof FormGroup) {
        return ctrl.get(EMaterialsFormControls.value)?.value;
      }
      return ctrl?.value;
    };

    return {
      headcount: this.yearControlKeys.map((key) => ({
        value: getValueFromControl(`${key}_headcount`),
        controlName: `${key}_headcount`,
      })),
    };
  });

  hasEntityFieldError(controlName: string): boolean {
    // entity array only has one item at index 0
    return this.hasFieldError(`entityLevelFormGroup.0.${controlName}.value`);
  }

  // Service Level data
  serviceLevel = computed(() => {
    const serviceArray = this.serviceLevelFormArray();
    if (!serviceArray) return [];

    return Array.from({ length: serviceArray.length }, (_, i) => {
      const group = serviceArray.at(i) as FormGroup;
      const getValueFromControl = (controlName: string) => {
        const ctrl = group.get(controlName);
        if (ctrl instanceof FormGroup) {
          return ctrl.get(EMaterialsFormControls.value)?.value;
        }
        return ctrl?.value;
      };

      return {
        index: i,
        serviceName: getValueFromControl(EMaterialsFormControls.serviceName),
        expectedLocalizationDate: getValueFromControl(EMaterialsFormControls.expectedLocalizationDate),
        headcountYears: this.yearControlKeys.map((key) => ({
          value: getValueFromControl(`${key}_headcount`),
          controlName: `${key}_headcount`,
        })),
        years: this.yearControlKeys.map(key => ({
          value: getValueFromControl(`${key}_saudization`),
          controlName: `${key}_saudization`,
        })),
        keyMeasuresToUpskillSaudis: getValueFromControl(EMaterialsFormControls.keyMeasuresToUpskillSaudis),
        mentionSupportRequiredFromSEC: getValueFromControl(EMaterialsFormControls.mentionSupportRequiredFromSEC),
      };
    });
  });

  hasServiceLevelFieldError(index: number, controlName: string): boolean {
    return this.hasFieldError(`serviceLevelFormGroup.${index}.${controlName}.value`);
  }

  /**
   * Convert a company type id or list of ids to human-readable labels joined by comma
   */
  formatCompanyType(companyType: string) {
    if (!companyType) return null;
    const options = this.planStore.companyTypeOptions();
    if (Array.isArray(companyType)) {
      const labels = companyType
        .map((id) => options.find((o) => String(o.id) === String(id))?.name ?? String(id))
        .filter(Boolean);
      return labels.join(', ');
    }
    const match = options.find((o) => String(o.id) === String(companyType));
    return match ? match.name : String(companyType);
  }

  /**
   * Convert qualification status id to label
   */
  formatQualificationStatus(statusId: string) {
    if (!statusId) return null;
    const options = this.planStore.qualificationStatusOptions();
    const match = options.find((o) => String(o.id) === String(statusId));
    return match ? match.name : String(statusId);
  }

  /**
   * Convert agreement type id to label
   */
  formatAgreementType(agreementTypeId: string) {
    if (!agreementTypeId) return null;
    const options = this.planStore.agreementTypeOptions();
    const match = options.find((o) => String(o.id) === String(agreementTypeId));
    return match ? match.name : String(agreementTypeId);
  }

  /**
   * Convert yes/no enum to label
   */
  formatYesNo(value: string | boolean | null | undefined) {
    if (value === null || value === undefined) return null;
    const options = this.planStore.yesNoOptions();
    const match = options.find((o) => String(o.id) === String(value));
    return match ? match.name : String(value);
  }

  // Attachments
  attachments = computed(() => {
    const attachmentsControl = this.attachmentsFormGroup()?.get(EMaterialsFormControls.attachments);
    let value: unknown = null;

    if (attachmentsControl instanceof FormGroup) {
      value = attachmentsControl.get(EMaterialsFormControls.value)?.value;
    } else {
      value = attachmentsControl?.value;
    }

    if (Array.isArray(value)) return value;
    return value ? [value] : [];
  });

  // Check if attachments field has validation errors
  hasAttachmentsError = computed(() => {
    const attachmentsControl = this.attachmentsFormGroup()?.get(EMaterialsFormControls.attachments);
    if (!attachmentsControl) return false;

    // Check if the control itself has errors
    if (attachmentsControl.invalid && (attachmentsControl.dirty || attachmentsControl.touched)) {
      return true;
    }

    // Check if the value control has errors
    if (attachmentsControl instanceof FormGroup) {
      const valueControl = attachmentsControl.get(EMaterialsFormControls.value);
      if (valueControl && valueControl.invalid && (valueControl.dirty || valueControl.touched)) {
        return true;
      }
    }

    return false;
  });

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

  // Helper methods for checking comments on array items
  hasSaudiCompanyComment(index: number, fieldKey: string): boolean {
    const detailsArray = this.saudiCompanyDetailsFormArray();
    if (!detailsArray || index >= detailsArray.length) return false;
    const companyGroup = detailsArray.at(index) as FormGroup;
    const rowId = companyGroup.get('rowId')?.value;
    return this.hasFieldComment(fieldKey, 'saudiCompanyDetails', rowId);
  }

  hasCollaborationComment(index: number, fieldKey: string): boolean {
    const partnershipArray = this.collaborationPartnershipFormArray();
    if (!partnershipArray || index >= partnershipArray.length) return false;
    const partnershipGroup = partnershipArray.at(index) as FormGroup;
    const rowId = partnershipGroup.get('rowId')?.value;
    return this.hasFieldComment(fieldKey, 'collaborationPartnership', rowId);
  }

  hasEntityLevelComment(fieldKey: string): boolean {
    // Entity level array only has one item at index 0
    const entityArray = this.entityLevelFormArray();
    if (!entityArray || entityArray.length === 0) return false;
    const entityGroup = entityArray.at(0) as FormGroup;
    const rowId = entityGroup.get('rowId')?.value;
    return this.hasFieldComment(fieldKey, 'entityLevel', rowId);
  }

  hasServiceLevelComment(index: number, fieldKey: string): boolean {
    const serviceArray = this.serviceLevelFormArray();
    if (!serviceArray || index >= serviceArray.length) return false;
    const serviceGroup = serviceArray.at(index) as FormGroup;
    const rowId = serviceGroup.get('rowId')?.value;
    return this.hasFieldComment(fieldKey, 'serviceLevel', rowId);
  }

  hasAttachmentsComment(): boolean {
    return this.hasFieldComment('attachments', 'attachments');
  }
}
