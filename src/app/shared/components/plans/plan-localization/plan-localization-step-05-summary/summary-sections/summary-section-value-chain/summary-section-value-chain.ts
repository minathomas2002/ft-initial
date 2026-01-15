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
import { SummaryComments } from 'src/app/shared/components/plans/summary-comments/summary-comments';
import { IPageComment } from 'src/app/shared/interfaces/plans.interface';

@Component({
  selector: 'app-summary-section-value-chain',
  imports: [SummarySectionHeader, CommonModule, ValueChainTable, ValueChainSummaryComponent, SummaryComments, TranslatePipe],
  templateUrl: './summary-section-value-chain.html',
  styleUrl: './summary-section-value-chain.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SummarySectionValueChain {
  isViewMode = input<boolean>(false);
  formGroup = input.required<FormGroup>();
  pageComments = input<IPageComment[]>([]);
  investorComments = input<IPageComment[]>([]);
  correctedFieldIds = input<string[]>([]);
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
    return this.pageComments().some(comment =>
      comment.fields?.some(field =>
        field.section === sectionName &&
        field.inputKey === fieldKey &&
        (rowId === undefined || field.id === rowId)
      )
    );
  }

  // Helper to get row ID from form group
  getRowId(item: FormGroup): string | undefined {
    return item.get('rowId')?.value;
  }

  // Helper to create table data structure
  getTableData(items: FormGroup[], sectionName: string): any[] {
    return items.map((item, index) => {
      const rowId = this.getRowId(item);
      const row: any = {
        expenseHeader: this.getValue(item, EMaterialsFormControls.expenseHeader),
        inHouseOrProcured: this.getInHouseOrProcuredName(this.getValue(item, EMaterialsFormControls.inHouseOrProcured)),
        costPercentage: this.getValue(item, EMaterialsFormControls.costPercentage),
        expenseHeaderHasError: this.hasFieldError(item, EMaterialsFormControls.expenseHeader),
        expenseHeaderHasComment: this.hasFieldComment('expenseHeader', sectionName, rowId),
        inHouseOrProcuredHasError: this.hasFieldError(item, EMaterialsFormControls.inHouseOrProcured),
        inHouseOrProcuredHasComment: this.hasFieldComment('inHouseOrProcured', sectionName, rowId),
        costPercentageHasError: this.hasFieldError(item, EMaterialsFormControls.costPercentage),
        costPercentageHasComment: this.hasFieldComment('costPercentage', sectionName, rowId),
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
        row[yearKey] = this.getYearValue(item, year);
        row[`${yearKey}HasError`] = this.getYearHasError(item, year);
        row[`${yearKey}HasComment`] = this.hasFieldComment(yearKey, sectionName, rowId);
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
