import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { SummarySectionBaseClass } from 'src/app/shared/classes/plans/base-classes/summary-section-base.class';
import { PlanSummaryFlied } from 'src/app/shared/components/plans/plan-summary-flied/plan-summary-flied';
import { EMaterialsFormControls, ERoles } from 'src/app/shared/enums';
import { EServiceCompanyType, EServiceQualificationStatus } from 'src/app/shared/enums/plan.enum';
import { IPlanSummaryField } from 'src/app/shared/interfaces/plans.interface';
import { TableModule } from 'primeng/table';
@Component({
  selector: 'app-saudi-company-details-summary-section',
  imports: [PlanSummaryFlied, TableModule],
  templateUrl: './saudi-company-details-summary-section.html',
  styleUrl: './saudi-company-details-summary-section.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SaudiCompanyDetailsSummarySection extends SummarySectionBaseClass {
  private get saudiCompanyDetailsFormArray(): FormArray {
    return this.sectionFormGroup().get(EMaterialsFormControls.saudiCompanyDetailsFormGroup) as FormArray;
  }


  private formatCompanyType(companyType: string | string[] | number | number[] | null): string | null {
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

  private formatQualificationStatus(statusId: string | number | null): string | null {
    if (!statusId) return null;
    const options = this.planStore.qualificationStatusOptions();
    const match = options.find((o) => String(o.id) === String(statusId));
    return match ? match.name : String(statusId);
  }

  saudiCompanyDetailsRows = computed(() => {
    this.doRefresh();
    const arr = this.saudiCompanyDetailsFormArray;
    if (!arr?.controls?.length) return [];

    const plan = this.planStore.servicePlanData()?.servicePlan;

    return arr.controls.map((ctrl, i) => {
      const group = ctrl as FormGroup;
      const rowId = group.get('rowId')?.value ?? null;
      const company = plan?.saudiCompanyDetails?.[i];

      const getValue = (controlName: string) => {
        const c = group.get(controlName);
        if (c instanceof FormGroup) return c.get(EMaterialsFormControls.value)?.value;
        return c?.value;
      };

      const buildField = (label: string, currant: string | null, before: string | null, fieldKey: string): IPlanSummaryField => {
        const fieldGroup = group.get(fieldKey);
        const valueCtrl = fieldGroup instanceof FormGroup ? (fieldGroup.get(EMaterialsFormControls.value) as FormControl) : null;
        const hasError = valueCtrl ? this.isFieldHasError(valueCtrl) : false;
        const hasComment = this.findMatchingField(fieldKey, 'saudiCompanyDetails', rowId) != null;
        const hasCommentChecked = (fieldGroup instanceof FormGroup && fieldGroup.get(EMaterialsFormControls.hasComment)?.value) ?? false;
        const isResolved =
          hasComment &&
          !hasCommentChecked &&
          ['view', 'Review'].includes(this.planStore.wizardMode()) &&
          this.roleService.hasAnyRoleSignal([ERoles.EMPLOYEE])();
        return {
          label,
          beforeValue: String(before ?? ''),
          currantValue: currant ?? '',
          hasError,
          hasComment,
          isResolved,
          showDifference: this.shouldShowDifference(currant, before),
        };
      };

      return {
        saudiCompanyName: buildField('', getValue(EMaterialsFormControls.saudiCompanyName) ?? null, company?.companyName ?? null, EMaterialsFormControls.saudiCompanyName),
        registeredVendorIDwithSEC: buildField('', getValue(EMaterialsFormControls.registeredVendorIDwithSEC) ?? null, getValue(EMaterialsFormControls.registeredVendorIDwithSEC) ?? null, EMaterialsFormControls.registeredVendorIDwithSEC),
        benaRegisteredVendorID: buildField('', getValue(EMaterialsFormControls.benaRegisteredVendorID) ?? null, company?.benaRegisterVendorId ?? null, EMaterialsFormControls.benaRegisteredVendorID),
        companyType: buildField('', this.formatCompanyType(getValue(EMaterialsFormControls.companyType)), this.formatCompanyType(company?.companyType ?? null), EMaterialsFormControls.companyType),
        qualificationStatus: buildField('', this.formatQualificationStatus(getValue(EMaterialsFormControls.qualificationStatus)), this.formatQualificationStatus(company?.qualificationStatus ? String(company.qualificationStatus) : null), EMaterialsFormControls.qualificationStatus),
        products: buildField('', getValue(EMaterialsFormControls.products) ?? null, company?.products ?? null, EMaterialsFormControls.products),
        companyOverview: buildField('', getValue(EMaterialsFormControls.companyOverview) ?? null, company?.companyOverview ?? null, EMaterialsFormControls.companyOverview),
        keyProjectsExecutedByContractorForSEC: buildField('', getValue(EMaterialsFormControls.keyProjectsExecutedByContractorForSEC) ?? null, company?.keyProjectsForSEC ?? null, EMaterialsFormControls.keyProjectsExecutedByContractorForSEC),
        companyOverviewKeyProjectDetails: buildField('', getValue(EMaterialsFormControls.companyOverviewKeyProjectDetails) ?? null, company?.companyOverviewKeyProjectDetails ?? null, EMaterialsFormControls.companyOverviewKeyProjectDetails),
        companyOverviewOther: buildField('', getValue(EMaterialsFormControls.companyOverviewOther) ?? null, company?.companyOverviewOther ?? null, EMaterialsFormControls.companyOverviewOther),
      };
    });
  });

  /**
   * Checks if a conditional field should be visible/selectable in the Saudi Company Details summary.
   * Returns false for fields that should be grayed out based on company type and qualification status.
   */
  isSaudiCompanyFieldSelectable(rowIndex: number, field: string): boolean {
    const rows = this.saudiCompanyDetailsRows();
    if (!rows[rowIndex]) return true;

    const arr = this.saudiCompanyDetailsFormArray;
    if (!arr?.controls?.[rowIndex]) return true;

    const group = arr.controls[rowIndex] as FormGroup;
    const getValue = (controlName: string) => {
      const c = group.get(controlName);
      if (c instanceof FormGroup) return c.get(EMaterialsFormControls.value)?.value;
      return c?.value;
    };

    const companyTypes: string[] = getValue(EMaterialsFormControls.companyType) || [];
    const qualificationStatus: string | null = getValue(EMaterialsFormControls.qualificationStatus) ?? null;

    const isManufacturer = companyTypes.includes(EServiceCompanyType.Manufacturers.toString());
    const isContractor = companyTypes.includes(EServiceCompanyType.Contractors.toString());
    const isOther = companyTypes.includes(EServiceCompanyType.Others.toString());

    switch (field) {
      case 'qualificationStatus':
        return isManufacturer;
      case 'products':
        return isManufacturer && (
          qualificationStatus === EServiceQualificationStatus.Qualified.toString() ||
          qualificationStatus === EServiceQualificationStatus.UnderPreQualification.toString()
        );
      case 'companyOverview':
        return isManufacturer && qualificationStatus === EServiceQualificationStatus.NotQualified.toString();
      case 'keyProjectsExecutedByContractorForSEC':
        return isContractor;
      case 'companyOverviewKeyProjectDetails':
        return isContractor;
      case 'companyOverviewOther':
        return isOther;
      default:
        return true;
    }
  }

  /**
   * Finds the matching field from sectionSummaryFields based on fieldKey, section, and rowId.
   * Step template passes inputKey with index suffix (e.g. saudiCompanyName_0); this matches that format.
   */
  private findMatchingField(fieldKey: string, section: string, rowId: string | null) {
    return this.sectionSummaryFields().find((f) => {
      const matchKey =
        f.inputKey === fieldKey ||
        f.inputKey === `${section}.${fieldKey}` ||
        (f.inputKey?.startsWith(fieldKey + '_') && /^\d+$/.test(f.inputKey.substring(fieldKey.length + 1)));
      if (!matchKey) return false;
      return rowId == null ? f.id == null : f.id === rowId;
    });
  }
}
