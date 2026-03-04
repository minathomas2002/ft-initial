import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { SummarySectionBaseClass } from 'src/app/shared/classes/plans/base-classes/summary-section-base.class';
import { PlanSummaryFlied } from 'src/app/shared/components/plans/plan-summary-flied/plan-summary-flied';
import { EMaterialsFormControls } from 'src/app/shared/enums';
import { IPlanSummaryField } from 'src/app/shared/interfaces/plans.interface';
import { I18nService } from 'src/app/shared/services/i18n';
import { TranslatePipe } from 'src/app/shared/pipes/translate.pipe';

@Component({
  selector: 'app-overview-location-information-summary-section',
  imports: [PlanSummaryFlied, TranslatePipe],
  templateUrl: './overview-location-information-summary-section.html',
  styleUrl: './overview-location-information-summary-section.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OverviewLocationInformationSummarySection extends SummarySectionBaseClass {
  private readonly i18n = inject(I18nService);
  private readonly globalHQLocationControl = computed(() => this.getValueFormControl(EMaterialsFormControls.globalHQLocation));
  private readonly registeredVendorIDControl = computed(() => this.getValueFormControl(EMaterialsFormControls.registeredVendorIDwithSEC));
  private readonly benaRegisteredVendorIDControl = computed(() => this.getValueFormControl(EMaterialsFormControls.benaRegisteredVendorID));
  private readonly hasLocalAgentControl = computed(() => this.getFormControl(EMaterialsFormControls.doYouCurrentlyHaveLocalAgentInKSA));

  private formatYesNo(val: boolean | null | undefined): string {
    if (val === true) return this.i18n.translate('common.yes');
    if (val === false) return this.i18n.translate('common.no');
    return '';
  }

  globalHQLocationSummaryField = computed<IPlanSummaryField>(() => {
    this.doRefresh();
    this.i18n.currentLanguage();
    const currantValue = this.globalHQLocationControl()?.value ?? '';
    const beforeValue = this.planStore.servicePlanData()?.servicePlan?.companyInformationSection?.globalHQLocation ?? '';
    return {
      label: this.i18n.translate('plans.summary.globalHQLocation'),
      beforeValue: String(beforeValue),
      currantValue: String(currantValue),
      hasError: this.isFieldHasError(this.globalHQLocationControl()),
      hasComment: this.shouldShowCommentIcon(EMaterialsFormControls.globalHQLocation, null),
      isResolved: this.isResolvedField(EMaterialsFormControls.globalHQLocation),
      showDifference: this.shouldShowDifference(currantValue, beforeValue),
    };
  });

  registeredVendorIDSummaryField = computed<IPlanSummaryField>(() => {
    this.doRefresh();
    this.i18n.currentLanguage();
    const currantValue = this.registeredVendorIDControl()?.value ?? '';
    const beforeValue = this.planStore.servicePlanData()?.servicePlan?.companyInformationSection?.secVendorId ?? '';
    return {
      label: this.i18n.translate('plans.summary.registeredVendorIDwithSecIfAvailable'),
      beforeValue: String(beforeValue),
      currantValue: String(currantValue),
      hasError: this.isFieldHasError(this.registeredVendorIDControl()),
      hasComment: this.shouldShowCommentIcon(EMaterialsFormControls.registeredVendorIDwithSEC, null),
      isResolved: this.isResolvedField(EMaterialsFormControls.registeredVendorIDwithSEC),
      showDifference: this.shouldShowDifference(currantValue, beforeValue),
    };
  });

  benaRegisteredVendorIDSummaryField = computed<IPlanSummaryField>(() => {
    this.doRefresh();
    this.i18n.currentLanguage();
    const currantValue = this.benaRegisteredVendorIDControl()?.value ?? '';
    const beforeValue = this.planStore.servicePlanData()?.servicePlan?.companyInformationSection?.benaVendorId ?? '';
    return {
      label: this.i18n.translate('plans.summary.benaRegisteredVendorIDRequired'),
      beforeValue: String(beforeValue),
      currantValue: String(currantValue),
      hasError: this.isFieldHasError(this.benaRegisteredVendorIDControl()),
      hasComment: this.shouldShowCommentIcon(EMaterialsFormControls.benaRegisteredVendorID, null),
      isResolved: this.isResolvedField(EMaterialsFormControls.benaRegisteredVendorID),
      showDifference: this.shouldShowDifference(currantValue, beforeValue),
    };
  });

  hasLocalAgentSummaryField = computed<IPlanSummaryField>(() => {
    this.doRefresh();
    const val = this.hasLocalAgentControl()?.value;
    const display = this.formatYesNo(val);
    const beforeVal = this.planStore.servicePlanData()?.servicePlan?.companyInformationSection?.hasLocalAgent;
    const beforeDisplay = this.formatYesNo(beforeVal);
    return {
      label: this.i18n.translate('plans.summary.hasLocalAgentInKSA'),
      beforeValue: beforeDisplay,
      currantValue: display,
      hasError: this.hasLocalAgentControl() ? this.isFieldHasError(this.hasLocalAgentControl()) : false,
      hasComment: this.shouldShowCommentIcon(EMaterialsFormControls.doYouCurrentlyHaveLocalAgentInKSA, null),
      isResolved: this.isResolvedField(EMaterialsFormControls.doYouCurrentlyHaveLocalAgentInKSA),
      showDifference: this.shouldShowDifference(display, beforeDisplay),
    };
  });
}
