import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { SummarySectionBaseClass } from 'src/app/shared/classes/plans/base-classes/summary-section-base.class';
import { PlanSummaryFlied } from 'src/app/shared/components/plans/plan-summary-flied/plan-summary-flied';
import { EMaterialsFormControls } from 'src/app/shared/enums';
import { IPlanSummaryField } from 'src/app/shared/interfaces/plans.interface';

@Component({
  selector: 'app-overview-local-agent-information-summary-section',
  imports: [PlanSummaryFlied],
  templateUrl: './overview-local-agent-information-summary-section.html',
  styleUrl: './overview-local-agent-information-summary-section.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OverviewLocalAgentInformationSummarySection extends SummarySectionBaseClass {
  private readonly localAgentDetailsControl = computed(() => this.getValueFormControl(EMaterialsFormControls.localAgentDetails));
  private readonly localAgentNameControl = computed(() => this.getValueFormControl(EMaterialsFormControls.localAgentName));
  private readonly contactPersonNameControl = computed(() => this.getValueFormControl(EMaterialsFormControls.contactPersonName));
  private readonly emailIDControl = computed(() => this.getValueFormControl(EMaterialsFormControls.emailID));
  private readonly contactNumberControl = computed(() => this.getValueFormControl(EMaterialsFormControls.contactNumber));
  private readonly companyLocationControl = computed(() => this.getValueFormControl(EMaterialsFormControls.companyLocation));

  localAgentDetailsSummaryField = computed<IPlanSummaryField>(() => ({
    label: 'Local Agent Details',
    beforeValue: this.planStore.servicePlanData()?.servicePlan?.companyInformationSection?.localAgentDetails ?? '',
    currantValue: this.localAgentDetailsControl()?.value ?? '',
    hasError: this.isFieldHasError(this.localAgentDetailsControl()),
    hasComment: this.isFieldHasComment(EMaterialsFormControls.localAgentDetails, null),
    isResolved: this.isResolvedField(EMaterialsFormControls.localAgentDetails),
    showDifference: this.shouldShowDifference(this.localAgentDetailsControl()),
  }));

  localAgentNameSummaryField = computed<IPlanSummaryField>(() => ({
    label: 'Local Agent Name',
    beforeValue: this.planStore.servicePlanData()?.servicePlan?.localAgentDetailSection?.localAgentName ?? '',
    currantValue: this.localAgentNameControl()?.value ?? '',
    hasError: this.isFieldHasError(this.localAgentNameControl()),
    hasComment: this.isFieldHasComment(EMaterialsFormControls.localAgentName, null),
    isResolved: this.isResolvedField(EMaterialsFormControls.localAgentName),
    showDifference: this.shouldShowDifference(this.localAgentNameControl()),
  }));

  contactPersonNameSummaryField = computed<IPlanSummaryField>(() => ({
    label: 'Contact Person Name',
    beforeValue: this.planStore.servicePlanData()?.servicePlan?.localAgentDetailSection?.agentContactPerson ?? '',
    currantValue: this.contactPersonNameControl()?.value ?? '',
    hasError: this.isFieldHasError(this.contactPersonNameControl()),
    hasComment: this.isFieldHasComment(EMaterialsFormControls.contactPersonName, null),
    isResolved: this.isResolvedField(EMaterialsFormControls.contactPersonName),
    showDifference: this.shouldShowDifference(this.contactPersonNameControl()),
  }));

  emailIDSummaryField = computed<IPlanSummaryField>(() => ({
    label: 'Email ID',
    beforeValue: this.planStore.servicePlanData()?.servicePlan?.localAgentDetailSection?.agentEmail ?? '',
    currantValue: this.emailIDControl()?.value ?? '',
    hasError: this.isFieldHasError(this.emailIDControl()),
    hasComment: this.isFieldHasComment(EMaterialsFormControls.emailID, null),
    isResolved: this.isResolvedField(EMaterialsFormControls.emailID),
    showDifference: this.shouldShowDifference(this.emailIDControl()),
  }));

  contactNumberSummaryField = computed<IPlanSummaryField>(() => {
    const val = this.contactNumberControl()?.value;
    const display = val?.countryCode && val?.phoneNumber ? `${val.countryCode} ${val.phoneNumber}` : (val ?? '');
    return {
      label: 'Contact Number',
      beforeValue: this.planStore.servicePlanData()?.servicePlan?.localAgentDetailSection?.agentContactNumber ?? '',
      currantValue: typeof display === 'string' ? display : String(display ?? ''),
      hasError: this.isFieldHasError(this.contactNumberControl()),
      hasComment: this.isFieldHasComment(EMaterialsFormControls.contactNumber, null),
      isResolved: this.isResolvedField(EMaterialsFormControls.contactNumber),
      showDifference: this.shouldShowDifference(this.contactNumberControl()),
    };
  });

  companyLocationSummaryField = computed<IPlanSummaryField>(() => ({
    label: 'Company HQ Location',
    beforeValue: this.planStore.servicePlanData()?.servicePlan?.localAgentDetailSection?.agentCompanyLocation ?? '',
    currantValue: this.companyLocationControl()?.value ?? '',
    hasError: this.isFieldHasError(this.companyLocationControl()),
    hasComment: this.isFieldHasComment(EMaterialsFormControls.companyLocation, null),
    isResolved: this.isResolvedField(EMaterialsFormControls.companyLocation),
    showDifference: this.shouldShowDifference(this.companyLocationControl()),
  }));
}
