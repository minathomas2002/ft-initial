import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { SummarySectionBaseClass } from 'src/app/shared/classes/plans/base-classes/summary-section-base.class';
import { PlanSummaryFlied } from 'src/app/shared/components/plans/plan-summary-flied/plan-summary-flied';
import { EMaterialsFormControls } from 'src/app/shared/enums';
import { IPlanSummaryField } from 'src/app/shared/interfaces/plans.interface';

@Component({
  selector: 'app-cover-page-company-information-summary-section',
  imports: [PlanSummaryFlied],
  templateUrl: './cover-page-company-information-summary-section.html',
  styleUrl: './cover-page-company-information-summary-section.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CoverPageCompanyInformationSummarySection extends SummarySectionBaseClass {
  private readonly planTitleControl = computed(() => this.getValueFormControl(EMaterialsFormControls.planTitle));
  private readonly companyNameControl = computed(() => this.getValueFormControl(EMaterialsFormControls.companyName));

  planTitleSummaryField = computed<IPlanSummaryField>(() => ({
    label: 'Plan Title',
    beforeValue: this.planStore.servicePlanData()?.servicePlan?.planTitle ?? '',
    currantValue: this.planTitleControl()?.value ?? '',
    hasError: this.isFieldHasError(this.planTitleControl()),
    hasComment: this.isFieldHasComment(EMaterialsFormControls.planTitle, null),
    isResolved: this.isResolvedField(EMaterialsFormControls.planTitle),
    showDifference: this.shouldShowDifference(this.planTitleControl()),
  }));

  companyNameSummaryField = computed<IPlanSummaryField>(() => ({
    label: 'Company Name',
    beforeValue: this.planStore.servicePlanData()?.servicePlan?.companyInformationSection?.companyName ?? '',
    currantValue: this.companyNameControl()?.value ?? '',
    hasError: this.isFieldHasError(this.companyNameControl()),
    hasComment: this.isFieldHasComment(EMaterialsFormControls.companyName, null),
    isResolved: this.isResolvedField(EMaterialsFormControls.companyName),
    showDifference: this.shouldShowDifference(this.companyNameControl()),
  }));
}
