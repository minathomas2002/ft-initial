import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { SummarySectionBaseClass } from 'src/app/shared/classes/plans/base-classes/summary-section-base.class';
import { PlanSummaryFlied } from 'src/app/shared/components/plans/plan-summary-flied/plan-summary-flied';
import { EMaterialsFormControls, ERoles } from 'src/app/shared/enums';
import { IPlanSummaryField } from 'src/app/shared/interfaces/plans.interface';
import { TableModule } from 'primeng/table';
import { ServicePlanFormService } from 'src/app/shared/services/plan/service-plan-form-service/service-plan-form-service';
import { I18nService } from 'src/app/shared/services/i18n';
import { EInternalUserPlanStatus } from 'src/app/shared/interfaces';

const YEAR_CONTROL_KEYS = [
  EMaterialsFormControls.firstYear,
  EMaterialsFormControls.secondYear,
  EMaterialsFormControls.thirdYear,
  EMaterialsFormControls.fourthYear,
  EMaterialsFormControls.fifthYear,
  EMaterialsFormControls.sixthYear,
] as const;

@Component({
  selector: 'app-service-level-summary-section',
  imports: [PlanSummaryFlied, TableModule],
  templateUrl: './service-level-summary-section.html',
  styleUrl: './service-level-summary-section.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ServiceLevelSummarySection extends SummarySectionBaseClass {
  private readonly serviceForm = inject(ServicePlanFormService);

  /** Page number for service headcounts (3 = Existing Saudi, 4 = Direct Localization) */
  pageNumber = input<number>(3);

  /** Control for expected localization date - 'expectedLocalizationDate' for Existing Saudi, 'serviceLevelLocalizationDate' for Direct Localization */
  expectedDateControlKey = input<string>(EMaterialsFormControls.expectedLocalizationDate);

  yearColumns = computed(() => this.serviceForm?.upcomingYears(6) ?? []);

  private get serviceLevelFormArray(): FormArray {
    return this.sectionFormGroup().get(EMaterialsFormControls.serviceLevelFormGroup) as FormArray;
  }

  serviceLevelRows = computed(() => {
    this.doRefresh();
    const arr = this.serviceLevelFormArray;
    if (!arr?.controls?.length) return [];

    const plan = this.planStore.servicePlanData()?.servicePlan;
    const servicesForPage = plan?.serviceHeadcounts?.filter((s: { pageNumber: number }) => s.pageNumber === this.pageNumber()) ?? [];

    return arr.controls.map((ctrl, i) => {
      const group = ctrl as FormGroup;
      const rowId = group.get('rowId')?.value ?? null;
      // Step 04 (Direct Localization) has serviceHeadcountRowId and localizationStrategyRowId; Step 03 (Existing Saudi) only has rowId
      const rowIdForMatch = group.get(EMaterialsFormControls.serviceHeadcountRowId)?.value ?? rowId;
      const localizationStrategyRowId = group.get(EMaterialsFormControls.localizationStrategyRowId)?.value ?? null;
      const serviceId = group.get(EMaterialsFormControls.serviceId)?.value ?? null;
      // Match by identity (rowId or planServiceTypeId), not by array index, so reordered rows show correct before/current
      const service = servicesForPage.find(
        (h: { id?: string; planServiceTypeId: string; pageNumber?: number }) =>
          (rowIdForMatch != null && h.id === rowIdForMatch) ||
          (serviceId != null && h.planServiceTypeId === serviceId && h.pageNumber === this.pageNumber())
      );

      const getValue = (controlName: string) => {
        const c = group.get(controlName);
        if (c instanceof FormGroup) return c.get(EMaterialsFormControls.value)?.value ?? '0';
        return c?.value ?? '0';
      };

      const buildField = (label: string, currant: string | number | null, before: string | number | null, fieldKey: string): IPlanSummaryField => {
        const fieldGroup = group.get(fieldKey);
        const valueCtrl = fieldGroup instanceof FormGroup ? (fieldGroup.get(EMaterialsFormControls.value) as FormControl) : null;
        const hasError = valueCtrl ? this.isFieldHasError(valueCtrl) : false;
        const matchingField = this.findMatchingField(fieldKey, 'serviceLevel', rowIdForMatch, localizationStrategyRowId);
        const hasComment = matchingField != null;
        const hasCommentChecked = (fieldGroup instanceof FormGroup && fieldGroup.get(EMaterialsFormControls.hasComment)?.value) ?? false;
        const isResolved =
          hasComment &&
          !hasCommentChecked &&
          ['view', 'Review'].includes(this.planStore.wizardMode()) &&
          this.planStore.planStatus() === EInternalUserPlanStatus.UNDER_REVIEW &&
          this.roleService.hasAnyRoleSignal([ERoles.EMPLOYEE])();
        return {
          label,
          beforeValue: String(before ?? ''),
          currantValue: currant != null && currant !== '' ? String(currant) : '',
          hasError,
          hasComment,
          isResolved,
          showDifference: this.shouldShowDifference(currant, before),
        };
      };

      const serviceName = getValue(EMaterialsFormControls.serviceName) ?? '';
      const beforeServiceName = serviceName

      const expectedDate = getValue(this.expectedDateControlKey()) === '0' ? '' : getValue(this.expectedDateControlKey());
      const beforeExpectedDate = service?.localizationDate ?? '';

      const yearMapHeadcount: Record<string, string> = {
        firstYear_headcount: 'y1Headcount', secondYear_headcount: 'y2Headcount', thirdYear_headcount: 'y3Headcount',
        fourthYear_headcount: 'y4Headcount', fifthYear_headcount: 'y5Headcount', sixthYear_headcount: 'y6Headcount',
      };
      const yearMapSaudization: Record<string, string> = {
        firstYear_saudization: 'y1Saudization', secondYear_saudization: 'y2Saudization', thirdYear_saudization: 'y3Saudization',
        fourthYear_saudization: 'y4Saudization', fifthYear_saudization: 'y5Saudization', sixthYear_saudization: 'y6Saudization',
      };

      const headcountYears = YEAR_CONTROL_KEYS.map((key) => {
        const controlName = `${key}_headcount`;
        const currant = getValue(controlName);
        const before = service ? (service as unknown as Record<string, unknown>)[yearMapHeadcount[controlName]] : null;
        return { controlName, summaryField: buildField('', currant, before != null ? (before as string | number) : null, controlName) };
      });

      const saudizationYears = YEAR_CONTROL_KEYS.map((key) => {
        const controlName = `${key}_saudization`;
        const currant = getValue(controlName);
        const before = service ? (service as unknown as Record<string, unknown>)[yearMapSaudization[controlName]] : null;
        return { controlName, summaryField: buildField('', currant, before != null ? (before as string | number) : null, controlName) };
      });

      return {
        index: i,
        serviceName: buildField('', serviceName, beforeServiceName, EMaterialsFormControls.serviceName),
        expectedLocalizationDate: buildField('', expectedDate, beforeExpectedDate, this.expectedDateControlKey()),
        headcountYears,
        saudizationYears,
        keyMeasuresToUpskillSaudis: buildField('', getValue(EMaterialsFormControls.keyMeasuresToUpskillSaudis) ?? null, service?.measuresUpSkillSaudis ?? null, EMaterialsFormControls.keyMeasuresToUpskillSaudis),
        mentionSupportRequiredFromSEC: buildField('', getValue(EMaterialsFormControls.mentionSupportRequiredFromSEC) ?? null, service?.mentionSupportRequiredSEC ?? null, EMaterialsFormControls.mentionSupportRequiredFromSEC),
      };
    });
  });

  /**
   * Finds the matching field from sectionSummaryFields based on fieldKey, section, and rowId.
   * For Step 04 (Direct Localization), also matches by localizationStrategyRowId when f.id is legacy strategy id.
   * Returns the matching field or undefined if not found.
   */
  private findMatchingField(fieldKey: string, section: string, rowId: string | null, localizationStrategyRowId?: string | null) {
    return this.sectionSummaryFields().find((f) => {
      const matchKey = f.inputKey === fieldKey || f.inputKey === `${section}.${fieldKey}` ||
        (f.inputKey?.startsWith(fieldKey + '_') && /^\d+$/.test(f.inputKey.substring(fieldKey.length + 1)));
      if (!matchKey) return false;
      if (f.id == null) return rowId == null;
      return f.id === rowId || (localizationStrategyRowId != null && f.id === localizationStrategyRowId);
    });
  }
}
