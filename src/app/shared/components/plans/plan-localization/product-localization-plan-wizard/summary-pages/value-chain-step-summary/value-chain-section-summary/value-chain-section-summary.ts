import { ChangeDetectionStrategy, Component, computed, inject, input, Signal } from '@angular/core';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { createValueChainFieldKey } from 'src/app/shared/utils/value-chain-field-helpers';
import { EMaterialsFormControls, ERoles } from 'src/app/shared/enums';
import { IFieldInformation, IPlanSummaryField, ValueChainRow } from 'src/app/shared/interfaces/plans.interface';
import { PlanStore } from 'src/app/shared/stores/plan/plan.store';
import { EInHouseProcuredType, ELocalizationStatusType } from 'src/app/shared/enums/plan.enum';
import { PlanSummaryFlied } from 'src/app/shared/components/plans/plan-summary-flied/plan-summary-flied';
import { RoleService } from 'src/app/shared/services/role/role-service';
import { I18nService } from 'src/app/shared/services/i18n';
import { TableModule } from 'primeng/table';
import { SummarySectionBaseClass } from 'src/app/shared/classes/plans/base-classes/summary-section-base.class';
import { EInternalUserPlanStatus } from 'src/app/shared/interfaces';
import { TranslatePipe } from 'src/app/shared/pipes/translate.pipe';

const SECTION_TYPE_BY_KEY: Record<string, number> = {
  [EMaterialsFormControls.designEngineeringFormGroup]: 1,
  [EMaterialsFormControls.sourcingFormGroup]: 2,
  [EMaterialsFormControls.manufacturingFormGroup]: 3,
  [EMaterialsFormControls.assemblyTestingFormGroup]: 4,
  [EMaterialsFormControls.afterSalesFormGroup]: 5,
};

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
  itemsArray = computed<FormArray>(() => {
    const section = this.sectionFormGroup().get('items');
    return section instanceof FormArray ? section : (null as unknown as FormArray);
  });

  rows = computed(() => {
    this.i18nService.currentLanguage();
    this.doRefresh()
    const items = this.itemsArray();
    if (!items || !items.controls.length) return [];
    const sectionKey = this.sectionKey();
    const sectionType = SECTION_TYPE_BY_KEY[sectionKey] ?? 0;
    const summaryFields = this.sectionSummaryFields();
    const pp = this.planStore.productPlanData()?.productPlan;
    const valueChainRows = pp?.valueChainStep?.valueChainRows ?? (pp as any)?.valueChainRows ?? [];

    return items.controls.map((control, index) => {
      const item = control as FormGroup;
      const rowId = item.get(EMaterialsFormControls.rowId)?.value ?? null;
      const sectionRows = valueChainRows.filter((r: ValueChainRow) => r.sectionType === sectionType);
      const beforeRow = (rowId ? sectionRows.find((r: ValueChainRow) => r.id === rowId) : sectionRows[index]) as ValueChainRow | undefined;
      const sectionForFields = this.sectionKeyForFields() ?? this.sectionKey().replace('FormGroup', '');

      const cell = (
        controlName: string,
        beforeVal: string | number | null | undefined,
        formatCurrentForCompare: (v: unknown) => string
      ) => {
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
        const showDiff = this.shouldShowDifference(currentFormatted, beforeFormatted);
        const isResolved =
          hasComment &&
          !hasCommentChecked &&
          this.planStore.planStatus() === EInternalUserPlanStatus.UNDER_REVIEW &&
          ['view', 'Review'].includes(this.planStore.wizardMode()) &&
          this.roleService.hasAnyRoleSignal([ERoles.EMPLOYEE])();
        /** TD orange background: Review mode only, corrected field (hasComment), checkbox not checked (!hasCommentChecked) */
        const shouldHighlightTd =
          this.planStore.wizardMode() === 'Review' && hasComment && !hasCommentChecked;
        return { value, beforeValue: beforeFormatted || '-', hasError, hasComment, showDifference: showDiff, isResolved, shouldHighlightTd };
      };

      const inHouseVal = item.get(EMaterialsFormControls.inHouseOrProcured);
      const inHouseValueCtrl = inHouseVal instanceof FormGroup ? inHouseVal.get(EMaterialsFormControls.value) : null;
      const inHouseValRaw = inHouseValueCtrl?.value;
      const isInHouse = inHouseValRaw === '1' || inHouseValRaw === EInHouseProcuredType.InHouse;
      return {
        rowId,
        isInHouse,
        expenseHeader: cell(EMaterialsFormControls.expenseHeader, this.formatCellValue(beforeRow?.expenseHeader), v => this.formatCellValue(v)),
        inHouseOrProcured: cell(EMaterialsFormControls.inHouseOrProcured, beforeRow != null ? this.formatInHouseProcured(beforeRow.inHouseOrProcured) : null, v => this.formatInHouseProcured(v as number)),
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
    cell: { beforeValue: string | number; hasError: boolean; hasComment: boolean; showDifference: boolean; isResolved: boolean; shouldHighlightTd?: boolean },
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
}
