import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { SummarySectionBaseClass } from 'src/app/shared/classes/plans/base-classes/summary-section-base.class';
import { PlanSummaryFlied } from 'src/app/shared/components/plans/plan-summary-flied/plan-summary-flied';
import { EMaterialsFormControls } from 'src/app/shared/enums';
import { IPlanSummaryField } from 'src/app/shared/interfaces/plans.interface';

@Component({
  selector: 'app-local-agent-information-summary-section',
  imports: [PlanSummaryFlied],
  templateUrl: './local-agent-information-summary-section.html',
  styleUrl: './local-agent-information-summary-section.scss',
  providers: [DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LocalAgentInformationSummarySection extends SummarySectionBaseClass {
  private readonly localAgentNameControl = computed(() => this.getValueFormControl(EMaterialsFormControls.localAgentName));
  private readonly contactPersonNameControl = computed(() => this.getValueFormControl(EMaterialsFormControls.contactPersonName));
  private readonly emailIDControl = computed(() => this.getValueFormControl(EMaterialsFormControls.emailID));
  private readonly contactNumberControl = computed(() => this.getValueFormControl(EMaterialsFormControls.contactNumber));
  private readonly companyHQLocationControl = computed(() => this.getValueFormControl(EMaterialsFormControls.companyHQLocation));

  localAgentNameSummaryField = computed<IPlanSummaryField>(() => ({
    label: 'Local Agent Name',
    beforeValue: this.planStore.productPlanData()?.productPlan.overviewCompanyInfo.locationInfo.localAgentName ?? '',
    currantValue: this.localAgentNameControl()?.value ?? '',
    hasError: this.isFieldHasError(this.localAgentNameControl()),
    hasComment: this.isFieldHasComment(EMaterialsFormControls.localAgentName),
    isResolved: this.isResolvedField(EMaterialsFormControls.localAgentName),
    showDifference: this.shouldShowDifference(this.localAgentNameControl()),
  }));

  contactPersonNameSummaryField = computed<IPlanSummaryField>(() => ({
    label: 'Contact Person Name',
    beforeValue: this.planStore.productPlanData()?.productPlan.overviewCompanyInfo.locationInfo.contactPersonName ?? '',
    currantValue: this.contactPersonNameControl()?.value ?? '',
    hasError: this.isFieldHasError(this.contactPersonNameControl()),
    hasComment: this.isFieldHasComment(EMaterialsFormControls.contactPersonName),
    isResolved: this.isResolvedField(EMaterialsFormControls.contactPersonName),
    showDifference: this.shouldShowDifference(this.contactPersonNameControl()),
  }));

  emailIDSummaryField = computed<IPlanSummaryField>(() => ({
    label: 'Email ID',
    beforeValue: this.planStore.productPlanData()?.productPlan.overviewCompanyInfo.locationInfo.localAgentEmail ?? '',
    currantValue: this.emailIDControl()?.value ?? '',
    hasError: this.isFieldHasError(this.emailIDControl()),
    hasComment: this.isFieldHasComment(EMaterialsFormControls.emailID),
    isResolved: this.isResolvedField(EMaterialsFormControls.emailID),
    showDifference: this.shouldShowDifference(this.emailIDControl()),
  }));

  contactNumberSummaryField = computed<IPlanSummaryField>(() => ({
    label: 'Contact Number',
    beforeValue: this.planStore.productPlanData()?.productPlan.overviewCompanyInfo.locationInfo.localAgentContactNumber ?? '',
    currantValue: this.contactNumberControl()?.value ?? '',
    hasError: this.isFieldHasError(this.contactNumberControl()),
    hasComment: this.isFieldHasComment(EMaterialsFormControls.contactNumber),
    isResolved: this.isResolvedField(EMaterialsFormControls.contactNumber),
    showDifference: this.shouldShowDifference(this.contactNumberControl()),
  }));

  companyHQLocationSummaryField = computed<IPlanSummaryField>(() => ({
    label: 'Company HQ Location',
    beforeValue: this.planStore.productPlanData()?.productPlan.overviewCompanyInfo.locationInfo.companyHQLocation ?? '',
    currantValue: this.companyHQLocationControl()?.value ?? '',
    hasError: this.isFieldHasError(this.companyHQLocationControl()),
    hasComment: this.isFieldHasComment(EMaterialsFormControls.companyHQLocation),
    isResolved: this.isResolvedField(EMaterialsFormControls.companyHQLocation),
    showDifference: this.shouldShowDifference(this.companyHQLocationControl()),
  }));
}
