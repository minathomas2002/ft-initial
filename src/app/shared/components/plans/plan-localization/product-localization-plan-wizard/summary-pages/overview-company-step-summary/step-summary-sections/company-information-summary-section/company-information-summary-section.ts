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

  companyNameSummaryField = computed<IPlanSummaryField>(() => {
    this.doRefresh();
    const currantValue = this.companyNameControl()?.value ?? '';
    const beforeValue = this.planStore.productPlanData()?.productPlan.overviewCompanyInfo.companyInfo.companyName ?? '';
    return {
      label: 'Company Name',
      beforeValue: String(beforeValue),
      currantValue: String(currantValue),
      hasError: this.isFieldHasError(this.companyNameControl()),
      hasComment: this.shouldShowCommentIcon(EMaterialsFormControls.companyName),
      isResolved: this.isResolvedField(EMaterialsFormControls.companyName),
      showDifference: this.shouldShowDifference(currantValue, beforeValue),
    };
  });

  ceoNameSummaryField = computed<IPlanSummaryField>(() => {
    this.doRefresh();
    const currantValue = this.ceoNameControl()?.value ?? '';
    const beforeValue = this.planStore.productPlanData()?.productPlan.overviewCompanyInfo.companyInfo.ceoName ?? '';
    return {
      label: this.i18nService.translate('plans.form.ceoName'),
      beforeValue: String(beforeValue),
      currantValue: String(currantValue),
      hasError: this.isFieldHasError(this.ceoNameControl()),
      hasComment: this.shouldShowCommentIcon(EMaterialsFormControls.ceoName),
      isResolved: this.isResolvedField(EMaterialsFormControls.ceoName),
      showDifference: this.shouldShowDifference(currantValue, beforeValue),
    };
  });

  ceoEmailSummaryField = computed<IPlanSummaryField>(() => {
    this.doRefresh();
    const currantValue = this.ceoEmailIDControl()?.value ?? '';
    const beforeValue = this.planStore.productPlanData()?.productPlan.overviewCompanyInfo.companyInfo.ceoEmail ?? '';
    return {
      label: 'CEO Email',
      beforeValue: String(beforeValue),
      currantValue: String(currantValue),
      hasError: this.isFieldHasError(this.ceoEmailIDControl()),
      hasComment: this.shouldShowCommentIcon(EMaterialsFormControls.ceoEmailID),
      isResolved: this.isResolvedField(EMaterialsFormControls.ceoEmailID),
      showDifference: this.shouldShowDifference(currantValue, beforeValue),
    };
  });
}
