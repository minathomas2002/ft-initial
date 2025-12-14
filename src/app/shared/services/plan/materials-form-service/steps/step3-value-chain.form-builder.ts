import { FormArray, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { EMaterialsFormControls } from 'src/app/shared/enums';

export class Step3ValueChainFormBuilder {
  constructor(
    private readonly fb: FormBuilder
  ) { }

  /**
   * Create a FormGroup for a single value chain item (row in the table)
   * @param includeYears - Whether to include year columns (Year 1-7). Manufacturing section doesn't have years.
   */
  createValueChainItemFormGroup(includeYears: boolean = true): FormGroup {
    const itemGroup: any = {
      [EMaterialsFormControls.expenseHeader]: this.fb.group({
        [EMaterialsFormControls.hasComment]: [false],
        [EMaterialsFormControls.value]: ['', [Validators.required, Validators.maxLength(100)]],
      }),
      [EMaterialsFormControls.inHouseOrProcured]: this.fb.group({
        [EMaterialsFormControls.hasComment]: [false],
        [EMaterialsFormControls.value]: [null, [Validators.required]],
      }),
      [EMaterialsFormControls.costPercentage]: this.fb.group({
        [EMaterialsFormControls.hasComment]: [false],
        [EMaterialsFormControls.value]: [null, [Validators.required, Validators.min(0), Validators.max(100)]],
      }),
    };

    // Add year columns only if includeYears is true
    if (includeYears) {
      const yearControls = [
        EMaterialsFormControls.year1,
        EMaterialsFormControls.year2,
        EMaterialsFormControls.year3,
        EMaterialsFormControls.year4,
        EMaterialsFormControls.year5,
        EMaterialsFormControls.year6,
        EMaterialsFormControls.year7,
      ];

      yearControls.forEach(yearControl => {
        itemGroup[yearControl] = this.fb.group({
          [EMaterialsFormControls.hasComment]: [false],
          [EMaterialsFormControls.value]: [null],
        });
      });
    }

    return this.fb.group(itemGroup);
  }

  /**
   * Build FormArray for a specific section
   * @param includeYears - Whether to include year columns
   */
  buildSectionFormArray(includeYears: boolean = true): FormArray {
    return this.fb.array(
      [this.createValueChainItemFormGroup(includeYears)],
      [this.costPercentageArrayValidator()]
    );
  }

  /**
   * Build Design & Engineering section
   */
  buildDesignEngineeringFormGroup(): FormGroup {
    return this.fb.group({
      items: this.buildSectionFormArray(true), // Includes years
    });
  }

  /**
   * Build Sourcing section
   */
  buildSourcingFormGroup(): FormGroup {
    return this.fb.group({
      items: this.buildSectionFormArray(true), // Includes years
    });
  }

  /**
   * Build Manufacturing section (NO years)
   */
  buildManufacturingFormGroup(): FormGroup {
    return this.fb.group({
      items: this.buildSectionFormArray(false), // No years
    });
  }

  /**
   * Build Assembly & Testing section
   */
  buildAssemblyTestingFormGroup(): FormGroup {
    return this.fb.group({
      items: this.buildSectionFormArray(true), // Includes years
    });
  }

  /**
   * Build After-Sales section
   */
  buildAfterSalesFormGroup(): FormGroup {
    return this.fb.group({
      items: this.buildSectionFormArray(true), // Includes years
    });
  }

  /**
   * Build Step 3 main form group
   */
  buildStep3FormGroup(): FormGroup {
    return this.fb.group({
      [EMaterialsFormControls.designEngineeringFormGroup]: this.buildDesignEngineeringFormGroup(),
      [EMaterialsFormControls.sourcingFormGroup]: this.buildSourcingFormGroup(),
      [EMaterialsFormControls.manufacturingFormGroup]: this.buildManufacturingFormGroup(),
      [EMaterialsFormControls.assemblyTestingFormGroup]: this.buildAssemblyTestingFormGroup(),
      [EMaterialsFormControls.afterSalesFormGroup]: this.buildAfterSalesFormGroup(),
    });
  }

  /**
   * Add a new item to a section's FormArray
   */
  addItemToSection(formGroup: FormGroup, sectionName: string, includeYears: boolean = true): void {
    const sectionFormGroup = formGroup.get(sectionName) as FormGroup;
    if (!sectionFormGroup) return;

    const itemsArray = sectionFormGroup.get('items') as FormArray;
    if (!itemsArray) return;

    itemsArray.push(this.createValueChainItemFormGroup(includeYears));
  }

  /**
   * Remove an item from a section's FormArray
   */
  removeItemFromSection(formGroup: FormGroup, sectionName: string, index: number): void {
    const sectionFormGroup = formGroup.get(sectionName) as FormGroup;
    if (!sectionFormGroup) return;

    const itemsArray = sectionFormGroup.get('items') as FormArray;
    if (!itemsArray) return;

    const currentLength = itemsArray.length;
    if (currentLength > 1) {
      itemsArray.removeAt(index);
    } else {
      // Keep at least one item with empty values
      itemsArray.clear();
      const includeYears = sectionName !== EMaterialsFormControls.manufacturingFormGroup;
      itemsArray.push(this.createValueChainItemFormGroup(includeYears));
    }
  }

  /**
   * Get FormArray for a specific section
   */
  getSectionFormArray(formGroup: FormGroup, sectionName: string): FormArray | null {
    const sectionFormGroup = formGroup.get(sectionName) as FormGroup;
    if (!sectionFormGroup) return null;

    return sectionFormGroup.get('items') as FormArray;
  }

  /**
   * Calculate total localization percentage for a specific year across all sections
   * @param formGroup - The step 3 form group
   * @param year - Year number (1-7)
   * @returns Total localization percentage
   */
  calculateYearTotalLocalization(formGroup: FormGroup, year: number): number {
    const yearControl = `year${year}` as keyof typeof EMaterialsFormControls;
    const yearControlName = EMaterialsFormControls[yearControl];

    let total = 0;

    // Sections that include years
    const sectionsWithYears = [
      EMaterialsFormControls.designEngineeringFormGroup,
      EMaterialsFormControls.sourcingFormGroup,
      EMaterialsFormControls.assemblyTestingFormGroup,
      EMaterialsFormControls.afterSalesFormGroup,
    ];

    sectionsWithYears.forEach(sectionName => {
      const itemsArray = this.getSectionFormArray(formGroup, sectionName);
      if (!itemsArray) return;

      itemsArray.controls.forEach((itemControl: AbstractControl) => {
        const itemFormGroup = itemControl as FormGroup;
        const costPercentageControl = itemFormGroup.get(`${EMaterialsFormControls.costPercentage}.${EMaterialsFormControls.value}`);
        const yearControl = itemFormGroup.get(`${yearControlName}.${EMaterialsFormControls.value}`);
        const inHouseOrProcuredControl = itemFormGroup.get(`${EMaterialsFormControls.inHouseOrProcured}.${EMaterialsFormControls.value}`);

        const costPercentage = costPercentageControl?.value ?? 0;
        const yearValue = yearControl?.value;
        const inHouseOrProcured = inHouseOrProcuredControl?.value;

        // Calculation logic based on truth table
        if (yearValue === 'Yes') {
          // Case 1 & 3: In-house + Yes OR Procured + Yes = Add Cost %
          total += costPercentage;
        } else if (yearValue === 'Partial') {
          // Case 5: Any + Partial = Add (Cost % × 50%)
          total += costPercentage * 0.5;
        }
        // Case 2 & 4: In-house + No OR Procured + No = Zero (don't add)
      });
    });

    return Math.min(total, 100); // Cap at 100%
  }

  /**
   * Calculate total cost percentage for a specific section
   */
  calculateSectionTotalCostPercentage(formGroup: FormGroup, sectionName: string): number {
    const itemsArray = this.getSectionFormArray(formGroup, sectionName);
    if (!itemsArray) return 0;

    let total = 0;
    itemsArray.controls.forEach((itemControl: AbstractControl) => {
      const itemFormGroup = itemControl as FormGroup;
      const costPercentageControl = itemFormGroup.get(`${EMaterialsFormControls.costPercentage}.${EMaterialsFormControls.value}`);
      const costPercentage = costPercentageControl?.value ?? 0;
      total += costPercentage;
    });

    return total;
  }

  /**
   * Validate that total cost percentage doesn't exceed 100% for a section
   */
  private costPercentageArrayValidator() {
    return (control: AbstractControl): ValidationErrors | null => {
      const array = control.value as any[];
      if (!array || array.length === 0) {
        return null; // Empty array is valid (will be handled by required validator if needed)
      }

      let total = 0;
      array.forEach((item: any) => {
        const costPercentage = item?.[EMaterialsFormControls.costPercentage]?.[EMaterialsFormControls.value];
        if (costPercentage !== null && costPercentage !== undefined) {
          total += parseFloat(costPercentage) || 0;
        }
      });

      if (total > 100) {
        return {
          totalExceeds100: {
            message: 'Total cost percentage cannot exceed 100%',
            total: total
          }
        };
      }

      return null;
    };
  }

  /**
   * Validate total cost percentage across all sections
   */
  validateTotalCostPercentage(formGroup: FormGroup): ValidationErrors | null {
    const sections = [
      EMaterialsFormControls.designEngineeringFormGroup,
      EMaterialsFormControls.sourcingFormGroup,
      EMaterialsFormControls.manufacturingFormGroup,
      EMaterialsFormControls.assemblyTestingFormGroup,
      EMaterialsFormControls.afterSalesFormGroup,
    ];

    let grandTotal = 0;
    sections.forEach(sectionName => {
      grandTotal += this.calculateSectionTotalCostPercentage(formGroup, sectionName);
    });

    if (grandTotal > 100) {
      return {
        totalExceeds100: {
          message: 'Total cost percentage across all sections cannot exceed 100%',
          total: grandTotal
        }
      };
    }

    return null;
  }
}

