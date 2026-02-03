import { ChangeDetectionStrategy, Component, computed, inject, input, Signal } from '@angular/core';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { EMaterialsFormControls, ERoles } from 'src/app/shared/enums';
import { IFieldInformation, IPlanSummaryField, ValueChainRow } from 'src/app/shared/interfaces/plans.interface';
import { PlanStore } from 'src/app/shared/stores/plan/plan.store';
import { EInHouseProcuredType, ELocalizationStatusType } from 'src/app/shared/enums/plan.enum';
import { PlanSummaryFlied } from 'src/app/shared/components/plans/plan-summary-flied/plan-summary-flied';
import { RoleService } from 'src/app/shared/services/role/role-service';
import { I18nService } from 'src/app/shared/services/i18n';
import { TableModule } from 'primeng/table';
import { SummarySectionBaseClass } from 'src/app/shared/classes/plans/base-classes/summary-section-base.class';

const SECTION_TYPE_BY_KEY: Record<string, number> = {
  [EMaterialsFormControls.designEngineeringFormGroup]: 1,
  [EMaterialsFormControls.sourcingFormGroup]: 2,
  [EMaterialsFormControls.manufacturingFormGroup]: 3,
  [EMaterialsFormControls.assemblyTestingFormGroup]: 4,
  [EMaterialsFormControls.afterSalesFormGroup]: 5,
};

@Component({
  selector: 'app-value-chain-section-summary',
  imports: [PlanSummaryFlied, TableModule],
  templateUrl: './value-chain-section-summary.html',
  styleUrl: './value-chain-section-summary.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ValueChainSectionSummaryComponent extends SummarySectionBaseClass {
  readonly sectionKey = input.required<string>();
  readonly sectionTitle = input.required<string>();
  itemsArray = computed<FormArray>(() => {
    const section = this.sectionFormGroup().get('items');
    return section instanceof FormArray ? section : (null as unknown as FormArray);
  });

  rows = computed(() => {
    this.doRefresh()
    const items = this.itemsArray();
    if (!items || !items.controls.length) return [];
    const sectionKey = this.sectionKey();
    const sectionType = SECTION_TYPE_BY_KEY[sectionKey] ?? 0;
    const summaryFields = this.sectionSummaryFields();
    const valueChainRows = this.planStore.productPlanData()?.productPlan?.valueChainStep?.valueChainRows ?? [];

    return items.controls.map((control, index) => {
      const item = control as FormGroup;
      const rowId = item.get(EMaterialsFormControls.rowId)?.value ?? null;
      const sectionRows = valueChainRows.filter((r: ValueChainRow) => r.sectionType === sectionType);
      const beforeRow = (rowId ? sectionRows.find((r: ValueChainRow) => r.id === rowId) : sectionRows[index]) as ValueChainRow | undefined;


      const cell = (
        inputKey: string,
        beforeVal: string | number | null | undefined,
        formatCurrentForCompare: (v: unknown) => string
      ) => {
        const fieldGroup = item.get(inputKey);
        const ctrl = fieldGroup instanceof FormGroup ? (fieldGroup.get(EMaterialsFormControls.value) as FormControl) : null;
        const matchingField = summaryFields.find(f => f.inputKey === inputKey && (f.id === rowId || (f.id == null && rowId == null)));
        const hasComment = this.isFieldHasComment(inputKey, matchingField?.id);
        const hasCommentChecked = (fieldGroup instanceof FormGroup && fieldGroup.get(EMaterialsFormControls.hasComment)?.value) ?? false;
        const hasError = ctrl ? this.isFieldHasError(ctrl) : false;
        const value = ctrl?.value ?? '';
        const currentFormatted = formatCurrentForCompare(value);
        const beforeFormatted = beforeVal != null && beforeVal !== '' ? String(beforeVal) : '';
        const showDiff = this.shouldShowDifference(currentFormatted, beforeFormatted);
        const isResolved =
          hasComment &&
          !hasCommentChecked &&
          ['view', 'Review'].includes(this.planStore.wizardMode()) &&
          this.roleService.hasAnyRoleSignal([ERoles.EMPLOYEE])();
        return { value, beforeValue: beforeFormatted || '-', hasError, hasComment, showDifference: showDiff, isResolved };
      };

      const formatCostPercentForCompare = (v: unknown): string =>
        v != null && v !== '' ? `${v}%` : '-';

      return {
        rowId,
        expenseHeader: cell(EMaterialsFormControls.expenseHeader, beforeRow != null ? this.formatCellValue(beforeRow.expenseHeader) : null, v => this.formatCellValue(v)),
        inHouseOrProcured: cell(EMaterialsFormControls.inHouseOrProcured, beforeRow != null ? this.formatInHouseProcured(beforeRow.inHouseOrProcured) : null, v => this.formatInHouseProcured(v as number)),
        costPercentage: cell(EMaterialsFormControls.costPercentage, beforeRow?.costPercent != null ? `${beforeRow.costPercent}%` : null, formatCostPercentForCompare),
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

  formatInHouseProcured(value: number | null | undefined): string {
    if (value == null) return '';
    const key = EInHouseProcuredType[value as unknown as keyof typeof EInHouseProcuredType];
    return key != null ? String(key).replace(/([A-Z])/g, ' $1').trim() : String(value);
  }

  formatYearValue(value: number | null | undefined): string {
    if (value == null) return '';
    const key = ELocalizationStatusType[(value as unknown) as keyof typeof ELocalizationStatusType];
    return key != null ? String(key) : String(value);
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
    cell: { beforeValue: string | number; hasError: boolean; hasComment: boolean; showDifference: boolean; isResolved: boolean },
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
