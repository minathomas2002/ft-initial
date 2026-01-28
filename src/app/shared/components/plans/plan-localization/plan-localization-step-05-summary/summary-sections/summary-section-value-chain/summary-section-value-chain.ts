import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { FormArray, FormGroup } from '@angular/forms';
import { EMaterialsFormControls } from 'src/app/shared/enums';
import { IStepValidationErrors } from 'src/app/shared/services/plan/validation/product-plan-validation.service';
import { CommonModule } from '@angular/common';
import { ValueChainTable } from './value-chain-table/value-chain-table';
import { PlanStore } from 'src/app/shared/stores/plan/plan.store';
import { ValueChainSummaryComponent } from '../../../plan-localization-step-03-valueChain/value-chain-summary/value-chain-summary.component';
import { TranslatePipe } from 'src/app/shared/pipes';
import { SummarySectionHeader } from 'src/app/shared/components/plans/summary-section-header/summary-section-header';
import { IPageComment, IProductPlanResponse } from 'src/app/shared/interfaces/plans.interface';
import { findRowGroupByRowId, shouldHideSummaryCommentIcon } from 'src/app/shared/utils/summary-comment-icon.utils';

@Component({
  selector: 'app-summary-section-value-chain',
  imports: [SummarySectionHeader, CommonModule, ValueChainTable, ValueChainSummaryComponent, TranslatePipe],
  templateUrl: './summary-section-value-chain.html',
  styleUrl: './summary-section-value-chain.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SummarySectionValueChain {
  isViewMode = input<boolean>(false);
  formGroup = input.required<FormGroup>();
  pageComments = input<IPageComment[]>([]);
  correctedFieldIds = input<string[]>([]);
  commentTitle = input<string>('Comments');
  originalPlanResponse = input<IProductPlanResponse | null>(null);
  onEdit = output<void>();
  private readonly planStore = inject(PlanStore);
  inHouseOrProcuredOptions = this.planStore.inHouseProcuredOptions;
  localizationStatusOptions = this.planStore.localizationStatusOptions;

  // Expose enum to template
  readonly EMaterialsFormControls = EMaterialsFormControls;

  // Form group accessors
  designEngineeringFormGroup = computed(() => {
    return this.formGroup().get(EMaterialsFormControls.designEngineeringFormGroup) as FormGroup;
  });

  sourcingFormGroup = computed(() => {
    return this.formGroup().get(EMaterialsFormControls.sourcingFormGroup) as FormGroup;
  });

  manufacturingFormGroup = computed(() => {
    return this.formGroup().get(EMaterialsFormControls.manufacturingFormGroup) as FormGroup;
  });

  assemblyTestingFormGroup = computed(() => {
    return this.formGroup().get(EMaterialsFormControls.assemblyTestingFormGroup) as FormGroup;
  });

  afterSalesFormGroup = computed(() => {
    return this.formGroup().get(EMaterialsFormControls.afterSalesFormGroup) as FormGroup;
  });

  // Helper method to get FormArray items
  getSectionItems(sectionFormGroup: FormGroup | null): FormGroup[] {
    if (!sectionFormGroup) return [];
    const itemsArray = sectionFormGroup.get('items') as FormArray;
    if (!itemsArray) return [];
    return itemsArray.controls.filter(control => control instanceof FormGroup) as FormGroup[];
  }

  // Helper method to get value from nested form group
  getValue(formGroup: FormGroup, controlName: string): any {
    const control = formGroup.get(controlName);
    if (control instanceof FormGroup) {
      const valueControl = control.get(EMaterialsFormControls.value);
      return valueControl ? valueControl.value : control.value;
    }
    return control?.value ?? null;
  }

  // Helper to format value for display
  formatValue(value: any): string {
    if (value === null || value === undefined || value === '') {
      return '-';
    }
    if (typeof value === 'object' && value !== null) {
      if (value.name) {
        return value.name;
      }
      return JSON.stringify(value);
    }
    return String(value);
  }

  hasFieldError(formGroup: FormGroup, controlName: string): boolean {
    const control = formGroup.get(controlName);
    if (control instanceof FormGroup) {
      const valueControl = control.get(EMaterialsFormControls.value);
      return valueControl ? (valueControl.invalid && valueControl.dirty) : (control.invalid && control.dirty);
    }
    return (control?.invalid && control?.dirty) ?? false;
  }

  onEditClick(): void {
    this.onEdit.emit();
  }

  // Computed arrays for each section
  designEngineeringItems = computed(() => this.getSectionItems(this.designEngineeringFormGroup()));
  sourcingItems = computed(() => this.getSectionItems(this.sourcingFormGroup()));
  manufacturingItems = computed(() => this.getSectionItems(this.manufacturingFormGroup()));
  assemblyTestingItems = computed(() => this.getSectionItems(this.assemblyTestingFormGroup()));
  afterSalesItems = computed(() => this.getSectionItems(this.afterSalesFormGroup()));

  // Years array for columns
  readonly years = [1, 2, 3, 4, 5, 6, 7];

  // Helper to get year value from item
  getYearValue(item: FormGroup, year: number): any {
    const yearControlName = `year${year}`;
    // Map year number to enum value
    const yearControlMap: Record<number, string> = {
      1: EMaterialsFormControls.year1,
      2: EMaterialsFormControls.year2,
      3: EMaterialsFormControls.year3,
      4: EMaterialsFormControls.year4,
      5: EMaterialsFormControls.year5,
      6: EMaterialsFormControls.year6,
      7: EMaterialsFormControls.year7,
    };
    return this.getLocalizationStatusName(this.getValue(item, yearControlMap[year]));
  }

  getInHouseOrProcuredName(value: string): string {
    return this.inHouseOrProcuredOptions().find(option => option.id === value)?.name ?? '-';
  }
  getLocalizationStatusName(value: string): string {
    return this.localizationStatusOptions().find(option => option.id === value)?.name ?? '-';
  }

  getYearHasError(item: FormGroup, year: number): any {
    const yearControlName = `year${year}`;
    // Map year number to enum value
    const yearControlMap: Record<number, string> = {
      1: EMaterialsFormControls.year1,
      2: EMaterialsFormControls.year2,
      3: EMaterialsFormControls.year3,
      4: EMaterialsFormControls.year4,
      5: EMaterialsFormControls.year5,
      6: EMaterialsFormControls.year6,
      7: EMaterialsFormControls.year7,
    };
    return this.hasFieldError(item, yearControlMap[year]);
  }

  // Helper method to map form group name to section name used in comments
  private mapFormGroupToSection(formGroupName: string): string {
    const mapping: Record<string, string> = {
      'designEngineeringFormGroup': 'designEngineering',
      'sourcingFormGroup': 'sourcing',
      'manufacturingFormGroup': 'manufacturing',
      'assemblyTestingFormGroup': 'assemblyTesting',
      'afterSalesFormGroup': 'afterSales',
    };
    return mapping[formGroupName] || formGroupName;
  }

  // Helper method to check if a field has comments
  hasFieldComment(fieldKey: string, section: string, rowId?: string): boolean {
    const sectionName = this.mapFormGroupToSection(section);
    const hasComment = this.pageComments().some(comment =>
      comment.fields?.some(field =>
        field.section === sectionName &&
        field.inputKey === fieldKey &&
        (rowId === undefined || field.id === rowId)
      )
    );

    if (!hasComment) return false;

    // If the field is already resolved/corrected, hide the orange warning icon.
    // if (this.isFieldResolved(fieldKey, section, rowId)) {
    //   return false;
    // }

    const control = this.getControlForDirtyCheck(fieldKey, section, rowId);
    if (shouldHideSummaryCommentIcon(this.planStore.wizardMode(), control, EMaterialsFormControls.value)) {
      return false;
    }

    return true;
  }

  private isFieldResolved(fieldKey: string, section: string, rowId?: string): boolean {
    if (this.correctedFieldIds().length === 0) return false;
    const sectionName = this.mapFormGroupToSection(section);

    return this.pageComments().some((comment) =>
      comment.fields?.some(
        (field) =>
          field.section === sectionName &&
          field.inputKey === fieldKey &&
          !!field.id &&
          this.correctedFieldIds().includes(field.id) &&
          (rowId === undefined || field.id === rowId)
      )
    );
  }

  private getControlForDirtyCheck(fieldKey: string, section: string, rowId?: string): any {
    const sectionFormGroup = this.getSectionFormGroupByName(section);
    const itemsArray = sectionFormGroup?.get('items') as FormArray | null;
    const rowGroup = findRowGroupByRowId(itemsArray, rowId, 'rowId');
    return rowGroup?.get(fieldKey) ?? null;
  }

  private getSectionFormGroupByName(section: string): FormGroup | null {
    switch (section) {
      case 'designEngineeringFormGroup':
        return this.designEngineeringFormGroup();
      case 'sourcingFormGroup':
        return this.sourcingFormGroup();
      case 'manufacturingFormGroup':
        return this.manufacturingFormGroup();
      case 'assemblyTestingFormGroup':
        return this.assemblyTestingFormGroup();
      case 'afterSalesFormGroup':
        return this.afterSalesFormGroup();
      default:
        return null;
    }
  }

  // Helper to get row ID from form group
  getRowId(item: FormGroup): string | undefined {
    return item.get('rowId')?.value;
  }

  // Helper method to get before value from original plan response
  getBeforeValue(fieldKey: string, sectionName: string, rowId?: string): any {
    const originalPlan = this.originalPlanResponse();
    if (!originalPlan?.productPlan?.valueChainStep?.valueChainRows) return null;

    // Map form group name to section type
    const sectionMap: Record<string, number> = {
      'designEngineeringFormGroup': 1,
      'sourcingFormGroup': 2,
      'manufacturingFormGroup': 3,
      'assemblyTestingFormGroup': 4,
      'afterSalesFormGroup': 5,
    };

    const sectionType = sectionMap[sectionName];
    if (sectionType === undefined) return null;

    // Find matching row by sectionType and rowId
    const rows = originalPlan.productPlan.valueChainStep.valueChainRows.filter(
      row => row.sectionType === sectionType && (rowId === undefined || String(row.id) === String(rowId))
    );

    if (rows.length === 0) return null;
    const row = rows[0]; // Get first matching row

    // Map field keys to row properties
    switch (fieldKey) {
      case 'expenseHeader':
        return row.expenseHeader ?? null;
      case 'inHouseOrProcured':
        return row.inHouseOrProcured != null ? this.getInHouseOrProcuredName(String(row.inHouseOrProcured)) : null;
      case 'costPercentage':
        return row.costPercent ?? null;
      case 'year1':
        return row.year1 != null ? this.getLocalizationStatusName(String(row.year1)) : null;
      case 'year2':
        return row.year2 != null ? this.getLocalizationStatusName(String(row.year2)) : null;
      case 'year3':
        return row.year3 != null ? this.getLocalizationStatusName(String(row.year3)) : null;
      case 'year4':
        return row.year4 != null ? this.getLocalizationStatusName(String(row.year4)) : null;
      case 'year5':
        return row.year5 != null ? this.getLocalizationStatusName(String(row.year5)) : null;
      case 'year6':
        return row.year6 != null ? this.getLocalizationStatusName(String(row.year6)) : null;
      case 'year7':
        return row.year7 != null ? this.getLocalizationStatusName(String(row.year7)) : null;
      default:
        return null;
    }
  }

  // Helper method to check if field should show diff
  shouldShowDiff(fieldKey: string, sectionName: string, rowId?: string, currentValue?: any): boolean {
    // Only show diff in resubmit mode
    if (this.planStore.wizardMode() !== 'resubmit') return false;
    // Only show diff if field has a comment
    if (!this.hasFieldComment(fieldKey, sectionName, rowId)) return false;

    const beforeValue = this.getBeforeValue(fieldKey, sectionName, rowId);
    const afterValue = currentValue;

    // Compare values
    if (beforeValue === afterValue) return false;
    if (beforeValue === null || beforeValue === undefined || beforeValue === '') {
      return afterValue !== null && afterValue !== undefined && afterValue !== '';
    }
    if (afterValue === null || afterValue === undefined || afterValue === '') {
      return true;
    }

    // For objects, compare by JSON stringify
    if (typeof beforeValue === 'object' && typeof afterValue === 'object') {
      return JSON.stringify(beforeValue) !== JSON.stringify(afterValue);
    }

    return String(beforeValue) !== String(afterValue);
  }

  // Helper to create table data structure
  getTableData(items: FormGroup[], sectionName: string): any[] {
    return items.map((item, index) => {
      const rowId = this.getRowId(item);
      const expenseHeaderValue = this.getValue(item, EMaterialsFormControls.expenseHeader);
      const inHouseOrProcuredValue = this.getInHouseOrProcuredName(this.getValue(item, EMaterialsFormControls.inHouseOrProcured));
      const costPercentageValue = this.getValue(item, EMaterialsFormControls.costPercentage);

      // Only get beforeValue if field has a comment (to avoid unnecessary lookups)
      const expenseHeaderHasComment = this.hasFieldComment('expenseHeader', sectionName, rowId);
      const inHouseOrProcuredHasComment = this.hasFieldComment('inHouseOrProcured', sectionName, rowId);
      const costPercentageHasComment = this.hasFieldComment('costPercentage', sectionName, rowId);

      const row: any = {
        expenseHeader: expenseHeaderValue,
        expenseHeaderBeforeValue: expenseHeaderHasComment ? this.getBeforeValue('expenseHeader', sectionName, rowId) : null,
        expenseHeaderAfterValue: expenseHeaderValue,
        expenseHeaderShowDiff: this.shouldShowDiff('expenseHeader', sectionName, rowId, expenseHeaderValue),
        expenseHeaderHasError: this.hasFieldError(item, EMaterialsFormControls.expenseHeader),
        expenseHeaderHasComment: expenseHeaderHasComment,
        inHouseOrProcured: inHouseOrProcuredValue,
        inHouseOrProcuredBeforeValue: inHouseOrProcuredHasComment ? this.getBeforeValue('inHouseOrProcured', sectionName, rowId) : null,
        inHouseOrProcuredAfterValue: inHouseOrProcuredValue,
        inHouseOrProcuredShowDiff: this.shouldShowDiff('inHouseOrProcured', sectionName, rowId, inHouseOrProcuredValue),
        inHouseOrProcuredHasError: this.hasFieldError(item, EMaterialsFormControls.inHouseOrProcured),
        inHouseOrProcuredHasComment: inHouseOrProcuredHasComment,
        costPercentage: costPercentageValue,
        costPercentageBeforeValue: costPercentageHasComment ? this.getBeforeValue('costPercentage', sectionName, rowId) : null,
        costPercentageAfterValue: costPercentageValue,
        costPercentageShowDiff: this.shouldShowDiff('costPercentage', sectionName, rowId, costPercentageValue),
        costPercentageHasError: this.hasFieldError(item, EMaterialsFormControls.costPercentage),
        costPercentageHasComment: costPercentageHasComment,
      };

      // Add all 7 years with error checking and comment checking
      this.years.forEach(year => {
        const yearControlMap: Record<number, string> = {
          1: EMaterialsFormControls.year1,
          2: EMaterialsFormControls.year2,
          3: EMaterialsFormControls.year3,
          4: EMaterialsFormControls.year4,
          5: EMaterialsFormControls.year5,
          6: EMaterialsFormControls.year6,
          7: EMaterialsFormControls.year7,
        };
        const yearKey = `year${year}`;
        const yearValue = this.getYearValue(item, year);
        const yearHasComment = this.hasFieldComment(yearKey, sectionName, rowId);
        row[yearKey] = yearValue;
        row[`${yearKey}BeforeValue`] = yearHasComment ? this.getBeforeValue(yearKey, sectionName, rowId) : null;
        row[`${yearKey}AfterValue`] = yearValue;
        row[`${yearKey}ShowDiff`] = this.shouldShowDiff(yearKey, sectionName, rowId, yearValue);
        row[`${yearKey}HasError`] = this.getYearHasError(item, year);
        row[`${yearKey}HasComment`] = yearHasComment;
      });

      return row;
    });
  }

  // Computed table data for each section
  designEngineeringTableData = computed(() =>
    this.getTableData(this.designEngineeringItems(), 'designEngineeringFormGroup')
  );
  sourcingTableData = computed(() =>
    this.getTableData(this.sourcingItems(), 'sourcingFormGroup')
  );
  manufacturingTableData = computed(() =>
    this.getTableData(this.manufacturingItems(), 'manufacturingFormGroup')
  );
  assemblyTestingTableData = computed(() =>
    this.getTableData(this.assemblyTestingItems(), 'assemblyTestingFormGroup')
  );
  afterSalesTableData = computed(() =>
    this.getTableData(this.afterSalesItems(), 'afterSalesFormGroup')
  );

}
