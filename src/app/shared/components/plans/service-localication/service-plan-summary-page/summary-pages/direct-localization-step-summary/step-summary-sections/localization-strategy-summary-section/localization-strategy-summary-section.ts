import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { FormArray, FormGroup } from '@angular/forms';
import { SummarySectionBaseClass } from 'src/app/shared/classes/plans/base-classes/summary-section-base.class';
import { PlanSummaryFlied } from 'src/app/shared/components/plans/plan-summary-flied/plan-summary-flied';
import { EMaterialsFormControls, ERoles } from 'src/app/shared/enums';
import { IPlanSummaryField } from 'src/app/shared/interfaces/plans.interface';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-localization-strategy-summary-section',
  imports: [PlanSummaryFlied, TableModule, TooltipModule],
  templateUrl: './localization-strategy-summary-section.html',
  styleUrl: './localization-strategy-summary-section.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LocalizationStrategySummarySection extends SummarySectionBaseClass {
  private get serviceLevelFormArray(): FormArray {
    return this.sectionFormGroup().get(EMaterialsFormControls.serviceLevelFormGroup) as FormArray;
  }

  private mapOptionName(options: Array<{ id: string; name: string }>, rawValue: unknown): string | null {
    if (rawValue === null || rawValue === undefined || rawValue === '') return null;
    const raw = String(rawValue);
    const match = options.find((o) => String(o.id) === raw);
    return match ? match.name : raw;
  }

  private formatLocalizationApproach(value: unknown): string | null {
    return this.mapOptionName(this.planStore.localizationApproachOptions(), value);
  }

  private formatLocation(value: unknown): string | null {
    return this.mapOptionName(this.planStore.locationOptions(), value);
  }

  private formatYesNo(value: unknown): string | null {
    if (value === true || value === 'true') return 'Yes';
    if (value === false || value === 'false') return 'No';
    return this.mapOptionName(this.planStore.yesNoOptions(), value);
  }

  localizationStrategyRows = computed(() => {
    this.doRefresh();
    const arr = this.serviceLevelFormArray;
    if (!arr?.controls?.length) return [];

    const plan = this.planStore.servicePlanData()?.servicePlan;

    return arr.controls.map((ctrl, i) => {
      const group = ctrl as FormGroup;
      const rowId = group.get('rowId')?.value ?? group.get('id')?.value ?? null;
      const serviceId = group.get(EMaterialsFormControls.serviceId)?.value;
      const strategy = plan?.localizationStrategies?.find((s: { planServiceTypeId: string }) => s.planServiceTypeId === serviceId);
      const service = plan?.services?.find((s: { id: string }) => s.id === serviceId);

      const getValue = (controlName: string) => {
        const c = group.get(controlName);
        if (c instanceof FormGroup) return c.get(EMaterialsFormControls.value)?.value;
        return c?.value;
      };

      const buildField = (label: string, currant: string | number | null, before: string | number | null, fieldKey: string): IPlanSummaryField => {
        const ctrl = group.get(fieldKey);
        const valueCtrl = ctrl instanceof FormGroup ? ctrl.get(EMaterialsFormControls.value) : ctrl;
        const hasError = !!(valueCtrl && (valueCtrl as { invalid?: boolean }).invalid && (valueCtrl as { dirty?: boolean }).dirty);
        const hasComment = this.hasLocalizationStrategyFieldComment(fieldKey, i, rowId);
        const isResolved = this.isResolvedFieldForLocalizationStrategy(fieldKey, i, rowId, group);
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

      const currantServiceName = getValue(EMaterialsFormControls.serviceName) ?? '';
      const beforeServiceName = service?.serviceName ?? null;
      const currantExpectedDate = getValue(EMaterialsFormControls.expectedLocalizationDate) ?? '';
      const beforeExpectedDate = strategy?.expectedLocalizationDate ?? null;
      const currantApproach = this.formatLocalizationApproach(getValue(EMaterialsFormControls.localizationApproach));
      const beforeApproach = this.formatLocalizationApproach(strategy?.localizationApproach ?? null);
      const currantApproachOther = getValue(EMaterialsFormControls.localizationApproachOtherDetails) ?? '';
      const beforeApproachOther = strategy?.otherLocalizationApproach ?? null;
      const currantLocation = this.formatLocation(getValue(EMaterialsFormControls.location));
      const beforeLocation = this.formatLocation(strategy?.locationType ?? null);
      const currantLocationOther = getValue(EMaterialsFormControls.locationOtherDetails) ?? '';
      const beforeLocationOther = strategy?.otherLocationType ?? null;
      const currantCapex = getValue(EMaterialsFormControls.capexRequired);
      const beforeCapex = strategy?.capexRequired ?? null;
      const currantSupervision = getValue(EMaterialsFormControls.supervisionOversightByGovernmentEntity) ?? '';
      const beforeSupervision = strategy?.governmentSupervision ?? null;
      const currantProprietary = this.formatYesNo(getValue(EMaterialsFormControls.willBeAnyProprietaryToolsSystems));
      const beforeProprietary = this.formatYesNo(strategy?.hasProprietaryTools ?? null);
      const currantProprietaryExplanationRaw = String(getValue(EMaterialsFormControls.proprietaryToolsSystemsDetails) ?? '');
      const beforeProprietaryExplanationRaw = String(strategy?.proprietaryToolsDetails ?? '');
      const shouldShowProprietaryExplanation = !!(
        currantProprietaryExplanationRaw.trim() ||
        beforeProprietaryExplanationRaw.trim()
      );

      return {
        serviceName: buildField('', currantServiceName, beforeServiceName, EMaterialsFormControls.serviceName),
        expectedLocalizationDate: buildField('', currantExpectedDate, beforeExpectedDate, EMaterialsFormControls.expectedLocalizationDate),
        localizationApproach: buildField('', currantApproach, beforeApproach, EMaterialsFormControls.localizationApproach),
        localizationApproachOther: currantApproachOther || beforeApproachOther ? { currant: currantApproachOther, before: beforeApproachOther, hasComment: this.hasLocalizationStrategyFieldComment(EMaterialsFormControls.localizationApproachOtherDetails, i, rowId) } : null,
        location: buildField('Location', currantLocation, beforeLocation, EMaterialsFormControls.location),
        locationOther: currantLocationOther || beforeLocationOther ? { currant: currantLocationOther, before: beforeLocationOther, hasComment: this.hasLocalizationStrategyFieldComment(EMaterialsFormControls.locationOtherDetails, i, rowId) } : null,
        capexRequired: buildField('', currantCapex != null ? String(currantCapex) : null, beforeCapex != null ? String(beforeCapex) : null, EMaterialsFormControls.capexRequired),
        supervisionOversight: buildField('', currantSupervision, beforeSupervision, EMaterialsFormControls.supervisionOversightByGovernmentEntity),
        proprietaryTools: buildField('', currantProprietary, beforeProprietary, EMaterialsFormControls.willBeAnyProprietaryToolsSystems),
        proprietaryToolsExplanation: shouldShowProprietaryExplanation
          ? buildField('', currantProprietaryExplanationRaw, beforeProprietaryExplanationRaw, EMaterialsFormControls.proprietaryToolsSystemsDetails)
          : null,
      };
    });
  });

  /**
   * Check if the localization strategy field has a comment.
   * Input key in sectionSummaryFields matches step form: fieldKey_index
   * (e.g. expectedLocalizationDate_0, localizationApproach_0, capexRequired_0)
   * Note: supervisionOversightByGovernmentEntity may use fieldKey+index without underscore.
   */
  private hasLocalizationStrategyFieldComment(fieldKey: string, index: number, rowId: string | null): boolean {
    const expectedInputKey = `${fieldKey}_${index}`;
    const expectedInputKeyAlt = `${fieldKey}${index}`; // fallback for supervisionOversightByGovernmentEntity0

    // Some step templates intentionally use simplified aliases (not the raw enum string)
    // when sending/saving comments. Support those here for backward compatibility.
    const aliasKeys: string[] = [];
    if (fieldKey === EMaterialsFormControls.location) {
      aliasKeys.push(`location_${index}`, `location${index}`, 'location');
    }
    if (fieldKey === EMaterialsFormControls.capexRequired) {
      aliasKeys.push(`capexRequired_${index}`, `capexRequired${index}`, 'capexRequired');
    }

    return this.sectionSummaryFields().some((f) => {
      const matchKey =
        f.inputKey === expectedInputKey ||
        f.inputKey === expectedInputKeyAlt ||
        f.inputKey === fieldKey ||
        aliasKeys.includes(f.inputKey);
      if (!matchKey) return false;
      // Match by row id when present; when field has no id, match only rows with no id (e.g. create mode)
      return f.id ? f.id === rowId : rowId == null;
    });
  }

  private isResolvedFieldForLocalizationStrategy(fieldKey: string, index: number, rowId: string | null, rowGroup: FormGroup): boolean {
    const fieldCtrl = rowGroup.get(fieldKey);
    const hasCommentControl = fieldCtrl instanceof FormGroup
      ? fieldCtrl.get(EMaterialsFormControls.hasComment)
      : null;
    const isHasCommentChecked = hasCommentControl?.value ?? false;

    return this.hasLocalizationStrategyFieldComment(fieldKey, index, rowId) &&
      !isHasCommentChecked &&
      ['view', 'Review'].includes(this.planStore.wizardMode()) &&
      this.roleService.hasAnyRoleSignal([ERoles.EMPLOYEE])();
  }
}
