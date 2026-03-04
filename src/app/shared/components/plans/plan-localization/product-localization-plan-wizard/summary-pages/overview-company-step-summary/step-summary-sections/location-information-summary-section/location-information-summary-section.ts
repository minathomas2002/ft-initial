import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { SummarySectionBaseClass } from 'src/app/shared/classes/plans/base-classes/summary-section-base.class';
import { PlanSummaryFlied } from 'src/app/shared/components/plans/plan-summary-flied/plan-summary-flied';
import { EMaterialsFormControls } from 'src/app/shared/enums';
import { IPlanSummaryField } from 'src/app/shared/interfaces/plans.interface';

@Component({
  selector: 'app-location-information-summary-section',
  imports: [PlanSummaryFlied],
  templateUrl: './location-information-summary-section.html',
  styleUrl: './location-information-summary-section.scss',
  providers: [DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LocationInformationSummarySection extends SummarySectionBaseClass {
  private readonly globalHQLocationControl = computed(() => this.getValueFormControl(EMaterialsFormControls.globalHQLocation));
  private readonly registeredVendorIDControl = computed(() => this.getValueFormControl(EMaterialsFormControls.registeredVendorIDwithSEC));
  private readonly doYouCurrentlyHaveLocalAgentControl = computed(() => this.getFormControl(EMaterialsFormControls.doYouCurrentlyHaveLocalAgentInKSA));

  globalHQLocationSummaryField = computed<IPlanSummaryField>(() => {
    this.doRefresh();
    const currantValue = this.globalHQLocationControl()?.value ?? '';
    const beforeValue = this.planStore.productPlanData()?.productPlan.overviewCompanyInfo.locationInfo.globalHQLocation ?? '';
    return {
      label: this.i18nService.translate('plans.form.globalHQLocation'),
      beforeValue: String(beforeValue),
      currantValue: String(currantValue),
      hasError: this.isFieldHasError(this.globalHQLocationControl()),
      hasComment: this.shouldShowCommentIcon(EMaterialsFormControls.globalHQLocation),
      isResolved: this.isResolvedField(EMaterialsFormControls.globalHQLocation),
      showDifference: this.shouldShowDifference(currantValue, beforeValue),
    };
  });

  registeredVendorIDSummaryField = computed<IPlanSummaryField>(() => {
    this.doRefresh();
    const currantValue = this.registeredVendorIDControl()?.value ?? '';
    const beforeValue = this.planStore.productPlanData()?.productPlan.overviewCompanyInfo.locationInfo.vendorIdWithSEC ?? '';
    return {
      label: this.i18nService.translate('plans.form.registeredVendorIDwithSEC'),
      beforeValue: String(beforeValue),
      currantValue: String(currantValue),
      hasError: this.isFieldHasError(this.registeredVendorIDControl()),
      hasComment: this.shouldShowCommentIcon(EMaterialsFormControls.registeredVendorIDwithSEC),
      isResolved: this.isResolvedField(EMaterialsFormControls.registeredVendorIDwithSEC),
      showDifference: this.shouldShowDifference(currantValue, beforeValue),
    };
  });

  doYouCurrentlyHaveLocalAgentSummaryField = computed<IPlanSummaryField>(() => {
    this.doRefresh();
    const value = this.doYouCurrentlyHaveLocalAgentControl()?.value;
    const displayValue = value === true ? this.i18nService.translate('common.yes') : value === false ? this.i18nService.translate('common.no') : '';
    const beforeValue = this.planStore.productPlanData()?.productPlan.overviewCompanyInfo.locationInfo.hasLocalAgent;
    const beforeDisplay = beforeValue === true ? this.i18nService.translate('common.yes') : beforeValue === false ? this.i18nService.translate('common.no') : '';
    return {
      label: this.i18nService.translate('plans.form.hasLocalAgentInKSA'),
      beforeValue: beforeDisplay,
      currantValue: displayValue,
      hasError: this.isFieldHasError(this.doYouCurrentlyHaveLocalAgentControl()),
      hasComment: this.shouldShowCommentIcon(EMaterialsFormControls.doYouCurrentlyHaveLocalAgentInKSA),
      isResolved: this.isResolvedField(EMaterialsFormControls.doYouCurrentlyHaveLocalAgentInKSA),
      showDifference: this.shouldShowDifference(displayValue, beforeDisplay),
    };
  });
}
