import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { SummarySectionBaseClass } from 'src/app/shared/classes/plans/base-classes/summary-section-base.class';
import { PlanSummaryFlied } from 'src/app/shared/components/plans/plan-summary-flied/plan-summary-flied';
import { EMaterialsFormControls } from 'src/app/shared/enums';
import { IPlanSummaryField } from 'src/app/shared/interfaces/plans.interface';
import { TranslatePipe } from 'src/app/shared/pipes/translate.pipe';
import { I18nService } from 'src/app/shared/services/i18n';

@Component({
  selector: 'app-overview-company-information-summary-section',
  imports: [PlanSummaryFlied, TranslatePipe],
  templateUrl: './overview-company-information-summary-section.html',
  styleUrl: './overview-company-information-summary-section.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OverviewCompanyInformationSummarySection extends SummarySectionBaseClass {
  private readonly i18n = inject(I18nService);
  private readonly companyNameControl = computed(() => this.getValueFormControl(EMaterialsFormControls.companyName));
  private readonly ceoNameControl = computed(() => this.getValueFormControl(EMaterialsFormControls.ceoName));
  private readonly ceoEmailIDControl = computed(() => this.getValueFormControl(EMaterialsFormControls.ceoEmailID));

  companyNameSummaryField = computed<IPlanSummaryField>(() => {
    this.doRefresh();
    this.i18n.currentLanguage();
    const currantValue = this.companyNameControl()?.value ?? '';
    const beforeValue = this.planStore.servicePlanData()?.servicePlan?.companyInformationSection?.companyName ?? '';
    return {
      label: this.i18n.translate('plans.summary.companyName'),
      beforeValue: String(beforeValue),
      currantValue: String(currantValue),
      hasError: this.isFieldHasError(this.companyNameControl()),
      hasComment: this.shouldShowCommentIcon(EMaterialsFormControls.companyName, null),
      isResolved: false,
      showDifference: false,
    };
  });

  ceoNameSummaryField = computed<IPlanSummaryField>(() => {
    this.doRefresh();
    this.i18n.currentLanguage();
    const currantValue = this.ceoNameControl()?.value ?? '';
    const beforeValue = this.planStore.servicePlanData()?.servicePlan?.companyInformationSection?.ceoName ?? '';
    return {
      label: this.i18n.translate('plans.summary.ceoName'),
      beforeValue: String(beforeValue),
      currantValue: String(currantValue),
      hasError: this.isFieldHasError(this.ceoNameControl()),
      hasComment: this.shouldShowCommentIcon(EMaterialsFormControls.ceoName, null),
      isResolved: this.isResolvedField(EMaterialsFormControls.ceoName),
      showDifference: this.shouldShowDifference(currantValue, beforeValue),
    };
  });

  ceoEmailSummaryField = computed<IPlanSummaryField>(() => {
    this.doRefresh();
    this.i18n.currentLanguage();
    const currantValue = this.ceoEmailIDControl()?.value ?? '';
    const beforeValue = this.planStore.servicePlanData()?.servicePlan?.companyInformationSection?.ceoEmail ?? '';
    return {
      label: this.i18n.translate('plans.summary.ceoEmail'),
      beforeValue: String(beforeValue),
      currantValue: String(currantValue),
      hasError: this.isFieldHasError(this.ceoEmailIDControl()),
      hasComment: this.shouldShowCommentIcon(EMaterialsFormControls.ceoEmailID, null),
      isResolved: this.isResolvedField(EMaterialsFormControls.ceoEmailID),
      showDifference: this.shouldShowDifference(currantValue, beforeValue),
    };
  });
}
