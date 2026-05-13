import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { createValueChainFieldKey } from 'src/app/shared/utils/value-chain-field-helpers';
import { EMaterialsFormControls, ERoles } from 'src/app/shared/enums';
import { IPlanSummaryField, IProductPlanResponse, ValueChainRow } from 'src/app/shared/interfaces/plans.interface';
import { PlanStore } from 'src/app/shared/stores/plan/plan.store';
import { EInHouseProcuredType, ELocalizationStatusType } from 'src/app/shared/enums/plan.enum';
import { PlanSummaryFlied } from 'src/app/shared/components/plans/plan-summary-flied/plan-summary-flied';
import { RoleService } from 'src/app/shared/services/role/role-service';
import { I18nService } from 'src/app/shared/services/i18n';
import { TableModule } from 'primeng/table';
import { SummarySectionBaseClass } from 'src/app/shared/classes/plans/base-classes/summary-section-base.class';
import { EInternalUserPlanStatus } from 'src/app/shared/interfaces';
import { TranslatePipe } from 'src/app/shared/pipes/translate.pipe';
import { FormArray, FormControl, FormGroup } from '@angular/forms';

const SECTION_TYPE_BY_KEY: Record<string, number> = {
  [EMaterialsFormControls.designEngineeringFormGroup]: 1,
  [EMaterialsFormControls.sourcingFormGroup]: 2,
  [EMaterialsFormControls.manufacturingFormGroup]: 3,
  [EMaterialsFormControls.assemblyTestingFormGroup]: 4,
  [EMaterialsFormControls.afterSalesFormGroup]: 5,
};

/** Cell view-model for current rows (matches prior `cell()` return shape). */
export type VcSummaryCellVm = {
  value: unknown;
  beforeValue: string | number;
  hasError: boolean;
  hasComment: boolean;
  showDifference: boolean;
  isResolved: boolean;
  shouldHighlightTd: boolean;
};

export type VcSummaryBodyRow =
  | {
      kind: 'current';
      rowIndex: number;
      rowId: string | null;
      isAddedRow: boolean;
      isInHouse: boolean;
      expenseHeader: VcSummaryCellVm;
      inHouseOrProcured: VcSummaryCellVm;
      costPercentage: VcSummaryCellVm;
      year1: VcSummaryCellVm;
      year2: VcSummaryCellVm;
      year3: VcSummaryCellVm;
      year4: VcSummaryCellVm;
      year5: VcSummaryCellVm;
      year6: VcSummaryCellVm;
      year7: VcSummaryCellVm;
    }
  | { kind: 'removed'; beforeRow: ValueChainRow };

@Component({
  selector: 'app-value-chain-section-summary',
  imports: [PlanSummaryFlied, TableModule, TranslatePipe],
  templateUrl: './value-chain-section-summary.html',
  styleUrl: './value-chain-section-summary.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ValueChainSectionSummaryComponent extends SummarySectionBaseClass {
  readonly sectionKey = input.required<string>();
  /** Section key used for unique field keys (e.g. designEngineering, sourcing). Passed from value-chain-step-summary. */
  readonly sectionKeyForFields = input<string>();
  readonly sectionTitle = input.required<string>();
  /** Baseline rows (e.g. investor submission) for add/remove/field diff; falls back to current plan data when omitted. */
  readonly originalPlanResponse = input<IProductPlanResponse | null>(null);

  /** Green (added) / red (removed) row backgrounds only during resubmit. */
  readonly applyValueChainRowTint = computed(() => this.planStore.wizardMode() === 'resubmit');

  itemsArray = computed<FormArray>(() => {
    const section = this.sectionFormGroup().get('items');
    return section instanceof FormArray ? section : (null as unknown as FormArray);
  });

  rows = computed<VcSummaryBodyRow[]>(() => {
    this.i18nService.currentLanguage();
    this.doRefresh();
    const items = this.itemsArray();
    if (!items || !items.controls.length) return [];
    const sectionKey = this.sectionKey();
    const sectionType = SECTION_TYPE_BY_KEY[sectionKey] ?? 0;
    const summaryFields = this.sectionSummaryFields();
    const sectionForFields = this.sectionKeyForFields() ?? this.sectionKey().replace('FormGroup', '');

    // Prefer wizard-provided load snapshot so removed rows still exist in baseline after the user edits the form.
    const baselinePp =
      this.originalPlanResponse()?.productPlan ??
      this.planStore.productPlanData()?.productPlan ??
      null;
    const baselineRows: ValueChainRow[] = (
      baselinePp?.valueChainStep?.valueChainRows ??
      (baselinePp as { valueChainRows?: ValueChainRow[] } | null)?.valueChainRows ??
      []
    ).filter((r: ValueChainRow) => r.sectionType === sectionType);

    const baselineIds = new Set(
      baselineRows.map(r => r.id).filter(id => id != null && String(id).trim() !== '').map(id => String(id))
    );

    const currentIds = new Set<string>();
    items.controls.forEach(ctrl => {
      const id = (ctrl as FormGroup).get(EMaterialsFormControls.rowId)?.value;
      if (id != null && String(id).trim() !== '') {
        currentIds.add(String(id));
      }
    });

    const removedRows: VcSummaryBodyRow[] = baselineRows
      .filter(r => r.id != null && String(r.id).trim() !== '' && !currentIds.has(String(r.id)))
      .map(beforeRow => ({ kind: 'removed' as const, beforeRow }));

    const currentRows: VcSummaryBodyRow[] = items.controls.map((control, index) => {
      const item = control as FormGroup;
      const rowId = (item.get(EMaterialsFormControls.rowId)?.value ?? null) as string | null;
      const rowIdStr = rowId != null && String(rowId).trim() !== '' ? String(rowId) : '';
      const beforeRow = rowIdStr ? baselineRows.find((r: ValueChainRow) => String(r.id) === rowIdStr) : undefined;
      const isAddedRow = !rowIdStr || !baselineIds.has(rowIdStr);

      const cell = (
        controlName: string,
        beforeVal: string | number | null | undefined,
        formatCurrentForCompare: (v: unknown) => string
      ): VcSummaryCellVm => {
        const fieldKey = createValueChainFieldKey(sectionForFields, controlName, index);
        const fieldGroup = item.get(controlName);
        const ctrl = fieldGroup instanceof FormGroup ? (fieldGroup.get(EMaterialsFormControls.value) as FormControl) : null;
        const matchingField = summaryFields.find(f => f.inputKey === fieldKey && (f.id === rowId || (f.id == null && rowId == null)));
        const hasComment = this.shouldShowCommentIcon(fieldKey, matchingField?.id ?? null);
        const hasCommentChecked = (fieldGroup instanceof FormGroup && fieldGroup.get(EMaterialsFormControls.hasComment)?.value) ?? false;
        const hasError = ctrl ? this.isFieldHasError(ctrl) : false;
        const value = ctrl?.value ?? '';
        const currentFormatted = formatCurrentForCompare(value);
        const beforeFormatted = beforeVal != null && beforeVal !== '' ? String(beforeVal) : '';
        const showDiff = !isAddedRow && this.shouldShowDifference(currentFormatted, beforeFormatted);
        const isResolved =
          hasComment &&
          !hasCommentChecked &&
          this.planStore.planStatus() === EInternalUserPlanStatus.UNDER_REVIEW &&
          ['view', 'Review'].includes(this.planStore.wizardMode()) &&
          this.roleService.hasAnyRoleSignal([ERoles.EMPLOYEE])();
        const shouldHighlightTd =
          this.planStore.wizardMode() === 'Review' && hasComment && !hasCommentChecked;
        return { value, beforeValue: beforeFormatted || '-', hasError, hasComment, showDifference: showDiff, isResolved, shouldHighlightTd };
      };

      const inHouseVal = item.get(EMaterialsFormControls.inHouseOrProcured);
      const inHouseValueCtrl = inHouseVal instanceof FormGroup ? inHouseVal.get(EMaterialsFormControls.value) : null;
      const inHouseValRaw = inHouseValueCtrl?.value;
      const isInHouse = inHouseValRaw === '1' || inHouseValRaw === EInHouseProcuredType.InHouse;
      return {
        kind: 'current' as const,
        rowIndex: index,
        rowId,
        isAddedRow,
        isInHouse,
        expenseHeader: cell(EMaterialsFormControls.expenseHeader, this.formatCellValue(beforeRow?.expenseHeader), v => this.formatCellValue(v)),
        inHouseOrProcured: cell(
          EMaterialsFormControls.inHouseOrProcured,
          beforeRow != null ? this.formatInHouseProcured(beforeRow.inHouseOrProcured) : null,
          v => this.formatInHouseProcured(v as number)
        ),
        costPercentage: cell(EMaterialsFormControls.costPercentage, this.formatCostPercent(beforeRow?.costPercent ?? ''), v => this.formatCostPercent(v)),
        year1: cell(EMaterialsFormControls.year1, beforeRow != null ? this.formatYearValue(beforeRow.year1) : null, v => this.formatYearValue(v as number)),
        year2: cell(EMaterialsFormControls.year2, beforeRow != null ? this.formatYearValue(beforeRow.year2) : null, v => this.formatYearValue(v as number)),
        year3: cell(EMaterialsFormControls.year3, beforeRow != null ? this.formatYearValue(beforeRow.year3) : null, v => this.formatYearValue(v as number)),
        year4: cell(EMaterialsFormControls.year4, beforeRow != null ? this.formatYearValue(beforeRow.year4) : null, v => this.formatYearValue(v as number)),
        year5: cell(EMaterialsFormControls.year5, beforeRow != null ? this.formatYearValue(beforeRow.year5) : null, v => this.formatYearValue(v as number)),
        year6: cell(EMaterialsFormControls.year6, beforeRow != null ? this.formatYearValue(beforeRow.year6) : null, v => this.formatYearValue(v as number)),
        year7: cell(EMaterialsFormControls.year7, beforeRow != null ? this.formatYearValue(beforeRow.year7) : null, v => this.formatYearValue(v as number)),
      };
    });

    return [...currentRows, ...removedRows];
  });

  formatInHouseProcured(value: number | string | null | undefined): string {
    if (value == null || value === '') return '';

    const normalizedValue =
      typeof value === 'string' && /^\d+$/.test(value.trim()) ? Number(value) : value;

    if (normalizedValue === EInHouseProcuredType.InHouse) {
      return this.i18nService.translate('plans.options.inHouse');
    }

    if (normalizedValue === EInHouseProcuredType.Procured) {
      return this.i18nService.translate('plans.options.procured');
    }

    return String(value);
  }

  formatYearColumnLabel(year: number): string {
    const yearLabel = this.i18nService.translate('plans.summary.year');
    const padded = year <= 9 ? `0${year}` : String(year);
    return `${yearLabel} - ${padded}`;
  }

  formatYearValue(value: number | null | undefined): string {
    if (value == null) return '';
    const key = ELocalizationStatusType[(value as unknown) as keyof typeof ELocalizationStatusType];
    return key != null ? String(key) : String(value);
  }

  formatCostPercent(value: unknown): string {
    return value != null && String(value).trim() !== '' ? `${String(value).trim()}%` : '-';
  }

  formatCellValue(value: unknown): string {
    if (value == null || value === '') return '-';
    if (typeof value === 'number') {
      const key = ELocalizationStatusType[value as unknown as keyof typeof ELocalizationStatusType];
      if (key != null) return String(key);
      const key2 = EInHouseProcuredType[value as unknown as keyof typeof EInHouseProcuredType];
      if (key2 != null) return String(key2).replace(/([A-Z])/g, ' $1').trim();
    }
    return String(value);
  }

  /** Maps a table cell to IPlanSummaryField for use with app-plan-summary-flied */
  getSummaryField(
    cell: {
      beforeValue: string | number;
      hasError: boolean;
      hasComment: boolean;
      showDifference: boolean;
      isResolved: boolean;
      shouldHighlightTd?: boolean;
    },
    currantValueDisplay: string
  ): IPlanSummaryField {
    return {
      label: '',
      beforeValue: String(cell.beforeValue ?? ''),
      currantValue: currantValueDisplay || '-',
      hasError: cell.hasError,
      hasComment: cell.hasComment,
      isResolved: cell.isResolved,
      showDifference: cell.showDifference,
    };
  }

  /** Single-value display for removed rows (strikethrough comes from `<tr>`). */
  getRemovedRowSummaryField(display: string): IPlanSummaryField {
    const text = display || '-';
    return {
      label: '',
      beforeValue: text,
      currantValue: text,
      hasError: false,
      hasComment: false,
      isResolved: false,
      showDifference: false,
    };
  }

  removedRowYearValue(beforeRow: ValueChainRow, year: number): string {
    const key = `year${year}` as keyof ValueChainRow;
    const v = beforeRow[key] as number | null | undefined;
    return this.formatYearValue(v);
  }
}
