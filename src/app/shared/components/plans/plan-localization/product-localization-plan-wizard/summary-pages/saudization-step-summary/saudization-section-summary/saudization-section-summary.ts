import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { EMaterialsFormControls, ERoles } from 'src/app/shared/enums';
import { IFieldInformation, IPlanSummaryField, SaudizationRow } from 'src/app/shared/interfaces/plans.interface';
import { PlanStore } from 'src/app/shared/stores/plan/plan.store';
import { PlanSummaryFlied } from 'src/app/shared/components/plans/plan-summary-flied/plan-summary-flied';
import { TranslatePipe } from 'src/app/shared/pipes/translate.pipe';
import { RoleService } from 'src/app/shared/services/role/role-service';
import { I18nService } from 'src/app/shared/services/i18n';
import { TableModule } from 'primeng/table';
import { SummarySectionBaseClass } from 'src/app/shared/classes/plans/base-classes/summary-section-base.class';

const SAUDIZATION_TYPE_BY_KEY: Record<string, number> = {
  [EMaterialsFormControls.annualHeadcount]: 1,
  [EMaterialsFormControls.saudizationPercentage]: 2,
  [EMaterialsFormControls.annualTotalCompensation]: 3,
  [EMaterialsFormControls.saudiCompensationPercentage]: 4,
};

const ROW_KEYS = [
  EMaterialsFormControls.annualHeadcount,
  EMaterialsFormControls.saudizationPercentage,
  EMaterialsFormControls.annualTotalCompensation,
  EMaterialsFormControls.saudiCompensationPercentage,
] as const;

const YEAR_KEYS = [
  EMaterialsFormControls.year1,
  EMaterialsFormControls.year2,
  EMaterialsFormControls.year3,
  EMaterialsFormControls.year4,
  EMaterialsFormControls.year5,
  EMaterialsFormControls.year6,
  EMaterialsFormControls.year7,
] as const;

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

    return ROW_KEYS.map((rowKey, index) => {
      const beforeRow = beforeMap[SAUDIZATION_TYPE_BY_KEY[rowKey]];
      const label = labels[index]?.label ?? rowKey;

      const cell = (yearIndex: number) => {
        const yearKey = YEAR_KEYS[yearIndex];
        const yearFormGroup = formGroup.get(yearKey) as FormGroup | null;
        const rowFormGroup = yearFormGroup?.get(rowKey) as FormGroup | null;
        const valueControl = rowFormGroup?.get(EMaterialsFormControls.value) as FormControl | null;
        const value = valueControl?.value ?? '';
        const yearNum = yearIndex + 1;
        const inputKey = `${rowKey}_year${yearNum}`;
        const matchingField = summaryFields.find(f => f.inputKey === inputKey);
        const hasComment = this.isFieldHasComment(inputKey, matchingField?.id);
        const hasError = this.isFieldHasError(valueControl!);
        const beforeVal = beforeRow ? (beforeRow as SaudizationRow)[`year${yearNum}` as keyof SaudizationRow] : null;
        const beforeValue: string | number = (beforeVal != null && (typeof beforeVal === 'number' || typeof beforeVal === 'string')) ? beforeVal : '';
        const showDiff = this.shouldShowDifference(value, beforeValue);
        const isResolved = this.isResolvedField(rowKey, matchingField?.id);
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

  formatDisplayValue(value: unknown, isPercentage: boolean): string {
    if (value == null || value === '') return '-';
    if (typeof value === 'number') {
      return isPercentage ? `${value}%` : value.toLocaleString();
    }
    return String(value);
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
