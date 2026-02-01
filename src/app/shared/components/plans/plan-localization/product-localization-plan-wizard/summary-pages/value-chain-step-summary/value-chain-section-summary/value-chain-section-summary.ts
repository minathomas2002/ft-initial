import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { EMaterialsFormControls } from 'src/app/shared/enums';
import { IFieldInformation, IPlanSummaryField, ValueChainRow } from 'src/app/shared/interfaces/plans.interface';
import { PlanStore } from 'src/app/shared/stores/plan/plan.store';
import { EInHouseProcuredType, ELocalizationStatusType } from 'src/app/shared/enums/plan.enum';
import { PlanSummaryFlied } from 'src/app/shared/components/plans/plan-summary-flied/plan-summary-flied';

const SECTION_TYPE_BY_KEY: Record<string, number> = {
  [EMaterialsFormControls.designEngineeringFormGroup]: 1,
  [EMaterialsFormControls.sourcingFormGroup]: 2,
  [EMaterialsFormControls.manufacturingFormGroup]: 3,
  [EMaterialsFormControls.assemblyTestingFormGroup]: 4,
  [EMaterialsFormControls.afterSalesFormGroup]: 5,
};

@Component({
  selector: 'app-value-chain-section-summary',
  imports: [PlanSummaryFlied],
  templateUrl: './value-chain-section-summary.html',
  styleUrl: './value-chain-section-summary.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ValueChainSectionSummaryComponent {
  private readonly planStore = inject(PlanStore);

  readonly sectionFormGroup = input.required<FormGroup>();
  readonly sectionSummaryFields = input.required<IFieldInformation[]>();
  readonly sectionTitle = input.required<string>();
  readonly sectionKey = input.required<string>();

  itemsArray = computed<FormArray>(() => {
    const section = this.sectionFormGroup().get('items');
    return section instanceof FormArray ? section : (null as unknown as FormArray);
  });

  rows = computed(() => {
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

      const getValueControl = (key: string): FormControl | null => {
        const c = item.get(key);
        if (c instanceof FormGroup && c.get(EMaterialsFormControls.value)) {
          return c.get(EMaterialsFormControls.value) as FormControl;
        }
        return null;
      };

      const cell = (inputKey: string, beforeVal: string | number | null | undefined) => {
        const ctrl = getValueControl(inputKey);
        const hasComment = summaryFields.some(f => f.inputKey === inputKey && (f.id === rowId || (f.id == null && rowId == null)));
        const hasError = ctrl ? (ctrl.invalid && ctrl.dirty) : false;
        const showDiff = ctrl ? (ctrl.dirty && this.planStore.wizardMode() === 'resubmit') : false;
        const value = ctrl?.value ?? '';
        return { value, beforeValue: beforeVal ?? '', hasError, hasComment, showDifference: showDiff };
      };

      return {
        rowId,
        expenseHeader: cell(EMaterialsFormControls.expenseHeader, beforeRow?.expenseHeader),
        inHouseOrProcured: cell(EMaterialsFormControls.inHouseOrProcured, beforeRow != null ? this.formatInHouseProcured(beforeRow.inHouseOrProcured) : null),
        costPercentage: cell(EMaterialsFormControls.costPercentage, beforeRow?.costPercent),
        year1: cell(EMaterialsFormControls.year1, beforeRow != null ? this.formatYearValue(beforeRow.year1) : null),
        year2: cell(EMaterialsFormControls.year2, beforeRow != null ? this.formatYearValue(beforeRow.year2) : null),
        year3: cell(EMaterialsFormControls.year3, beforeRow != null ? this.formatYearValue(beforeRow.year3) : null),
        year4: cell(EMaterialsFormControls.year4, beforeRow != null ? this.formatYearValue(beforeRow.year4) : null),
        year5: cell(EMaterialsFormControls.year5, beforeRow != null ? this.formatYearValue(beforeRow.year5) : null),
        year6: cell(EMaterialsFormControls.year6, beforeRow != null ? this.formatYearValue(beforeRow.year6) : null),
        year7: cell(EMaterialsFormControls.year7, beforeRow != null ? this.formatYearValue(beforeRow.year7) : null),
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
    cell: { beforeValue: string | number; hasError: boolean; hasComment: boolean; showDifference: boolean },
    currantValueDisplay: string
  ): IPlanSummaryField {
    return {
      label: '',
      beforeValue: String(cell.beforeValue ?? ''),
      currantValue: currantValueDisplay || '-',
      hasError: cell.hasError,
      hasComment: cell.hasComment,
      isResolved: false,
      showDifference: cell.showDifference,
    };
  }
}
