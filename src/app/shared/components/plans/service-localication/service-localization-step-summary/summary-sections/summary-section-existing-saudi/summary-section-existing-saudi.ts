import { ChangeDetectionStrategy, Component, computed, input, output, inject } from '@angular/core';
import { FormArray, FormGroup } from '@angular/forms';
import { EMaterialsFormControls } from 'src/app/shared/enums';
import { ServicePlanFormService } from 'src/app/shared/services/plan/service-plan-form-service/service-plan-form-service';
import { PlanStore } from 'src/app/shared/stores/plan/plan.store';
import { Attachment, IPageComment, IServiceLocalizationPlanResponse } from 'src/app/shared/interfaces/plans.interface';
import { findRowGroupByRowId, shouldHideSummaryCommentIcon } from 'src/app/shared/utils/summary-comment-icon.utils';
import { SummarySectionHeader } from '../../../../summary-section-header/summary-section-header';
import { SummaryField } from '../../../../summary-field/summary-field';
import { SummaryTableCell } from '../../../../summary-table-cell/summary-table-cell';
import { TableModule } from 'primeng/table';
import { TranslatePipe } from 'src/app/shared/pipes';
import { ImageErrorDirective } from 'src/app/shared/directives/image-error.directive';
import { AttachmentService } from 'src/app/shared/services/attachment/attachment.service';

@Component({
  selector: 'app-summary-section-existing-saudi',
  imports: [SummarySectionHeader, SummaryTableCell, TableModule, TranslatePipe, ImageErrorDirective],
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
  originalPlanResponse = input<IServiceLocalizationPlanResponse | null>(null);
  onEdit = output<void>();

  EMaterialsFormControls = EMaterialsFormControls;
  serviceForm = inject(ServicePlanFormService);
  planStore = inject(PlanStore);
  private attachmentService = inject(AttachmentService);

  constructor() {
    // Ensure service names are synced even if the user never visited the step component
    this.serviceForm.syncServicesFromCoverPageToExistingSaudi();
  }

  yearColumns = computed(() => this.serviceForm.upcomingYears(6));

  yearControlKeys = [
    EMaterialsFormControls.firstYear,
    EMaterialsFormControls.secondYear,
    EMaterialsFormControls.thirdYear,
    EMaterialsFormControls.fourthYear,
    EMaterialsFormControls.fifthYear,
    EMaterialsFormControls.sixthYear,
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
        supervisionOversightEntity: getValueFromControl(EMaterialsFormControls.supervisionOversightEntity),
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
  formatCompanyType(companyType: string | string[] | number | number[] | null) {
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
  formatQualificationStatus(statusId: string | number | null) {
    if (!statusId) return null;
    const options = this.planStore.qualificationStatusOptions();
    const match = options.find((o) => String(o.id) === String(statusId));
    return match ? match.name : String(statusId);
  }

  /**
   * Convert agreement type id to label
   */
  formatAgreementType(agreementTypeId: string | number | null) {
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
    // API values can come as boolean; form values usually come as yes/no ids.
    if (value === true || value === 'true') return 'Yes';
    if (value === false || value === 'false') return 'No';
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

  // Check if attachments exist
  hasAttachments = computed(() => this.attachments().length > 0);

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

  // Get file icon based on file type
  getFileIcon(file: { name?: string; type?: string }): string | null {
    if (!file) return null;

    if (
      file.name?.toLowerCase().endsWith('.zip') ||
      file.type === 'application/zip' ||
      file.type === 'application/x-zip-compressed'
    ) {
      return 'assets/images/zip.png';
    }

    if (
      file.name?.toLowerCase().endsWith('.pdf') ||
      file.type === 'application/pdf'
    ) {
      return 'assets/images/pdf.png';
    }

    return null;
  }

  // Check if a field has a comment
  hasFieldComment(fieldKey: string, section?: string, rowId?: string): boolean {
    // In resubmit mode: once the investor changed the field (dirty), hide the orange warning icon in summary
    // even if they revert back to the original value.
    if (
      shouldHideSummaryCommentIcon(
        this.planStore.wizardMode(),
        this.getControlForDirtyCheck(fieldKey, section, rowId),
        EMaterialsFormControls.value
      )
    ) {
      return false;
    }

    // If the field is already resolved/corrected, hide the orange warning icon.
    // if (this.isFieldResolved(fieldKey, section, rowId)) {
    //   return false;
    // }

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

    // Check if field has comments
    return this.pageComments().some(comment =>
      comment.fields?.some(field =>
        matchesInputKey(field.inputKey) &&
        (!section || field.section === section) &&
        (rowId === undefined || field.id === rowId)
      )
    );
  }

  private getControlForDirtyCheck(fieldKey: string, section?: string, rowId?: string) {
    if (section === 'attachments') {
      return this.attachmentsFormGroup()?.get(EMaterialsFormControls.attachments) ?? null;
    }

    if (section === 'saudiCompanyDetails') {
      const rowGroup = findRowGroupByRowId(this.saudiCompanyDetailsFormArray(), rowId);
      return rowGroup?.get(fieldKey) ?? null;
    }

    if (section === 'collaborationPartnership') {
      const rowGroup = findRowGroupByRowId(this.collaborationPartnershipFormArray(), rowId);
      return rowGroup?.get(fieldKey) ?? null;
    }

    if (section === 'serviceLevel') {
      const rowGroup = findRowGroupByRowId(this.serviceLevelFormArray(), rowId);
      return rowGroup?.get(fieldKey) ?? null;
    }

    if (section === 'entityLevel') {
      const entityArray = this.entityLevelFormArray();
      const group = entityArray?.length ? (entityArray.at(0) as FormGroup) : null;
      return group?.get(fieldKey) ?? null;
    }

    return null;
  }

  // Check if a field is resolved/corrected by investor (based on correctedFieldIds)
  isFieldResolved(fieldKey: string, section?: string, rowId?: string): boolean {
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

  isSaudiCompanyResolved(index: number, fieldKey: string): boolean {
    return this.shouldShowDiff(fieldKey, 'saudiCompanyDetails', index);
  }

  hasCollaborationComment(index: number, fieldKey: string): boolean {
    const partnershipArray = this.collaborationPartnershipFormArray();
    if (!partnershipArray || index >= partnershipArray.length) return false;
    const partnershipGroup = partnershipArray.at(index) as FormGroup;
    const rowId = partnershipGroup.get('rowId')?.value;
    return this.hasFieldComment(fieldKey, 'collaborationPartnership', rowId);
  }

  isCollaborationResolved(index: number, fieldKey: string): boolean {
    return this.shouldShowDiff(fieldKey, 'collaborationPartnership', index);
  }

  hasEntityLevelComment(fieldKey: string): boolean {
    // Entity level array only has one item at index 0
    const entityArray = this.entityLevelFormArray();
    if (!entityArray || entityArray.length === 0) return false;
    const entityGroup = entityArray.at(0) as FormGroup;
    const rowId = entityGroup.get('rowId')?.value;
    return this.hasFieldComment(fieldKey, 'entityLevel', rowId);
  }

  isEntityLevelResolved(fieldKey: string): boolean {
    return this.shouldShowDiff(fieldKey, 'entityLevel');
  }

  hasServiceLevelComment(index: number, fieldKey: string): boolean {
    const serviceArray = this.serviceLevelFormArray();
    if (!serviceArray || index >= serviceArray.length) return false;
    const serviceGroup = serviceArray.at(index) as FormGroup;
    const rowId = serviceGroup.get('rowId')?.value;
    return this.hasFieldComment(fieldKey, 'serviceLevel', rowId);
  }

  isServiceLevelResolved(index: number, fieldKey: string): boolean {
    return this.shouldShowDiff(fieldKey, 'serviceLevel', index);
  }

  hasAttachmentsComment(): boolean {
    return this.hasFieldComment('attachments', 'attachments');
  }

  isAttachmentsResolved(): boolean {
    return this.isFieldResolved('attachments', 'attachments');
  }

  // Helper method to get before value (original value from plan response) for a field
  getBeforeValue(fieldKey: string, section: 'saudiCompanyDetails' | 'collaborationPartnership' | 'entityLevel' | 'serviceLevel', index?: number): any {
    const originalPlan = {
      ...this.originalPlanResponse(),
    };

    if (!originalPlan?.servicePlan) return null;

    const plan = originalPlan.servicePlan;

    switch (section) {
      case 'saudiCompanyDetails':
        if (index !== undefined && plan.saudiCompanyDetails && plan.saudiCompanyDetails[index]) {
          const company = plan.saudiCompanyDetails[index];
          switch (fieldKey) {
            case 'saudiCompanyName':
              return company.companyName ?? null;
            case 'registeredVendorIDwithSEC':
              return company.vendorIdWithSEC ?? null;
            case 'benaRegisteredVendorID':
              return company.benaRegisterVendorId ?? null;
            case 'companyType':
              return this.formatCompanyType(company.companyType ?? null);
            case 'qualificationStatus':
              return this.formatQualificationStatus(company.qualificationStatus ? String(company.qualificationStatus) : null);
            case 'products':
              return company.products ?? null;
            case 'companyOverview':
              return company.companyOverview ?? null;
            case 'keyProjectsExecutedByContractorForSEC':
              return company.keyProjectsForSEC ?? null;
            case 'companyOverviewKeyProjectDetails':
              return company.companyOverviewKeyProjectDetails ?? null;
            case 'companyOverviewOther':
              return company.companyOverviewOther ?? null;
          }
        }
        return null;

      case 'collaborationPartnership':
        if (index !== undefined && plan.partnershipModels && plan.partnershipModels[index]) {
          const partnership = plan.partnershipModels[index];
          switch (fieldKey) {
            case 'agreementType':
              return this.formatAgreementType(partnership.agreementType ? String(partnership.agreementType) : null);
            case 'agreementOtherDetails':
              return partnership.otherAgreementType ?? null;
            case 'agreementSigningDate':
              return partnership.agreementSigningDate ?? null;
            case 'supervisionOversightEntity':
              return partnership.supervisionEntity ?? null;
            case 'whyChoseThisCompany':
              return partnership.selectionJustification ?? null;
            case 'summaryOfKeyAgreementClauses':
              return partnership.keyAgreementClauses ?? null;
            case 'provideAgreementCopy':
              return this.formatYesNo(partnership.agreementCopyProvided ?? null);
          }
        }
        return null;

      case 'entityLevel':
        if (plan.entityHeadcounts && plan.entityHeadcounts.length > 0) {
          // Filter for Existing Saudi (pageNumber: 3)
          const entity = plan.entityHeadcounts.find((e) => e.pageNumber === 3);
          if (!entity) return null;
          const yearMap: Record<string, string> = {
            'firstYear_headcount': 'y1Headcount',
            'secondYear_headcount': 'y2Headcount',
            'thirdYear_headcount': 'y3Headcount',
            'fourthYear_headcount': 'y4Headcount',
            'fifthYear_headcount': 'y5Headcount',
            'sixthYear_headcount': 'y6Headcount',
          };
          const yearKey = yearMap[fieldKey];
          if (yearKey && entity[yearKey as keyof typeof entity] !== undefined) {
            return entity[yearKey as keyof typeof entity] ?? null;
          }
        }
        return null;

      case 'serviceLevel':
        if (index !== undefined && plan.serviceHeadcounts && plan.serviceHeadcounts.length > 0) {
          // Filter for Existing Saudi (pageNumber: 3)
          const servicesForExistingSaudi = plan.serviceHeadcounts.filter((s) => s.pageNumber === 3);
          if (index >= servicesForExistingSaudi.length) return null;
          const service = servicesForExistingSaudi[index];
          const yearMap: Record<string, string> = {
            'firstYear_headcount': 'y1Headcount',
            'secondYear_headcount': 'y2Headcount',
            'thirdYear_headcount': 'y3Headcount',
            'fourthYear_headcount': 'y4Headcount',
            'fifthYear_headcount': 'y5Headcount',
            'sixthYear_headcount': 'y6Headcount',
            'firstYear_saudization': 'y1Saudization',
            'secondYear_saudization': 'y2Saudization',
            'thirdYear_saudization': 'y3Saudization',
            'fourthYear_saudization': 'y4Saudization',
            'fifthYear_saudization': 'y5Saudization',
            'sixthYear_saudization': 'y6Saudization',
          };
          if (fieldKey === 'serviceName') {
            // Find service name from services array by matching planServiceTypeId
            if (plan.services && service.planServiceTypeId) {
              const matchingService = plan.services.find((s) => s.id === service.planServiceTypeId);
              return matchingService?.serviceName ?? null;
            }
          } else if (fieldKey === 'expectedLocalizationDate') {
            if (plan.services && service.planServiceTypeId) {
              const matchingService = servicesForExistingSaudi.find((s) => s.planServiceTypeId === service.planServiceTypeId);
              return matchingService?.localizationDate ?? null;
            }
          } else if (fieldKey === 'keyMeasuresToUpskillSaudis') {
            return service.measuresUpSkillSaudis ?? null;
          } else if (fieldKey === 'mentionSupportRequiredFromSEC') {
            return service.mentionSupportRequiredSEC ?? null;
          } else {
            const yearKey = yearMap[fieldKey];
            if (yearKey && service[yearKey as keyof typeof service] !== undefined) {
              return service[yearKey as keyof typeof service] ?? null;
            }
          }
        }
        return null;

      default:
        return null;
    }
  }

  // Helper method to get after value (current form value) for a field
  getAfterValue(fieldKey: string, section: 'saudiCompanyDetails' | 'collaborationPartnership' | 'entityLevel' | 'serviceLevel', index?: number): any {
    switch (section) {
      case 'saudiCompanyDetails':
        if (index !== undefined) {
          const details = this.saudiCompanyDetails();
          if (details[index]) {
            const rawValue = details[index][fieldKey as keyof typeof details[0]] ?? null;
            // Format enum values to match template display
            if (fieldKey === 'companyType') {
              return this.formatCompanyType(rawValue);
            } else if (fieldKey === 'qualificationStatus') {
              return this.formatQualificationStatus(rawValue);
            }
            return rawValue;
          }
        }
        return null;

      case 'collaborationPartnership':
        if (index !== undefined) {
          const partnerships = this.collaborationPartnership();
          if (partnerships[index]) {
            const rawValue = partnerships[index][fieldKey as keyof typeof partnerships[0]] ?? null;
            // Format enum values to match template display
            if (fieldKey === 'agreementType') {
              return this.formatAgreementType(rawValue);
            } else if (fieldKey === 'provideAgreementCopy') {
              return this.formatYesNo(rawValue);
            }
            return rawValue;
          }
        }
        return null;

      case 'entityLevel':
        const entity = this.entityLevel();
        if (entity) {
          const headcount = entity.headcount.find(h => h.controlName === fieldKey);
          return headcount?.value ?? null;
        }
        return null;

      case 'serviceLevel':
        if (index !== undefined) {
          const services = this.serviceLevel();
          if (services[index]) {
            if (fieldKey === 'serviceName' || fieldKey === 'expectedLocalizationDate' ||
              fieldKey === 'keyMeasuresToUpskillSaudis' || fieldKey === 'mentionSupportRequiredFromSEC') {
              return services[index][fieldKey as keyof typeof services[0]] ?? null;
            } else {
              const headcount = services[index].headcountYears.find(h => h.controlName === fieldKey);
              if (headcount) return headcount.value ?? null;
              const year = services[index].years.find(y => y.controlName === fieldKey);
              return year?.value ?? null;
            }
          }
        }
        return null;

      default:
        return null;
    }
  }

  // Helper method to check if field should show diff (has before and after values and they differ)
  shouldShowDiff(fieldKey: string, section: 'saudiCompanyDetails' | 'collaborationPartnership' | 'entityLevel' | 'serviceLevel', index?: number): boolean {
    // Only show diff in resubmit mode
    if (this.planStore.wizardMode() !== 'resubmit') return false;
    // For array items, validate index
    if (index !== undefined) {
      if (section === 'saudiCompanyDetails') {
        const detailsArray = this.saudiCompanyDetailsFormArray();
        if (!detailsArray || index >= detailsArray.length) return false;
      } else if (section === 'collaborationPartnership') {
        const partnershipArray = this.collaborationPartnershipFormArray();
        if (!partnershipArray || index >= partnershipArray.length) return false;
      } else if (section === 'serviceLevel') {
        const serviceArray = this.serviceLevelFormArray();
        if (!serviceArray || index >= serviceArray.length) return false;
      }
    } else if (section === 'entityLevel') {
      const entityArray = this.entityLevelFormArray();
      if (!entityArray || entityArray.length === 0) return false;
    }

    const beforeValue = this.getBeforeValue(fieldKey, section, index);
    const afterValue = this.getAfterValue(fieldKey, section, index);

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
    if (typeof beforeValue === 'object' && typeof afterValue === 'object' && beforeValue !== null && afterValue !== null) {
      return JSON.stringify(beforeValue) !== JSON.stringify(afterValue);
    }

    return String(beforeValue) !== String(afterValue);
  }

  downloadFile(file: Attachment): void {
    const fileId = file.ibmIdentifier;

    if (!fileId) {
      console.error('Unable to download file: missing attachment id.', file);
      return;
    }

    this.attachmentService.downloadAndSaveAttachment(fileId, file.fileName).subscribe({
      next: () => {
        // Download handled in service
      },
      error: (err) => {
        console.error('An error occurred while downloading the file.', err);
      },
    });
  }
}
