import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { SummarySectionBaseClass } from 'src/app/shared/classes/plans/base-classes/summary-section-base.class';
import { PlanSummaryFlied } from 'src/app/shared/components/plans/plan-summary-flied/plan-summary-flied';
import { EMaterialsFormControls, EOpportunityType } from 'src/app/shared/enums';
import { IPlanSummaryField } from 'src/app/shared/interfaces/plans.interface';
import { TranslatePipe } from 'src/app/shared/pipes/translate.pipe';

@Component({
  selector: 'app-basic-information-summary-section',
  imports: [PlanSummaryFlied, TranslatePipe],
  templateUrl: './basic-Information-summary-section.html',
  styleUrl: './basic-Information-summary-section.scss',
  providers: [DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BasicInformationSummarySection extends SummarySectionBaseClass {
  private readonly planTitleControl = computed(() => this.getValueFormControl(EMaterialsFormControls.planTitle));
  private readonly opportunityTypeControl = computed(() => this.getFormControl(EMaterialsFormControls.opportunityType));
  private readonly opportunityControl = computed(() => this.getFormControl(EMaterialsFormControls.opportunity));
  private readonly submissionDateControl = computed(() => this.getFormControl(EMaterialsFormControls.submissionDate));
  planTitleSummaryField = computed<IPlanSummaryField>(() => {
    this.doRefresh();
    const currantValue = this.planTitleControl()?.value ?? '';
    const beforeValue = this.planStore.productPlanData()?.productPlan.overviewCompanyInfo.basicInfo.planTitle ?? '';
    return {
      label: this.i18nService.translate('plans.newPlan.planTitle'),
      beforeValue: String(beforeValue),
      currantValue: String(currantValue),
      hasError: this.isFieldHasError(this.planTitleControl()),
      hasComment: this.shouldShowCommentIcon(EMaterialsFormControls.planTitle),
      isResolved: this.isResolvedField(EMaterialsFormControls.planTitle),
      showDifference: this.shouldShowDifference(currantValue, beforeValue),
    };
  });

  opportunityTypeSummaryField = computed<IPlanSummaryField>(() => {
    this.doRefresh();
    return {
      label: this.i18nService.translate('plans.newPlan.opportunityType'),
      beforeValue: '',
      currantValue: this.mapOpportunityTypeToLabel(this.opportunityTypeControl()?.value),
      hasError: false,
      hasComment: false,
      isResolved: false,
      showDifference: false
    };
  });

  opportunitySummaryField = computed<IPlanSummaryField>(() => {
    this.doRefresh();
    return {
      label: this.i18nService.translate('plans.newPlan.opportunity'),
      beforeValue: '',
      currantValue: this.opportunityControl()?.value?.name ?? '',
      hasError: this.isFieldHasError(this.opportunityControl()),
      hasComment: false,
      isResolved: false,
      showDifference: false
    };
  });

  submissionDateSummaryField = computed<IPlanSummaryField>(() => {
    this.doRefresh();
    return {
      label: this.i18nService.translate('plans.form.submissionDate'),
      beforeValue: '',
      currantValue: this.getFormattedDate(this.submissionDateControl()?.value) || 'Invalid Date',
      hasError: false,
      hasComment: false,
      isResolved: false,
      showDifference: false
    };
  });

  private mapOpportunityTypeToLabel(opportunityType: string): string {
    const enumValue = EOpportunityType[opportunityType as keyof typeof EOpportunityType];
    if (!enumValue) return '-';
    const opportunityTypeLabel = enumValue.toString().toLowerCase();
    return opportunityTypeLabel.charAt(0).toUpperCase() + opportunityTypeLabel.slice(1);
  }
}
