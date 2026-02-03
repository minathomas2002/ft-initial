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

  localAgentNameSummaryField = computed<IPlanSummaryField>(() => {
    this.doRefresh();
    const currantValue = this.localAgentNameControl()?.value ?? '';
    const beforeValue = this.planStore.productPlanData()?.productPlan.overviewCompanyInfo.locationInfo.localAgentName ?? '';
    return {
      label: 'Local Agent Name',
      beforeValue: String(beforeValue),
      currantValue: String(currantValue),
      hasError: this.isFieldHasError(this.localAgentNameControl()),
      hasComment: this.isFieldHasComment(EMaterialsFormControls.localAgentName),
      isResolved: this.isResolvedField(EMaterialsFormControls.localAgentName),
      showDifference: this.shouldShowDifference(currantValue, beforeValue),
    };
  });

  contactPersonNameSummaryField = computed<IPlanSummaryField>(() => {
    this.doRefresh();
    const currantValue = this.contactPersonNameControl()?.value ?? '';
    const beforeValue = this.planStore.productPlanData()?.productPlan.overviewCompanyInfo.locationInfo.contactPersonName ?? '';
    return {
      label: 'Contact Person Name',
      beforeValue: String(beforeValue),
      currantValue: String(currantValue),
      hasError: this.isFieldHasError(this.contactPersonNameControl()),
      hasComment: this.isFieldHasComment(EMaterialsFormControls.contactPersonName),
      isResolved: this.isResolvedField(EMaterialsFormControls.contactPersonName),
      showDifference: this.shouldShowDifference(currantValue, beforeValue),
    };
  });

  emailIDSummaryField = computed<IPlanSummaryField>(() => {
    this.doRefresh();
    const currantValue = this.emailIDControl()?.value ?? '';
    const beforeValue = this.planStore.productPlanData()?.productPlan.overviewCompanyInfo.locationInfo.localAgentEmail ?? '';
    return {
      label: 'Email ID',
      beforeValue: String(beforeValue),
      currantValue: String(currantValue),
      hasError: this.isFieldHasError(this.emailIDControl()),
      hasComment: this.isFieldHasComment(EMaterialsFormControls.emailID),
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
    const beforeValue = this.planStore.productPlanData()?.productPlan.overviewCompanyInfo.locationInfo.localAgentContactNumber ?? '';
    return {
      label: 'Contact Number',
      beforeValue: String(beforeValue),
      currantValue: currantValueWithoutSpaces,
      hasError: this.isFieldHasError(this.contactNumberControl()),
      hasComment: this.isFieldHasComment(EMaterialsFormControls.contactNumber),
      isResolved: this.isResolvedField(EMaterialsFormControls.contactNumber),
      showDifference: this.shouldShowDifference(currantValueWithoutSpaces, beforeValue),
    };
  });

  companyHQLocationSummaryField = computed<IPlanSummaryField>(() => {
    this.doRefresh();
    const currantValue = this.companyHQLocationControl()?.value ?? '';
    const beforeValue = this.planStore.productPlanData()?.productPlan.overviewCompanyInfo.locationInfo.companyHQLocation ?? '';
    return {
      label: 'Company HQ Location',
      beforeValue: String(beforeValue),
      currantValue: String(currantValue),
      hasError: this.isFieldHasError(this.companyHQLocationControl()),
      hasComment: this.isFieldHasComment(EMaterialsFormControls.companyHQLocation),
      isResolved: this.isResolvedField(EMaterialsFormControls.companyHQLocation),
      showDifference: this.shouldShowDifference(currantValue, beforeValue),
    };
  });
}
