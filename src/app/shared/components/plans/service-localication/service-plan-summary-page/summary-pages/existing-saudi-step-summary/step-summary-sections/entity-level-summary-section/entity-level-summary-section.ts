import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { FormArray, FormGroup } from '@angular/forms';
import { SummarySectionBaseClass } from 'src/app/shared/classes/plans/base-classes/summary-section-base.class';
import { PlanSummaryFlied } from 'src/app/shared/components/plans/plan-summary-flied/plan-summary-flied';
import { EMaterialsFormControls, ERoles } from 'src/app/shared/enums';
import { IPlanSummaryField } from 'src/app/shared/interfaces/plans.interface';
import { TableModule } from 'primeng/table';
import { ServicePlanFormService } from 'src/app/shared/services/plan/service-plan-form-service/service-plan-form-service';
import { I18nService } from 'src/app/shared/services/i18n';

const YEAR_CONTROL_KEYS = [
  EMaterialsFormControls.firstYear,
  EMaterialsFormControls.secondYear,
  EMaterialsFormControls.thirdYear,
  EMaterialsFormControls.fourthYear,
  EMaterialsFormControls.fifthYear,
  EMaterialsFormControls.sixthYear,
] as const;

const ENTITY_LEVEL_ROWS = [
  { label: 'Expected Annual Headcount', controlKey: 'headcount' },
  { label: 'Expected Saudization (%)', controlKey: 'saudization' },
] as const;

const YEAR_MAP: Record<string, string> = {
  firstYear_headcount: 'y1Headcount',
  secondYear_headcount: 'y2Headcount',
  thirdYear_headcount: 'y3Headcount',
  fourthYear_headcount: 'y4Headcount',
  fifthYear_headcount: 'y5Headcount',
  sixthYear_headcount: 'y6Headcount',
  firstYear_saudization: 'y1Saudization',
  secondYear_saudization: 'y2Saudization',
  thirdYear_saudization: 'y3Saudization',
  fourthYear_saudization: 'y4Saudization',
  fifthYear_saudization: 'y5Saudization',
  sixthYear_saudization: 'y6Saudization',
};

@Component({
  selector: 'app-entity-level-summary-section',
  imports: [PlanSummaryFlied, TableModule],
  templateUrl: './entity-level-summary-section.html',
  styleUrl: './entity-level-summary-section.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EntityLevelSummarySection extends SummarySectionBaseClass {
  private readonly serviceForm = inject(ServicePlanFormService);

  /** Page number for entity headcounts (3 = Existing Saudi, 4 = Direct Localization) */
  pageNumber = input<number>(3);

  yearColumns = computed(() => this.serviceForm.upcomingYears(6));

  // Computed signal to get corrected field IDs based on page number
  private correctedFieldIds = computed<string[]>(() => {
    const pageNum = this.pageNumber();
    const pageTitle = pageNum === 3 ? 'Existing Saudi Co.' : 'Direct Localization';
    const stepComments = this.planStore.planComments()?.comments
      .find(comment => comment.pageTitleForTL === pageTitle);
    if (!stepComments) return [];
    return stepComments.fields
      .filter(field => field.id)
      .map(field => field.id!)
      .filter((id, index, self) => self.indexOf(id) === index); // Remove duplicates
  });

  private get entityLevelFormArray(): FormArray {
    return this.sectionFormGroup().get(EMaterialsFormControls.entityLevelFormGroup) as FormArray;
  }

  entityLevel = computed(() => {
    this.doRefresh();
    const arr = this.entityLevelFormArray;
    if (!arr?.length) return null;

    const group = arr.at(0) as FormGroup;
    const rowId = group.get('rowId')?.value ?? null;
    const plan = this.planStore.servicePlanData()?.servicePlan;
    const entity = plan?.entityHeadcounts?.find((e: { pageNumber: number }) => e.pageNumber === this.pageNumber());

    const getValue = (controlName: string) => {
      const c = group.get(controlName);
      if (c instanceof FormGroup) return c.get(EMaterialsFormControls.value)?.value;
      return c?.value;
    };

    const buildField = (controlName: string): IPlanSummaryField => {
      const ctrl = group.get(controlName);
      const valueCtrl = ctrl instanceof FormGroup ? ctrl.get(EMaterialsFormControls.value) : ctrl;
      const currantVal = getValue(controlName);
      const beforeVal = entity && YEAR_MAP[controlName] ? (entity as unknown as Record<string, unknown>)[YEAR_MAP[controlName]] : null;
      const hasError = !!(valueCtrl && (valueCtrl as { invalid?: boolean }).invalid && (valueCtrl as { dirty?: boolean }).dirty);
      const matchingField = this.findMatchingField(controlName, 'entityLevel', rowId);
      const hasComment = !!matchingField;
      const isResolved = this.isFieldResolved(matchingField);
      return {
        label: '',
        beforeValue: String(beforeVal ?? ''),
        currantValue: currantVal != null && currantVal !== '' ? String(currantVal) : '',
        hasError,
        hasComment,
        isResolved,
        showDifference: this.shouldShowDifference(currantVal, beforeVal),
      };
    };

    return {
      rows: ENTITY_LEVEL_ROWS.map((rowConfig) => ({
        label: rowConfig.label,
        yearValues: YEAR_CONTROL_KEYS.map((key) => {
          const controlName = `${key}_${rowConfig.controlKey}`;
          return { controlName, summaryField: buildField(controlName) };
        }),
      })),
    };
  });


  /**
   * Finds the matching field from sectionSummaryFields based on fieldKey, section, and rowId.
   * For entity level, the expected input key format is 'entityLevel_' + controlName.
   * Returns the matching field or undefined if not found.
   */
  private findMatchingField(fieldKey: string, section: string, rowId: string | null) {
    const expectedInputKey = `${section}_${fieldKey}`;
    return this.sectionSummaryFields().find((f) => {
      const matchKey = f.inputKey === expectedInputKey || f.inputKey === fieldKey;
      if (!matchKey) return false;
      return rowId == null ? f.id == null : f.id === rowId;
    });
  }

  /**
   * Checks if a field is resolved (corrected by investor).
   * A field is resolved if it has a comment, has an id, the id is in correctedFieldIds,
   * and the wizard is in view/Review mode with an employee user.
   */
  private isFieldResolved(matchingField: { id?: string } | undefined): boolean {
    if (!matchingField?.id) return false;
    return this.correctedFieldIds().includes(matchingField.id) &&
      ['view', 'Review'].includes(this.planStore.wizardMode()) &&
      this.roleService.hasAnyRoleSignal([ERoles.EMPLOYEE])();
  }
}
