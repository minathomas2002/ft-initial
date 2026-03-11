import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { SummarySectionBaseClass } from 'src/app/shared/classes/plans/base-classes/summary-section-base.class';
import { PlanSummaryFlied } from 'src/app/shared/components/plans/plan-summary-flied/plan-summary-flied';
import { EMaterialsFormControls } from 'src/app/shared/enums';
import { IPlanSummaryField } from 'src/app/shared/interfaces/plans.interface';
import { TranslatePipe } from 'src/app/shared/pipes/translate.pipe';
import { I18nService } from 'src/app/shared/services/i18n';

@Component({
  selector: 'app-overview-basic-information-summary-section',
  imports: [PlanSummaryFlied, TranslatePipe],
  templateUrl: './overview-basic-information-summary-section.html',
  styleUrl: './overview-basic-information-summary-section.scss',
  providers: [DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OverviewBasicInformationSummarySection extends SummarySectionBaseClass {
  private readonly i18n = inject(I18nService);
  private readonly opportunityControl = computed(() => this.getFormControl(EMaterialsFormControls.opportunity));
  private readonly submissionDateControl = computed(() => this.getFormControl(EMaterialsFormControls.submissionDate));

  opportunitySummaryField = computed<IPlanSummaryField>(() => {
    this.doRefresh();
    this.i18n.currentLanguage();
    const val = this.opportunityControl()?.value;
    const display = val?.name ?? val ?? '';
    return {
      label: this.i18n.translate('plans.summary.opportunity'),
      beforeValue: '',
      currantValue: display,
      hasError: this.isFieldHasError(this.opportunityControl()),
      hasComment: this.shouldShowCommentIcon(EMaterialsFormControls.opportunity, null),
      isResolved: false,
      showDifference: false,
    };
  });

  submissionDateSummaryField = computed<IPlanSummaryField>(() => {
    this.doRefresh();
    this.i18n.currentLanguage();
    const dateVal = this.submissionDateControl()?.value;
    const display = dateVal ? (this.getFormattedDate(String(dateVal)) || 'Invalid Date') : '';
    return {
      label: this.i18n.translate('plans.summary.submissionDate'),
      beforeValue: '',
      currantValue: display,
      hasError: false,
      hasComment: false,
      isResolved: false,
      showDifference: false,
    };
  });
}
