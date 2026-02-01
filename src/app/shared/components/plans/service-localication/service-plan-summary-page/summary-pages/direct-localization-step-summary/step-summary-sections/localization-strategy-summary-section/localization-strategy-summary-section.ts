import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { FormArray, FormGroup } from '@angular/forms';
import { SummarySectionBaseClass } from 'src/app/shared/classes/plans/base-classes/summary-section-base.class';
import { PlanSummaryFlied } from 'src/app/shared/components/plans/plan-summary-flied/plan-summary-flied';
import { EMaterialsFormControls } from 'src/app/shared/enums';
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
    const arr = this.serviceLevelFormArray;
    if (!arr?.controls?.length) return [];

    const plan = this.planStore.servicePlanData()?.servicePlan;

    return arr.controls.map((ctrl, i) => {
      const group = ctrl as FormGroup;
      const rowId = group.get('rowId')?.value ?? null;
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
        const showDiff = !!(valueCtrl && this.planStore.wizardMode() === 'resubmit' && (valueCtrl as { dirty?: boolean }).dirty);
        const hasComment = this.hasArrayFieldComment(fieldKey, 'localizationStrategy', rowId);
        return {
          label,
          beforeValue: String(before ?? ''),
          currantValue: currant != null && currant !== '' ? String(currant) : '',
          hasError,
          hasComment,
          isResolved: false,
          showDifference: showDiff,
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
      const currantProprietaryExplanation = getValue(EMaterialsFormControls.proprietaryToolsSystemsDetails) ?? '';
      const beforeProprietaryExplanation = strategy?.proprietaryToolsDetails ?? null;

      return {
        serviceName: buildField('', currantServiceName, beforeServiceName, EMaterialsFormControls.serviceName),
        expectedLocalizationDate: buildField('', currantExpectedDate, beforeExpectedDate, EMaterialsFormControls.expectedLocalizationDate),
        localizationApproach: buildField('', currantApproach, beforeApproach, EMaterialsFormControls.localizationApproach),
        localizationApproachOther: currantApproachOther || beforeApproachOther ? { currant: currantApproachOther, before: beforeApproachOther, hasComment: this.hasArrayFieldComment(EMaterialsFormControls.localizationApproachOtherDetails, 'localizationStrategy', rowId) } : null,
        location: buildField('Location', currantLocation, beforeLocation, EMaterialsFormControls.location),
        locationOther: currantLocationOther || beforeLocationOther ? { currant: currantLocationOther, before: beforeLocationOther, hasComment: this.hasArrayFieldComment(EMaterialsFormControls.locationOtherDetails, 'localizationStrategy', rowId) } : null,
        capexRequired: buildField('', currantCapex != null ? String(currantCapex) : null, beforeCapex != null ? String(beforeCapex) : null, EMaterialsFormControls.capexRequired),
        supervisionOversight: buildField('', currantSupervision, beforeSupervision, EMaterialsFormControls.supervisionOversightByGovernmentEntity),
        proprietaryTools: buildField('', currantProprietary, beforeProprietary, EMaterialsFormControls.willBeAnyProprietaryToolsSystems),
        proprietaryToolsExplanation: currantProprietaryExplanation || beforeProprietaryExplanation ? { currant: currantProprietaryExplanation, before: beforeProprietaryExplanation, hasComment: this.hasArrayFieldComment(EMaterialsFormControls.proprietaryToolsSystemsDetails, 'localizationStrategy', rowId) } : null,
      };
    });
  });

  private hasArrayFieldComment(fieldKey: string, section: string, rowId: string | null): boolean {
    return this.sectionSummaryFields().some((f) => {
      const matchKey = f.inputKey === fieldKey || f.inputKey === `${section}.${fieldKey}` ||
        (f.inputKey?.startsWith(fieldKey + '_') && /^\d+$/.test(f.inputKey.substring(fieldKey.length + 1)));
      if (!matchKey) return false;
      return rowId == null ? f.id == null : f.id === rowId;
    });
  }
}
