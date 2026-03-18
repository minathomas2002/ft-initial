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
  private readonly lrm = '\u200E';

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
      label: this.i18nService.translate('plans.form.localAgentName'),
      beforeValue: String(beforeValue),
      currantValue: String(currantValue),
      hasError: this.isFieldHasError(this.localAgentNameControl()),
      hasComment: this.shouldShowCommentIcon(EMaterialsFormControls.localAgentName),
      isResolved: this.isResolvedField(EMaterialsFormControls.localAgentName),
      showDifference: this.shouldShowDifference(currantValue, beforeValue),
    };
  });

  contactPersonNameSummaryField = computed<IPlanSummaryField>(() => {
    this.doRefresh();
    const currantValue = this.contactPersonNameControl()?.value ?? '';
    const beforeValue = this.planStore.productPlanData()?.productPlan.overviewCompanyInfo.locationInfo.contactPersonName ?? '';
    return {
      label: this.i18nService.translate('plans.form.contactPersonName'),
      beforeValue: String(beforeValue),
      currantValue: String(currantValue),
      hasError: this.isFieldHasError(this.contactPersonNameControl()),
      hasComment: this.shouldShowCommentIcon(EMaterialsFormControls.contactPersonName),
      isResolved: this.isResolvedField(EMaterialsFormControls.contactPersonName),
      showDifference: this.shouldShowDifference(currantValue, beforeValue),
    };
  });

  emailIDSummaryField = computed<IPlanSummaryField>(() => {
    this.doRefresh();
    const currantValue = this.emailIDControl()?.value ?? '';
    const beforeValue = this.planStore.productPlanData()?.productPlan.overviewCompanyInfo.locationInfo.localAgentEmail ?? '';
    return {
      label: this.i18nService.translate('plans.form.emailID'),
      beforeValue: String(beforeValue),
      currantValue: String(currantValue),
      hasError: this.isFieldHasError(this.emailIDControl()),
      hasComment: this.shouldShowCommentIcon(EMaterialsFormControls.emailID),
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
    const ltrCurrantValue = currantValueWithoutSpaces ? `${this.lrm}${currantValueWithoutSpaces}` : '';
    const ltrBeforeValue = beforeValue ? `${this.lrm}${String(beforeValue)}` : '';
    return {
      label: this.i18nService.translate('plans.form.contactNumber'),
      beforeValue: ltrBeforeValue,
      currantValue: ltrCurrantValue,
      hasError: this.isFieldHasError(this.contactNumberControl()),
      hasComment: this.shouldShowCommentIcon(EMaterialsFormControls.contactNumber),
      isResolved: this.isResolvedField(EMaterialsFormControls.contactNumber),
      showDifference: this.shouldShowDifference(currantValueWithoutSpaces, beforeValue),
    };
  });

  companyHQLocationSummaryField = computed<IPlanSummaryField>(() => {
    this.doRefresh();
    const currantValue = this.companyHQLocationControl()?.value ?? '';
    const beforeValue = this.planStore.productPlanData()?.productPlan.overviewCompanyInfo.locationInfo.companyHQLocation ?? '';
    return {
      label: this.i18nService.translate('plans.form.companyHQLocation'),
      beforeValue: String(beforeValue),
      currantValue: String(currantValue),
      hasError: this.isFieldHasError(this.companyHQLocationControl()),
      hasComment: this.shouldShowCommentIcon(EMaterialsFormControls.companyHQLocation),
      isResolved: this.isResolvedField(EMaterialsFormControls.companyHQLocation),
      showDifference: this.shouldShowDifference(currantValue, beforeValue),
    };
  });
}
