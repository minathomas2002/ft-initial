import { FormArray, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Subscription } from 'rxjs';
import { EInHouseProcuredType, ELocalizationStatusType, EMaterialsFormControls } from 'src/app/shared/enums';
import { hasIncompleteControl } from 'src/app/shared/validators/form-control-helpers';
import { BasicPlanBuilder } from './basicPlanBuilder';
import { IOpportunityLocalizationTablesValidationResponse } from 'src/app/shared/interfaces';
import { safeTextValidator } from 'src/app/shared/validators/safe-text.validator';

const ALL_VALUE_CONTROL_NAMES = [
  EMaterialsFormControls.expenseHeader,
  EMaterialsFormControls.inHouseOrProcured,
  EMaterialsFormControls.costPercentage,
  EMaterialsFormControls.year1,
  EMaterialsFormControls.year2,
  EMaterialsFormControls.year3,
  EMaterialsFormControls.year4,
  EMaterialsFormControls.year5,
  EMaterialsFormControls.year6,
  EMaterialsFormControls.year7,
] as const;

export class PlanLocalizationStep3ValueChainFormBuilder extends BasicPlanBuilder {
  private optionalSectionsSubscription: Subscription | null = null;
  constructor(
    fb: FormBuilder,
    private readonly getLocalizationTablesValidation: () => IOpportunityLocalizationTablesValidationResponse | null,
  ) {
    super(fb);
  }

  /**
   * Create a FormGroup for a single value chain item (row in the table)
   */
  createValueChainItemFormGroup(): FormGroup {
    const itemGroup: any = {
      // Hidden control to store the row ID (for edit mode)
      rowId: [null],
      [EMaterialsFormControls.expenseHeader]: this.fb.group({
        [EMaterialsFormControls.hasComment]: [false],
        [EMaterialsFormControls.value]: ['', [Validators.required, Validators.maxLength(100), safeTextValidator()]],
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

    // Add year columns (Year 1-7)
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
        [EMaterialsFormControls.value]: [null, [Validators.required]],
      });
    });

    return this.fb.group(itemGroup);
  }

  /**
   * Build FormArray for a specific section
   */
  buildSectionFormArray(): FormArray {
    return this.fb.array(
      [this.createValueChainItemFormGroup()],
      [this.incompleteFormArrayValidator()]
    );
  }

  /**
   * Build Design & Engineering section
   */
  buildDesignEngineeringFormGroup(): FormGroup {
    return this.fb.group({
      items: this.buildSectionFormArray(),
    });
  }

  /**
   * Build Sourcing section
   */
  buildSourcingFormGroup(): FormGroup {
    return this.fb.group({
      items: this.buildSectionFormArray(),
    });
  }

  /**
   * Build Manufacturing section
   */
  buildManufacturingFormGroup(): FormGroup {
    return this.fb.group({
      items: this.buildSectionFormArray(),
    });
  }

  /**
   * Build Assembly & Testing section
   */
  buildAssemblyTestingFormGroup(): FormGroup {
    return this.fb.group({
      items: this.buildSectionFormArray(),
    });
  }

  /**
   * Build After-Sales section
   */
  buildAfterSalesFormGroup(): FormGroup {
    return this.fb.group({
      items: this.buildSectionFormArray(),
    });
  }

  /**
   * Updates required validators on non-year value controls within an item group.
   * @param itemGroup - The value chain item FormGroup
   * @param isRequired - When true, adds Validators.required; when false, removes it
   */
  updateItemGroupValidators(itemGroup: FormGroup, isRequired: boolean): void {
    const controlNames = [
      EMaterialsFormControls.expenseHeader,
      EMaterialsFormControls.inHouseOrProcured,
      EMaterialsFormControls.costPercentage,
    ];

    controlNames.forEach(controlName => {
      const nestedGroup = itemGroup.get(controlName) as FormGroup;
      if (!nestedGroup) return;

      const valueControl = nestedGroup.get(EMaterialsFormControls.value);
      if (!valueControl) return;

      if (isRequired) {
        valueControl.addValidators(Validators.required);
      } else {
        valueControl.removeValidators(Validators.required);
      }

      valueControl.updateValueAndValidity({ emitEvent: false });
    });
  }

  /**
   * Updates required validators on year (Year 1-7) value controls within an item group.
   * @param itemGroup - The value chain item FormGroup
   * @param isRequired - When true, adds Validators.required; when false, removes it
   */
  updateItemGroupYearsValidators(itemGroup: FormGroup, isRequired: boolean): void {
    const yearControlNames = [
      EMaterialsFormControls.year1,
      EMaterialsFormControls.year2,
      EMaterialsFormControls.year3,
      EMaterialsFormControls.year4,
      EMaterialsFormControls.year5,
      EMaterialsFormControls.year6,
      EMaterialsFormControls.year7,
    ];

    yearControlNames.forEach(controlName => {
      const nestedGroup = itemGroup.get(controlName) as FormGroup;
      if (!nestedGroup) return;

      const valueControl = nestedGroup.get(EMaterialsFormControls.value);
      if (!valueControl) return;

      if (isRequired) {
        valueControl.addValidators(Validators.required);
      } else {
        valueControl.removeValidators(Validators.required);
      }

      valueControl.updateValueAndValidity({ emitEvent: false });
    });
  }

  /**
   * Returns true when in-house/procured selection is In-house.
   * Year fields are not required for In-house rows.
   */
  private isInHouseRow(itemGroup: FormGroup): boolean {
    const val = itemGroup.get(EMaterialsFormControls.inHouseOrProcured)?.get(EMaterialsFormControls.value)?.value;
    return val === '1' || val === EInHouseProcuredType.InHouse || val === EInHouseProcuredType.InHouse.toString();
  }

  /**
   * Check if an item has at least one value in any value field.
   */
  private itemHasAnyValue(itemGroup: FormGroup): boolean {
    for (const controlName of ALL_VALUE_CONTROL_NAMES) {
      const nestedGroup = itemGroup.get(controlName) as FormGroup;
      const valueControl = nestedGroup?.get(EMaterialsFormControls.value);
      const value = valueControl?.value;
      if (value != null && value !== '') return true;
    }
    return false;
  }

  /**
   * For optional sections (isRequired: false): apply conditional validation.
   * If item has any value → add required to all value fields.
   * If all fields are null/empty → remove required from all.
   */
  private applyConditionalValidationForOptionalSections(
    formGroup: FormGroup,
    opportunityLocalizationTablesValidation: IOpportunityLocalizationTablesValidationResponse | null
  ): void {
    const sectionConfig = this.getSectionConfig(opportunityLocalizationTablesValidation);

    sectionConfig.forEach(({ sectionName, isRequired }) => {
      if (isRequired) return;

      const itemsArray = this.getSectionFormArray(formGroup, sectionName);
      if (!itemsArray) return;

      itemsArray.controls.forEach((itemControl: AbstractControl) => {
        const itemFormGroup = itemControl as FormGroup;
        const hasValue = this.itemHasAnyValue(itemFormGroup);
        this.updateItemGroupValidators(itemFormGroup, hasValue);
        // Year fields are only required for Procured rows; In-house rows show "No" for years
        const isInHouse = this.isInHouseRow(itemFormGroup);
        this.updateItemGroupYearsValidators(itemFormGroup, hasValue && !isInHouse);
      });
    });
  }

  /**
   * Set up a single subscription to form.valueChanges for optional sections.
   * When any value field changes, re-apply conditional validation for optional section items.
   */
  private setupOptionalSectionsValueChangeSubscription(
    formGroup: FormGroup,
    opportunityLocalizationTablesValidation: IOpportunityLocalizationTablesValidationResponse | null
  ): void {
    this.optionalSectionsSubscription?.unsubscribe();
    this.optionalSectionsSubscription = null;

    const sectionConfig = this.getSectionConfig(opportunityLocalizationTablesValidation);
    const hasOptionalSections = sectionConfig.some(({ isRequired }) => !isRequired);
    if (!hasOptionalSections) return;

    // One subscription for all value changes
    this.optionalSectionsSubscription = formGroup.valueChanges.subscribe(() => {
      this.applyConditionalValidationForOptionalSections(formGroup, opportunityLocalizationTablesValidation);
    });

    // Apply initial state
    this.applyConditionalValidationForOptionalSections(formGroup, opportunityLocalizationTablesValidation);
  }

  private getSectionConfig(validation: IOpportunityLocalizationTablesValidationResponse | null) {
    return [
      { sectionName: EMaterialsFormControls.designEngineeringFormGroup, isRequired: validation?.designEngineeringRequired ?? false },
      { sectionName: EMaterialsFormControls.sourcingFormGroup, isRequired: validation?.sourcingRequired ?? false },
      { sectionName: EMaterialsFormControls.manufacturingFormGroup, isRequired: validation?.manufacturingRequired ?? false },
      { sectionName: EMaterialsFormControls.assemblyTestingFormGroup, isRequired: validation?.assemblyTestingRequired ?? false },
      { sectionName: EMaterialsFormControls.afterSalesFormGroup, isRequired: validation?.afterSalesRequired ?? false },
    ];
  }

  /**
   * Updates validation (required validators) for all value chain items based on
   * opportunity localization tables validation response.
   * Required sections: always add required validators.
   * Optional sections: conditional - add required when record has any value, remove when all empty.
   */
  updateValueChainValidation(
    formGroup: FormGroup,
    opportunityLocalizationTablesValidation: IOpportunityLocalizationTablesValidationResponse | null
  ): void {
    const sectionConfig = this.getSectionConfig(opportunityLocalizationTablesValidation);

    sectionConfig.forEach(({ sectionName, isRequired }) => {
      const itemsArray = this.getSectionFormArray(formGroup, sectionName);
      if (!itemsArray) return;

      itemsArray.controls.forEach((itemControl: AbstractControl) => {
        const itemFormGroup = itemControl as FormGroup;
        if (isRequired) {
          this.updateItemGroupValidators(itemFormGroup, true);
          // Year fields only required for Procured rows; In-house rows show "No"
          const isInHouse = this.isInHouseRow(itemFormGroup);
          this.updateItemGroupYearsValidators(itemFormGroup, !isInHouse);
        } else {
          this.updateItemGroupValidators(itemFormGroup, false);
          this.updateItemGroupYearsValidators(itemFormGroup, false);
        }
      });
    });

    this.setupOptionalSectionsValueChangeSubscription(formGroup, opportunityLocalizationTablesValidation);
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
      [EMaterialsFormControls.valueChainPageCommentGroup]: this.fb.group({
        [EMaterialsFormControls.hasComment]: [false],
      }),
      [EMaterialsFormControls.comment]: this.fb.control(''),
    }, {
      validators: [this.validateTotalCostPercentage()]
    });
  }

  /**
   * Add a new item to a section's FormArray
   */
  addItemToSection(formGroup: FormGroup, sectionName: string): void {
    const sectionFormGroup = formGroup.get(sectionName) as FormGroup;
    if (!sectionFormGroup) return;

    const itemsArray = sectionFormGroup.get('items') as FormArray;
    if (!itemsArray) return;

    itemsArray.push(this.createValueChainItemFormGroup());
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
      itemsArray.push(this.createValueChainItemFormGroup());
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

    // All sections include years
    const sections = [
      EMaterialsFormControls.designEngineeringFormGroup,
      EMaterialsFormControls.sourcingFormGroup,
      EMaterialsFormControls.manufacturingFormGroup,
      EMaterialsFormControls.assemblyTestingFormGroup,
      EMaterialsFormControls.afterSalesFormGroup,
    ];

    sections.forEach(sectionName => {
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
        if (yearValue == ELocalizationStatusType.Yes.toString()) {
          // Case 1 & 3: In-house + Yes OR Procured + Yes = Add Cost %
          total += costPercentage;
        } else if (yearValue == ELocalizationStatusType.Partial.toString()) {
          // Case 5: Any + Partial = Add (Cost % × 50%)
          total += costPercentage * 0.5;
        }
        // Case 2 & 4: In-house + No OR Procured + No = Zero (don't add)
      });
    });

    return Number(total.toFixed(2))
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
   * Validator to check if any control in the form array is dirty, invalid, and has a required error
   * Returns {inComplete: true} if such a control is found
   */
  private incompleteFormArrayValidator() {
    return (control: AbstractControl): ValidationErrors | null => {
      const formArray = control as FormArray;
      if (!formArray || formArray.length === 0) {
        return null;
      }

      // Check each item in the form array
      for (const itemControl of formArray.controls) {
        if (hasIncompleteControl(itemControl)) {
          return { inComplete: true };
        }
      }

      return null;
    };
  }

  /**
   * Check if opportunityLocalizationTablesValidation has at least one section required (true).
   */
  private hasAnyLocalizationSectionRequired(validation: IOpportunityLocalizationTablesValidationResponse | null): boolean {
    if (!validation) return false;
    return (
      validation.designEngineeringRequired ||
      validation.sourcingRequired ||
      validation.manufacturingRequired ||
      validation.assemblyTestingRequired ||
      validation.afterSalesRequired
    );
  }

  /**
   * Validate total cost percentage across all sections.
   * Only triggers when opportunityLocalizationTablesValidation has at least one section with true.
   */
  /**
   * Check if all costPercentage value fields across all sections are null.
   */
  private hasAllCostPercentageValuesNull(formGroup: FormGroup): boolean {
    const sections = [
      EMaterialsFormControls.designEngineeringFormGroup,
      EMaterialsFormControls.sourcingFormGroup,
      EMaterialsFormControls.manufacturingFormGroup,
      EMaterialsFormControls.assemblyTestingFormGroup,
      EMaterialsFormControls.afterSalesFormGroup,
    ];

    for (const sectionName of sections) {
      const itemsArray = this.getSectionFormArray(formGroup, sectionName);
      if (!itemsArray) continue;

      for (const itemControl of itemsArray.controls) {
        const itemFormGroup = itemControl as FormGroup;
        const costPercentageControl = itemFormGroup.get(
          `${EMaterialsFormControls.costPercentage}.${EMaterialsFormControls.value}`
        );
        const value = costPercentageControl?.value;
        if (value != null && value !== '') {
          return false;
        }
      }
    }
    return true;
  }

  private validateTotalCostPercentage() {
    return (control: AbstractControl): ValidationErrors | null => {
      const formGroup = control as FormGroup;
      if (!formGroup) {
        return null;
      }

      if (this.hasAllCostPercentageValuesNull(formGroup)) {
        return null;
      }

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

      if (grandTotal !== 100) {
        return {
          totalExceeds100: true
        };
      }

      return null;
    };
  }
}

