import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { SummarySectionBaseClass } from 'src/app/shared/classes/plans/base-classes/summary-section-base.class';
import { PlanSummaryFlied } from 'src/app/shared/components/plans/plan-summary-flied/plan-summary-flied';
import { EMaterialsFormControls } from 'src/app/shared/enums';
import { IPlanSummaryField } from 'src/app/shared/interfaces/plans.interface';
import { TranslatePipe } from 'src/app/shared/pipes/translate.pipe';

@Component({
  selector: 'app-overview-local-agent-information-summary-section',
  imports: [PlanSummaryFlied, TranslatePipe],
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

  localAgentDetailsSummaryField = computed<IPlanSummaryField>(() => {
    this.doRefresh();
    const currantValue = this.localAgentDetailsControl()?.value ?? '';
    const beforeValue = this.planStore.servicePlanData()?.servicePlan?.companyInformationSection?.localAgentDetails ?? '';
    return {
      label: 'Local Agent Details',
      beforeValue: String(beforeValue),
      currantValue: String(currantValue),
      hasError: this.isFieldHasError(this.localAgentDetailsControl()),
      hasComment: this.shouldShowCommentIcon(EMaterialsFormControls.localAgentDetails, null),
      isResolved: this.isResolvedField(EMaterialsFormControls.localAgentDetails),
      showDifference: this.shouldShowDifference(currantValue, beforeValue),
    };
  });

  localAgentNameSummaryField = computed<IPlanSummaryField>(() => {
    this.doRefresh();
    const currantValue = this.localAgentNameControl()?.value ?? '';
    const beforeValue = this.planStore.servicePlanData()?.servicePlan?.localAgentDetailSection?.localAgentName ?? '';
    return {
      label: 'Local Agent Name',
      beforeValue: String(beforeValue),
      currantValue: String(currantValue),
      hasError: this.isFieldHasError(this.localAgentNameControl()),
      hasComment: this.shouldShowCommentIcon(EMaterialsFormControls.localAgentName, null),
      isResolved: this.isResolvedField(EMaterialsFormControls.localAgentName),
      showDifference: this.shouldShowDifference(currantValue, beforeValue),
    };
  });

  contactPersonNameSummaryField = computed<IPlanSummaryField>(() => {
    this.doRefresh();
    const currantValue = this.contactPersonNameControl()?.value ?? '';
    const beforeValue = this.planStore.servicePlanData()?.servicePlan?.localAgentDetailSection?.agentContactPerson ?? '';
    return {
      label: 'Contact Person Name',
      beforeValue: String(beforeValue),
      currantValue: String(currantValue),
      hasError: this.isFieldHasError(this.contactPersonNameControl()),
      hasComment: this.shouldShowCommentIcon(EMaterialsFormControls.contactPersonName, null),
      isResolved: this.isResolvedField(EMaterialsFormControls.contactPersonName),
      showDifference: this.shouldShowDifference(currantValue, beforeValue),
    };
  });

  emailIDSummaryField = computed<IPlanSummaryField>(() => {
    this.doRefresh();
    const currantValue = this.emailIDControl()?.value ?? '';
    const beforeValue = this.planStore.servicePlanData()?.servicePlan?.localAgentDetailSection?.agentEmail ?? '';
    return {
      label: 'Email ID',
      beforeValue: String(beforeValue),
      currantValue: String(currantValue),
      hasError: this.isFieldHasError(this.emailIDControl()),
      hasComment: this.shouldShowCommentIcon(EMaterialsFormControls.emailID, null),
      isResolved: this.isResolvedField(EMaterialsFormControls.emailID),
      showDifference: this.shouldShowDifference(currantValue, beforeValue),
    };
  });

  contactNumberSummaryField = computed<IPlanSummaryField>(() => {
    this.doRefresh();
    const val = this.contactNumberControl()?.value;
    const display = val?.countryCode && val?.phoneNumber ? `${val.countryCode} ${val.phoneNumber}` : (val ?? '');
    const currantValue = typeof display === 'string' ? display : String(display ?? '');
    const currantValueWithoutSpaces = currantValue.replace(' ', '');
    const beforeValue = this.planStore.servicePlanData()?.servicePlan?.localAgentDetailSection?.agentContactNumber ?? '';
    return {
      label: 'Contact Number',
      beforeValue: String(beforeValue),
      currantValue: currantValueWithoutSpaces,
      hasError: this.isFieldHasError(this.contactNumberControl()),
      hasComment: this.shouldShowCommentIcon(EMaterialsFormControls.contactNumber, null),
      isResolved: this.isResolvedField(EMaterialsFormControls.contactNumber),
      showDifference: this.shouldShowDifference(currantValueWithoutSpaces, beforeValue),
    };
  });

  companyLocationSummaryField = computed<IPlanSummaryField>(() => {
    this.doRefresh();
    const currantValue = this.companyLocationControl()?.value ?? '';
    const beforeValue = this.planStore.servicePlanData()?.servicePlan?.localAgentDetailSection?.agentCompanyLocation ?? '';
    return {
      label: 'Company HQ Location',
      beforeValue: String(beforeValue),
      currantValue: String(currantValue),
      hasError: this.isFieldHasError(this.companyLocationControl()),
      hasComment: this.shouldShowCommentIcon(EMaterialsFormControls.companyLocation, null),
      isResolved: this.isResolvedField(EMaterialsFormControls.companyLocation),
      showDifference: this.shouldShowDifference(currantValue, beforeValue),
    };
  });
}
