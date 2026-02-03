import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { SummarySectionBaseClass } from 'src/app/shared/classes/plans/base-classes/summary-section-base.class';
import { PlanSummaryFlied } from 'src/app/shared/components/plans/plan-summary-flied/plan-summary-flied';
import { EMaterialsFormControls } from 'src/app/shared/enums';
import { IPlanSummaryField } from 'src/app/shared/interfaces/plans.interface';

@Component({
  selector: 'app-overview-basic-information-summary-section',
  imports: [PlanSummaryFlied],
  templateUrl: './overview-basic-information-summary-section.html',
  styleUrl: './overview-basic-information-summary-section.scss',
  providers: [DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OverviewBasicInformationSummarySection extends SummarySectionBaseClass {
  private readonly opportunityControl = computed(() => this.getFormControl(EMaterialsFormControls.opportunity));
  private readonly submissionDateControl = computed(() => this.getFormControl(EMaterialsFormControls.submissionDate));

  opportunitySummaryField = computed<IPlanSummaryField>(() => {
    this.doRefresh();
    const val = this.opportunityControl()?.value;
    const display = val?.name ?? val ?? '';
    return {
      label: 'Opportunity',
      beforeValue: '',
      currantValue: display,
      hasError: this.opportunityControl() ? this.isFieldHasError(this.opportunityControl()) : false,
      hasComment: this.isFieldHasComment(EMaterialsFormControls.opportunity, null),
      isResolved: false,
      showDifference: false,
    };
  });

  submissionDateSummaryField = computed<IPlanSummaryField>(() => {
    this.doRefresh();
    const dateVal = this.submissionDateControl()?.value;
    const display = dateVal ? (this.getFormattedDate(String(dateVal)) || 'Invalid Date') : '';
    return {
      label: 'Submission Date',
      beforeValue: '',
      currantValue: display,
      hasError: false,
      hasComment: false,
      isResolved: false,
      showDifference: false,
    };
  });
}
