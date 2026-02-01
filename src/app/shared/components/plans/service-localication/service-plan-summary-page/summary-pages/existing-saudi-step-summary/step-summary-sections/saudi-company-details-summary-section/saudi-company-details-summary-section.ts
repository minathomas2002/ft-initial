import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { FormArray, FormGroup } from '@angular/forms';
import { SummarySectionBaseClass } from 'src/app/shared/classes/plans/base-classes/summary-section-base.class';
import { PlanSummaryFlied } from 'src/app/shared/components/plans/plan-summary-flied/plan-summary-flied';
import { EMaterialsFormControls } from 'src/app/shared/enums';
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
        const ctrl = group.get(fieldKey);
        const valueCtrl = ctrl instanceof FormGroup ? ctrl.get(EMaterialsFormControls.value) : ctrl;
        const hasError = !!(valueCtrl && (valueCtrl as { invalid?: boolean }).invalid && (valueCtrl as { dirty?: boolean }).dirty);
        const hasComment = this.hasArrayFieldComment(fieldKey, 'saudiCompanyDetails', rowId);
        return {
          label,
          beforeValue: String(before ?? ''),
          currantValue: currant ?? '',
          hasError,
          hasComment,
          isResolved: false,
          showDifference: this.shouldShowDifference(currant, before),
        };
      };

      return {
        saudiCompanyName: buildField('', getValue(EMaterialsFormControls.saudiCompanyName) ?? null, company?.companyName ?? null, EMaterialsFormControls.saudiCompanyName),
        registeredVendorIDwithSEC: buildField('', getValue(EMaterialsFormControls.registeredVendorIDwithSEC) ?? null, company?.vendorIdWithSEC ?? null, EMaterialsFormControls.registeredVendorIDwithSEC),
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

  private hasArrayFieldComment(fieldKey: string, section: string, rowId: string | null): boolean {
    return this.sectionSummaryFields().some((f) => {
      const matchKey = f.inputKey === fieldKey || f.inputKey === `${section}.${fieldKey}` ||
        (f.inputKey?.startsWith(fieldKey + '_') && /^\d+$/.test(f.inputKey.substring(fieldKey.length + 1)));
      if (!matchKey) return false;
      return rowId == null ? f.id == null : f.id === rowId;
    });
  }
}
