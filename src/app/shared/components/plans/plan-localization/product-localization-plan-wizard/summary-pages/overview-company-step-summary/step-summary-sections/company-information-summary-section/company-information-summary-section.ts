import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { SummarySectionBaseClass } from 'src/app/shared/classes/plans/base-classes/summary-section-base.class';
import { PlanSummaryFlied } from 'src/app/shared/components/plans/plan-summary-flied/plan-summary-flied';
import { EMaterialsFormControls } from 'src/app/shared/enums';
import { IPlanSummaryField } from 'src/app/shared/interfaces/plans.interface';

@Component({
  selector: 'app-company-information-summary-section',
  imports: [PlanSummaryFlied],
  templateUrl: './company-information-summary-section.html',
  styleUrl: './company-information-summary-section.scss',
  providers: [DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CompanyInformationSummarySection extends SummarySectionBaseClass {
  private readonly companyNameControl = computed(() => this.getValueFormControl(EMaterialsFormControls.companyName));
  private readonly ceoNameControl = computed(() => this.getValueFormControl(EMaterialsFormControls.ceoName));
  private readonly ceoEmailIDControl = computed(() => this.getValueFormControl(EMaterialsFormControls.ceoEmailID));

  companyNameSummaryField = computed<IPlanSummaryField>(() => ({
    label: 'Company Name',
    beforeValue: this.planStore.productPlanData()?.productPlan.overviewCompanyInfo.companyInfo.companyName ?? '',
    currantValue: this.companyNameControl()?.value ?? '',
    hasError: this.isFieldHasError(this.companyNameControl()),
    hasComment: this.isFieldHasComment(EMaterialsFormControls.companyName),
    isResolved: this.isResolvedField(EMaterialsFormControls.companyName),
    showDifference: !!this.companyNameControl().dirty,
  }));

  ceoNameSummaryField = computed<IPlanSummaryField>(() => ({
    label: 'CEO Name',
    beforeValue: this.planStore.productPlanData()?.productPlan.overviewCompanyInfo.companyInfo.ceoName ?? '',
    currantValue: this.ceoNameControl()?.value ?? '',
    hasError: this.isFieldHasError(this.ceoNameControl()),
    hasComment: this.isFieldHasComment(EMaterialsFormControls.ceoName),
    isResolved: this.isResolvedField(EMaterialsFormControls.ceoName),
    showDifference: !!this.ceoNameControl().dirty,
  }));

  ceoEmailSummaryField = computed<IPlanSummaryField>(() => ({
    label: 'CEO Email',
    beforeValue: this.planStore.productPlanData()?.productPlan.overviewCompanyInfo.companyInfo.ceoEmail ?? '',
    currantValue: this.ceoEmailIDControl()?.value ?? '',
    hasError: this.isFieldHasError(this.ceoEmailIDControl()),
    hasComment: this.isFieldHasComment(EMaterialsFormControls.ceoEmailID),
    isResolved: this.isResolvedField(EMaterialsFormControls.ceoEmailID),
    showDifference: !!this.ceoEmailIDControl().dirty,
  }));
}
