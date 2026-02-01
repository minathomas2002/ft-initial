import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { SummarySectionBaseClass } from 'src/app/shared/classes/plans/base-classes/summary-section-base.class';
import { PlanSummaryFlied } from 'src/app/shared/components/plans/plan-summary-flied/plan-summary-flied';
import { EMaterialsFormControls } from 'src/app/shared/enums';
import { IPlanSummaryField } from 'src/app/shared/interfaces/plans.interface';

@Component({
  selector: 'app-overview-company-information-summary-section',
  imports: [PlanSummaryFlied],
  templateUrl: './overview-company-information-summary-section.html',
  styleUrl: './overview-company-information-summary-section.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OverviewCompanyInformationSummarySection extends SummarySectionBaseClass {
  private readonly companyNameControl = computed(() => this.getValueFormControl(EMaterialsFormControls.companyName));
  private readonly ceoNameControl = computed(() => this.getValueFormControl(EMaterialsFormControls.ceoName));
  private readonly ceoEmailIDControl = computed(() => this.getValueFormControl(EMaterialsFormControls.ceoEmailID));

  companyNameSummaryField = computed<IPlanSummaryField>(() => {
    this.doRefresh();
    const currantValue = this.companyNameControl()?.value ?? '';
    const beforeValue = this.planStore.servicePlanData()?.servicePlan?.companyInformationSection?.companyName ?? '';
    return {
      label: 'Company Name',
      beforeValue: String(beforeValue),
      currantValue: String(currantValue),
      hasError: this.isFieldHasError(this.companyNameControl()),
      hasComment: this.isFieldHasComment(EMaterialsFormControls.companyName, null),
      isResolved: this.isResolvedField(EMaterialsFormControls.companyName),
      showDifference: this.shouldShowDifference(currantValue, beforeValue),
    };
  });

  ceoNameSummaryField = computed<IPlanSummaryField>(() => {
    this.doRefresh();
    const currantValue = this.ceoNameControl()?.value ?? '';
    const beforeValue = this.planStore.servicePlanData()?.servicePlan?.companyInformationSection?.ceoName ?? '';
    return {
      label: 'CEO Name',
      beforeValue: String(beforeValue),
      currantValue: String(currantValue),
      hasError: this.isFieldHasError(this.ceoNameControl()),
      hasComment: this.isFieldHasComment(EMaterialsFormControls.ceoName, null),
      isResolved: this.isResolvedField(EMaterialsFormControls.ceoName),
      showDifference: this.shouldShowDifference(currantValue, beforeValue),
    };
  });

  ceoEmailSummaryField = computed<IPlanSummaryField>(() => {
    this.doRefresh();
    const currantValue = this.ceoEmailIDControl()?.value ?? '';
    const beforeValue = this.planStore.servicePlanData()?.servicePlan?.companyInformationSection?.ceoEmail ?? '';
    return {
      label: 'CEO Email',
      beforeValue: String(beforeValue),
      currantValue: String(currantValue),
      hasError: this.isFieldHasError(this.ceoEmailIDControl()),
      hasComment: this.isFieldHasComment(EMaterialsFormControls.ceoEmailID, null),
      isResolved: this.isResolvedField(EMaterialsFormControls.ceoEmailID),
      showDifference: this.shouldShowDifference(currantValue, beforeValue),
    };
  });
}
