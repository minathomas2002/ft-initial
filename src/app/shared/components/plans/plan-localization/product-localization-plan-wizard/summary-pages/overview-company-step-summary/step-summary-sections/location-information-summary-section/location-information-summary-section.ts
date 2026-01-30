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

  globalHQLocationSummaryField = computed<IPlanSummaryField>(() => ({
    label: 'Global HQ Location',
    beforeValue: this.planStore.productPlanData()?.productPlan.overviewCompanyInfo.locationInfo.globalHQLocation ?? '',
    currantValue: this.globalHQLocationControl()?.value ?? '',
    hasError: this.isFieldHasError(this.globalHQLocationControl()),
    hasComment: this.isFieldHasComment(EMaterialsFormControls.globalHQLocation),
    isResolved: this.isResolvedField(EMaterialsFormControls.globalHQLocation),
    showDifference: !!this.globalHQLocationControl().dirty,
  }));

  registeredVendorIDSummaryField = computed<IPlanSummaryField>(() => ({
    label: 'Registered Vendor ID with SEC',
    beforeValue: this.planStore.productPlanData()?.productPlan.overviewCompanyInfo.locationInfo.vendorIdWithSEC ?? '',
    currantValue: this.registeredVendorIDControl()?.value ?? '',
    hasError: this.isFieldHasError(this.registeredVendorIDControl()),
    hasComment: this.isFieldHasComment(EMaterialsFormControls.registeredVendorIDwithSEC),
    isResolved: this.isResolvedField(EMaterialsFormControls.registeredVendorIDwithSEC),
    showDifference: !!this.registeredVendorIDControl().dirty,
  }));

  doYouCurrentlyHaveLocalAgentSummaryField = computed<IPlanSummaryField>(() => {
    const value = this.doYouCurrentlyHaveLocalAgentControl()?.value;
    const displayValue = value === true ? 'Yes' : value === false ? 'No' : '';
    const beforeValue = this.planStore.productPlanData()?.productPlan.overviewCompanyInfo.locationInfo.hasLocalAgent;
    const beforeDisplay = beforeValue === true ? 'Yes' : beforeValue === false ? 'No' : '';
    return {
      label: 'Do you currently have local Agent in KSA?',
      beforeValue: beforeDisplay,
      currantValue: displayValue,
      hasError: this.isFieldHasError(this.doYouCurrentlyHaveLocalAgentControl()),
      hasComment: this.isFieldHasComment(EMaterialsFormControls.doYouCurrentlyHaveLocalAgentInKSA),
      isResolved: this.isResolvedField(EMaterialsFormControls.doYouCurrentlyHaveLocalAgentInKSA),
      showDifference: !!this.doYouCurrentlyHaveLocalAgentControl().dirty,
    };
  });
}
