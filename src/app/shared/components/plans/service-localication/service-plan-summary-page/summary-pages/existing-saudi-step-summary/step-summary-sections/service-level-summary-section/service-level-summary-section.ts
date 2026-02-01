import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { FormArray, FormGroup } from '@angular/forms';
import { SummarySectionBaseClass } from 'src/app/shared/classes/plans/base-classes/summary-section-base.class';
import { PlanSummaryFlied } from 'src/app/shared/components/plans/plan-summary-flied/plan-summary-flied';
import { EMaterialsFormControls } from 'src/app/shared/enums';
import { IPlanSummaryField } from 'src/app/shared/interfaces/plans.interface';
import { TableModule } from 'primeng/table';
import { ServicePlanFormService } from 'src/app/shared/services/plan/service-plan-form-service/service-plan-form-service';

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

  yearColumns = computed(() => this.serviceForm.upcomingYears(6));

  private get serviceLevelFormArray(): FormArray {
    return this.sectionFormGroup().get(EMaterialsFormControls.serviceLevelFormGroup) as FormArray;
  }

  serviceLevelRows = computed(() => {
    const arr = this.serviceLevelFormArray;
    if (!arr?.controls?.length) return [];

    const plan = this.planStore.servicePlanData()?.servicePlan;
    const servicesForPage = plan?.serviceHeadcounts?.filter((s: { pageNumber: number }) => s.pageNumber === this.pageNumber()) ?? [];

    return arr.controls.map((ctrl, i) => {
      const group = ctrl as FormGroup;
      const rowId = group.get('rowId')?.value ?? null;
      const service = servicesForPage[i];

      const getValue = (controlName: string) => {
        const c = group.get(controlName);
        if (c instanceof FormGroup) return c.get(EMaterialsFormControls.value)?.value;
        return c?.value;
      };

      const buildField = (label: string, currant: string | number | null, before: string | number | null, fieldKey: string): IPlanSummaryField => {
        const ctrl = group.get(fieldKey);
        const valueCtrl = ctrl instanceof FormGroup ? ctrl.get(EMaterialsFormControls.value) : ctrl;
        const hasError = !!(valueCtrl && (valueCtrl as { invalid?: boolean }).invalid && (valueCtrl as { dirty?: boolean }).dirty);
        const hasComment = this.hasArrayFieldComment(fieldKey, 'serviceLevel', rowId);
        return {
          label,
          beforeValue: String(before ?? ''),
          currantValue: currant != null && currant !== '' ? String(currant) : '',
          hasError,
          hasComment,
          isResolved: false,
          showDifference: this.shouldShowDifference(currant, before),
        };
      };

      const serviceName = getValue(EMaterialsFormControls.serviceName) ?? '';
      const beforeServiceName = plan?.services && service?.planServiceTypeId
        ? plan.services.find((s: { id: string }) => s.id === service.planServiceTypeId)?.serviceName ?? null
        : null;

      const expectedDate = getValue(this.expectedDateControlKey()) ?? '';
      const beforeExpectedDate = service?.localizationDate ?? null;

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

  private hasArrayFieldComment(fieldKey: string, section: string, rowId: string | null): boolean {
    return this.sectionSummaryFields().some((f) => {
      const matchKey = f.inputKey === fieldKey || f.inputKey === `${section}.${fieldKey}` ||
        (f.inputKey?.startsWith(fieldKey + '_') && /^\d+$/.test(f.inputKey.substring(fieldKey.length + 1)));
      if (!matchKey) return false;
      return rowId == null ? f.id == null : f.id === rowId;
    });
  }
}
