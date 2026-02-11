import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { EMaterialsFormControls } from 'src/app/shared/enums';
import { IPlanSummaryField, SaudizationRow } from 'src/app/shared/interfaces/plans.interface';
import { PlanStore } from 'src/app/shared/stores/plan/plan.store';
import { PlanSummaryFlied } from 'src/app/shared/components/plans/plan-summary-flied/plan-summary-flied';
import { TranslatePipe } from 'src/app/shared/pipes/translate.pipe';
import { RoleService } from 'src/app/shared/services/role/role-service';
import { I18nService } from 'src/app/shared/services/i18n';
import { TableModule } from 'primeng/table';
import { SummarySectionBaseClass } from 'src/app/shared/classes/plans/base-classes/summary-section-base.class';
import {
  SAUDIZATION_ROW_KEYS,
  SAUDIZATION_YEAR_KEYS,
} from 'src/app/shared/components/plans/plan-localization/plan-localization-step-04-saudization/saudization.constants';
import { EInternalUserPlanStatus } from 'src/app/shared/interfaces';
import { ERoles } from 'src/app/shared/enums';

const SAUDIZATION_TYPE_BY_KEY: Record<string, number> = {
  [EMaterialsFormControls.annualHeadcount]: 1,
  [EMaterialsFormControls.saudizationPercentage]: 2,
  [EMaterialsFormControls.annualTotalCompensation]: 3,
  [EMaterialsFormControls.saudiCompensationPercentage]: 4,
};

@Component({
  selector: 'app-saudization-section-summary',
  imports: [PlanSummaryFlied, TranslatePipe, TableModule],
  templateUrl: './saudization-section-summary.html',
  styleUrl: './saudization-section-summary.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SaudizationSectionSummaryComponent extends SummarySectionBaseClass {


  /** Row labels in order: Annual Headcount, Saudization %, Annual Total Compensation, Saudi Compensation % */
  readonly rowLabels = input.required<{ label: string; rowKey: string }[]>();

  /** Build before-value lookup from plan data (saudizationRows by saudizationType) */
  private beforeRowsByType = computed(() => {
    const rows = this.planStore.productPlanData()?.productPlan?.saudization?.saudizationRows ?? [];
    const map: Record<number, SaudizationRow> = {};
    rows.forEach((r: SaudizationRow) => { map[r.saudizationType] = r; });
    return map;
  });

  /** One row per metric (4 rows), each with year1..year7 cell data */
  rows = computed(() => {
    this.doRefresh();
    const formGroup = this.sectionFormGroup();
    const summaryFields = this.sectionSummaryFields();
    const beforeMap = this.beforeRowsByType();
    const labels = this.rowLabels();

    return SAUDIZATION_ROW_KEYS.map((rowKey, index) => {
      const beforeRow = beforeMap[SAUDIZATION_TYPE_BY_KEY[rowKey]];
      const label = labels[index]?.label ?? rowKey;

      const cell = (yearIndex: number) => {
        const yearKey = SAUDIZATION_YEAR_KEYS[yearIndex];
        const yearFormGroup = formGroup.get(yearKey) as FormGroup | null;
        const rowFormGroup = yearFormGroup?.get(rowKey) as FormGroup | null;
        const valueControl = rowFormGroup?.get(EMaterialsFormControls.value) as FormControl | null;
        const value = valueControl?.value ?? 0;
        const rowId = rowFormGroup?.get(EMaterialsFormControls.rowId)?.value ?? null;
        // Match comment fields by yearKey + id (rowId). Support legacy formats for backward compatibility.
        let matchingField = summaryFields.find(
          f => f.inputKey === yearKey && (rowId == null || f.id === rowId)
        );
        if (!matchingField) {
          const legacyYearKey = String(yearIndex + 1);
          matchingField = summaryFields.find(
            f => f.inputKey === legacyYearKey && (rowId == null || f.id === rowId)
          );
        }
        if (!matchingField) {
          const legacyControlKey = `${rowKey}_year${yearIndex + 1}`;
          matchingField = summaryFields.find(
            f => f.inputKey === legacyControlKey && (rowId == null || f.id === rowId)
          );
        }
        const keyForLookup = matchingField?.inputKey ?? yearKey;
        const hasComment = this.shouldShowCommentIcon(keyForLookup, matchingField?.id ?? rowId);
        const hasError = valueControl ? this.isFieldHasError(valueControl) : false;
        const yearNum = yearIndex + 1;
        const beforeVal = beforeRow ? (beforeRow as SaudizationRow)[`year${yearNum}` as keyof SaudizationRow] : null;
        const beforeValue: string | number = (beforeVal != null && (typeof beforeVal === 'number' || typeof beforeVal === 'string')) ? beforeVal : '';
        const showDiff = this.shouldShowDifference(value, beforeValue);
        const isResolved = this.isResolvedFieldForMatrix(
          keyForLookup,
          matchingField?.id ?? rowId,
          rowFormGroup
        );
        return { value, beforeValue, hasError, hasComment, showDifference: showDiff, isResolved };
      };

      return {
        rowKey,
        label,
        year1: cell(0),
        year2: cell(1),
        year3: cell(2),
        year4: cell(3),
        year5: cell(4),
        year6: cell(5),
        year7: cell(6),
      };
    });
  });

  /**
   * Matrix-specific isResolvedField: uses rowFormGroup for hasComment check
   * (base getFormControl expects flat control names, but matrix has year.row.hasComment structure).
   */
  private isResolvedFieldForMatrix(
    inputKey: string,
    rowId: string | null,
    rowFormGroup: FormGroup | null
  ): boolean {
    const hasCommentChecked = rowFormGroup?.get(EMaterialsFormControls.hasComment)?.value ?? false;
    return (
      this.isFieldHasComment(inputKey, rowId) &&
      !hasCommentChecked &&
      ['view', 'Review'].includes(this.planStore.wizardMode()) &&
      this.planStore.planStatus() === EInternalUserPlanStatus.UNDER_REVIEW &&
      this.roleService.hasAnyRoleSignal([ERoles.EMPLOYEE])()
    );
  }

  formatDisplayValue(value: unknown, isPercentage: boolean): string {
    return isPercentage ? `${value}%` : String(value).toLocaleString();
  }

  getSummaryField(
    cell: { beforeValue: string | number; hasError: boolean; hasComment: boolean; showDifference: boolean; isResolved: boolean },
    currentValueDisplay: string
  ): IPlanSummaryField {
    return {
      label: '',
      beforeValue: String(cell.beforeValue ?? ''),
      currantValue: currentValueDisplay || '-',
      hasError: cell.hasError,
      hasComment: cell.hasComment,
      isResolved: cell.isResolved,
      showDifference: cell.showDifference,
    };
  }
}
