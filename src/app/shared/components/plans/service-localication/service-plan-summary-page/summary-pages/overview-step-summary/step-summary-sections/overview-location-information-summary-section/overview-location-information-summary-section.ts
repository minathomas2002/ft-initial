import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { SummarySectionBaseClass } from 'src/app/shared/classes/plans/base-classes/summary-section-base.class';
import { PlanSummaryFlied } from 'src/app/shared/components/plans/plan-summary-flied/plan-summary-flied';
import { EMaterialsFormControls } from 'src/app/shared/enums';
import { IPlanSummaryField } from 'src/app/shared/interfaces/plans.interface';

@Component({
  selector: 'app-overview-location-information-summary-section',
  imports: [PlanSummaryFlied],
  templateUrl: './overview-location-information-summary-section.html',
  styleUrl: './overview-location-information-summary-section.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OverviewLocationInformationSummarySection extends SummarySectionBaseClass {
  private readonly globalHQLocationControl = computed(() => this.getValueFormControl(EMaterialsFormControls.globalHQLocation));
  private readonly registeredVendorIDControl = computed(() => this.getValueFormControl(EMaterialsFormControls.registeredVendorIDwithSEC));
  private readonly benaRegisteredVendorIDControl = computed(() => this.getValueFormControl(EMaterialsFormControls.benaRegisteredVendorID));
  private readonly hasLocalAgentControl = computed(() => this.getFormControl(EMaterialsFormControls.doYouCurrentlyHaveLocalAgentInKSA));

  private formatYesNo(val: boolean | null | undefined): string {
    if (val === true) return 'Yes';
    if (val === false) return 'No';
    return '';
  }

  globalHQLocationSummaryField = computed<IPlanSummaryField>(() => {
    const currantValue = this.globalHQLocationControl()?.value ?? '';
    const beforeValue = this.planStore.servicePlanData()?.servicePlan?.companyInformationSection?.globalHQLocation ?? '';
    return {
      label: 'Global HQ Location',
      beforeValue: String(beforeValue),
      currantValue: String(currantValue),
      hasError: this.isFieldHasError(this.globalHQLocationControl()),
      hasComment: this.isFieldHasComment(EMaterialsFormControls.globalHQLocation, null),
      isResolved: this.isResolvedField(EMaterialsFormControls.globalHQLocation),
      showDifference: this.shouldShowDifference(currantValue, beforeValue),
    };
  });

  registeredVendorIDSummaryField = computed<IPlanSummaryField>(() => {
    const currantValue = this.registeredVendorIDControl()?.value ?? '';
    const beforeValue = this.planStore.servicePlanData()?.servicePlan?.companyInformationSection?.secVendorId ?? '';
    return {
      label: 'Registered Vendor ID with SEC (if available)',
      beforeValue: String(beforeValue),
      currantValue: String(currantValue),
      hasError: this.isFieldHasError(this.registeredVendorIDControl()),
      hasComment: this.isFieldHasComment(EMaterialsFormControls.registeredVendorIDwithSEC, null),
      isResolved: this.isResolvedField(EMaterialsFormControls.registeredVendorIDwithSEC),
      showDifference: this.shouldShowDifference(currantValue, beforeValue),
    };
  });

  benaRegisteredVendorIDSummaryField = computed<IPlanSummaryField>(() => {
    const currantValue = this.benaRegisteredVendorIDControl()?.value ?? '';
    const beforeValue = this.planStore.servicePlanData()?.servicePlan?.companyInformationSection?.benaVendorId ?? '';
    return {
      label: 'BENA Registered Vendor ID (Required)',
      beforeValue: String(beforeValue),
      currantValue: String(currantValue),
      hasError: this.isFieldHasError(this.benaRegisteredVendorIDControl()),
      hasComment: this.isFieldHasComment(EMaterialsFormControls.benaRegisteredVendorID, null),
      isResolved: this.isResolvedField(EMaterialsFormControls.benaRegisteredVendorID),
      showDifference: this.shouldShowDifference(currantValue, beforeValue),
    };
  });

  hasLocalAgentSummaryField = computed<IPlanSummaryField>(() => {
    const val = this.hasLocalAgentControl()?.value;
    const display = this.formatYesNo(val);
    const beforeVal = this.planStore.servicePlanData()?.servicePlan?.companyInformationSection?.hasLocalAgent;
    const beforeDisplay = this.formatYesNo(beforeVal);
    return {
      label: 'Do you currently have local Agent in KSA?',
      beforeValue: beforeDisplay,
      currantValue: display,
      hasError: this.hasLocalAgentControl() ? this.isFieldHasError(this.hasLocalAgentControl()) : false,
      hasComment: this.isFieldHasComment(EMaterialsFormControls.doYouCurrentlyHaveLocalAgentInKSA, null),
      isResolved: this.isResolvedField(EMaterialsFormControls.doYouCurrentlyHaveLocalAgentInKSA),
      showDifference: this.shouldShowDifference(display, beforeDisplay),
    };
  });
}
