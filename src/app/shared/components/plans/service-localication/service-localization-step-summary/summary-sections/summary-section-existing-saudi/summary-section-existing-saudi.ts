import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { FormArray, FormGroup } from '@angular/forms';
import { EMaterialsFormControls } from 'src/app/shared/enums';
import { SummarySectionHeader } from '../../../../summary-section-header/summary-section-header';
import { SummaryField } from '../../../../summary-field/summary-field';
import { SummaryTableCell } from '../../../../summary-table-cell/summary-table-cell';

@Component({
  selector: 'app-summary-section-existing-saudi',
  imports: [SummarySectionHeader, SummaryTableCell],
  templateUrl: './summary-section-existing-saudi.html',
  styleUrl: './summary-section-existing-saudi.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SummarySectionExistingSaudi {
  isViewMode = input<boolean>(false);
  formGroup = input.required<FormGroup>();
  onEdit = output<void>();

  EMaterialsFormControls = EMaterialsFormControls;
  currentYear = new Date().getFullYear();

  // Year columns for Entity Level and Service Level (6 years)
  yearColumns = computed(() => {
    const years: number[] = [];
    for (let i = 0; i < 6; i++) {
      years.push(this.currentYear + i);
    }
    return years;
  });

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

  attachmentsFormGroup = computed(() => {
    return this.formGroup().get(EMaterialsFormControls.attachmentsFormGroup) as FormGroup;
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

    if (control && control.invalid && control.dirty) {
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
      headcount: this.yearControlKeys.map(key => getValueFromControl(key)),
      saudization: this.yearControlKeys.map(key => getValueFromControl(`${key}_saudization`)),
    };
  });

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

  // Attachments
  attachments = computed(() => {
    const attachmentsGroup = this.attachmentsFormGroup();
    if (!attachmentsGroup) return null;

    return attachmentsGroup.get(EMaterialsFormControls.value)?.value;
  });
}
