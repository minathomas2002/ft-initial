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

  companyNameSummaryField = computed<IPlanSummaryField>(() => ({
    label: 'Company Name',
    beforeValue: this.planStore.servicePlanData()?.servicePlan?.companyInformationSection?.companyName ?? '',
    currantValue: this.companyNameControl()?.value ?? '',
    hasError: this.isFieldHasError(this.companyNameControl()),
    hasComment: this.isFieldHasComment(EMaterialsFormControls.companyName, null),
    isResolved: this.isResolvedField(EMaterialsFormControls.companyName),
    showDifference: this.shouldShowDifference(this.companyNameControl()),
  }));

  ceoNameSummaryField = computed<IPlanSummaryField>(() => ({
    label: 'CEO Name',
    beforeValue: this.planStore.servicePlanData()?.servicePlan?.companyInformationSection?.ceoName ?? '',
    currantValue: this.ceoNameControl()?.value ?? '',
    hasError: this.isFieldHasError(this.ceoNameControl()),
    hasComment: this.isFieldHasComment(EMaterialsFormControls.ceoName, null),
    isResolved: this.isResolvedField(EMaterialsFormControls.ceoName),
    showDifference: this.shouldShowDifference(this.ceoNameControl()),
  }));

  ceoEmailSummaryField = computed<IPlanSummaryField>(() => ({
    label: 'CEO Email',
    beforeValue: this.planStore.servicePlanData()?.servicePlan?.companyInformationSection?.ceoEmail ?? '',
    currantValue: this.ceoEmailIDControl()?.value ?? '',
    hasError: this.isFieldHasError(this.ceoEmailIDControl()),
    hasComment: this.isFieldHasComment(EMaterialsFormControls.ceoEmailID, null),
    isResolved: this.isResolvedField(EMaterialsFormControls.ceoEmailID),
    showDifference: this.shouldShowDifference(this.ceoEmailIDControl()),
  }));
}
