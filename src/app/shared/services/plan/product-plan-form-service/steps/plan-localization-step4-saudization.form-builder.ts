import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EMaterialsFormControls } from 'src/app/shared/enums';
import { BasicPlanBuilder } from './basicPlanBuilder';

export class PlanLocalizationStep4SaudizationFormBuilder extends BasicPlanBuilder {
  constructor(
    fb: FormBuilder) {
    super(fb);
  }

  createYearFormGroup(): FormGroup {
    return this.fb.group({
      [EMaterialsFormControls.annualHeadcount]: this.fb.group({
        rowId: [null], // Hidden control to store the row ID (for edit mode)
        [EMaterialsFormControls.hasComment]: [false],
        [EMaterialsFormControls.value]: [null, [Validators.required, Validators.min(0.01)]], // Integer only, >= 0
      }),
      [EMaterialsFormControls.saudizationPercentage]: this.fb.group({
        rowId: [null], // Hidden control to store the row ID (for edit mode)
        [EMaterialsFormControls.hasComment]: [false],
        [EMaterialsFormControls.value]: [null, [Validators.required, Validators.min(0.01), Validators.max(100)]], // Range: 0-100%
      }),
      [EMaterialsFormControls.annualTotalCompensation]: this.fb.group({
        rowId: [null], // Hidden control to store the row ID (for edit mode)
        [EMaterialsFormControls.hasComment]: [false],
        [EMaterialsFormControls.value]: [null, [Validators.required, Validators.min(0.01)]], // Decimal allowed, >= 0
      }),
      [EMaterialsFormControls.saudiCompensationPercentage]: this.fb.group({
        rowId: [null], // Hidden control to store the row ID (for edit mode)
        [EMaterialsFormControls.hasComment]: [false],
        [EMaterialsFormControls.value]: [null, [Validators.required, Validators.min(0.01), Validators.max(100)]], // Range: 0-100%
      }),
    });
  }

  /**
   * Build Saudization FormGroup with 7 year columns
   */
  buildSaudizationFormGroup(): FormGroup {
    return this.fb.group({
      [EMaterialsFormControls.year1]: this.createYearFormGroup(),
      [EMaterialsFormControls.year2]: this.createYearFormGroup(),
      [EMaterialsFormControls.year3]: this.createYearFormGroup(),
      [EMaterialsFormControls.year4]: this.createYearFormGroup(),
      [EMaterialsFormControls.year5]: this.createYearFormGroup(),
      [EMaterialsFormControls.year6]: this.createYearFormGroup(),
      [EMaterialsFormControls.year7]: this.createYearFormGroup(),
    });
  }

  /**
   * Build Attachments FormGroup
   */
  buildAttachmentsFormGroup(): FormGroup {
    return this.fb.group({
      [EMaterialsFormControls.attachments]: this.fb.group({
        [EMaterialsFormControls.hasComment]: [false],
        [EMaterialsFormControls.value]: [null], // File upload - optional
      }),
    });
  }

  /**
   * Build Step 4 main form group
   */
  buildStep4FormGroup(): FormGroup {
    return this.fb.group({
      [EMaterialsFormControls.saudizationFormGroup]: this.buildSaudizationFormGroup(),
      [EMaterialsFormControls.attachmentsFormGroup]: this.buildAttachmentsFormGroup(),
    });
  }

  /**
   * Get a specific year's form group from saudization form group
   */
  getYearFormGroup(saudizationFormGroup: FormGroup, year: number): FormGroup | null {
    const yearControl = `year${year}` as keyof typeof EMaterialsFormControls;
    const yearControlName = EMaterialsFormControls[yearControl];
    return saudizationFormGroup.get(yearControlName) as FormGroup | null;
  }

  /**
   * Get a specific row value for a specific year
   * @param saudizationFormGroup - The saudization form group
   * @param year - Year number (1-7)
   * @param rowName - Row control name (annualHeadcount, saudizationPercentage, etc.)
   */
  getRowValueForYear(
    saudizationFormGroup: FormGroup,
    year: number,
    rowName: string
  ): any {
    const yearFormGroup = this.getYearFormGroup(saudizationFormGroup, year);
    if (!yearFormGroup) return null;

    const rowFormGroup = yearFormGroup.get(rowName) as FormGroup | null;
    if (!rowFormGroup) return null;

    return rowFormGroup.get(EMaterialsFormControls.value)?.value;
  }


  getRowHasErrorForYear(
    saudizationFormGroup: FormGroup,
    year: number,
    rowName: string
  ): any {
    const yearFormGroup = this.getYearFormGroup(saudizationFormGroup, year);
    if (!yearFormGroup) return null;
    return yearFormGroup.get(rowName)?.invalid && yearFormGroup.get(rowName)?.dirty;
  }
  /**
   * Set a specific row value for a specific year
   */
  setRowValueForYear(
    saudizationFormGroup: FormGroup,
    year: number,
    rowName: string,
    value: any
  ): void {
    const yearFormGroup = this.getYearFormGroup(saudizationFormGroup, year);
    if (!yearFormGroup) return;

    const rowFormGroup = yearFormGroup.get(rowName) as FormGroup | null;
    if (!rowFormGroup) return;

    rowFormGroup.get(EMaterialsFormControls.value)?.setValue(value);
  }
}

