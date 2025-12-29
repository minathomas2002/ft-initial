import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EMaterialsFormControls } from 'src/app/shared/enums';

export class ServiceLocalizationStepDirectLocalizationFormBuilder {
  constructor(
    private readonly fb: FormBuilder
  ) { }

  /**
   * Create a FormGroup for a single entity level headcount item
   * Contains years 2025-2030 with Expected Annual Headcount and Saudization % for each year
   */
  createEntityLevelItem(): FormGroup {
    const itemGroup: any = {
      rowId: [null], // Hidden control to store the row ID (for edit mode)
    };

    // Add year columns (2025-2030) with Expected Annual Headcount and Saudization %
    const yearControls = [
      EMaterialsFormControls.firstYear,
      EMaterialsFormControls.secondYear,
      EMaterialsFormControls.thirdYear,
      EMaterialsFormControls.fourthYear,
      EMaterialsFormControls.fifthYear,
    ];

    yearControls.forEach(yearControl => {
      itemGroup[`${yearControl}_headcount`] = this.fb.group({
        [EMaterialsFormControls.hasComment]: [false],
        [EMaterialsFormControls.value]: [null, [Validators.min(0)]],
      });
      itemGroup[`${yearControl}_saudization`] = this.fb.group({
        [EMaterialsFormControls.hasComment]: [false],
        [EMaterialsFormControls.value]: [null, [Validators.min(0), Validators.max(100)]],
      });
    });

    return this.fb.group(itemGroup);
  }

  /**
   * Build Entity Level FormArray
   */
  buildEntityLevelFormGroup(): FormArray {
    return this.fb.array(
      [this.createEntityLevelItem()],
      [Validators.required]
    );
  }

  /**
   * Create a FormGroup for a single service level item
   */
  createServiceLevelItem(): FormGroup {
    const itemGroup: any = {
      rowId: [null], // Hidden control to store the row ID (for edit mode)
      [EMaterialsFormControls.serviceName]: this.fb.group({
        [EMaterialsFormControls.hasComment]: [false],
        [EMaterialsFormControls.value]: ['', [Validators.required, Validators.maxLength(100)]],
      }),
      [EMaterialsFormControls.expectedLocalizationDate]: this.fb.group({
        [EMaterialsFormControls.hasComment]: [false],
        [EMaterialsFormControls.value]: ['', [Validators.maxLength(50)]],
      }),
    };

    // Add year columns (2025-2030) for Saudization %
    const yearControls = [
      EMaterialsFormControls.fifthYear,
      EMaterialsFormControls.secondYear,
      EMaterialsFormControls.thirdYear,
      EMaterialsFormControls.fourthYear,
      EMaterialsFormControls.firstYear,
    ];

    yearControls.forEach(yearControl => {
      itemGroup[`${yearControl}_saudization`] = this.fb.group({
        [EMaterialsFormControls.hasComment]: [false],
        [EMaterialsFormControls.value]: [null, [Validators.min(0), Validators.max(100)]],
      });
    });

    itemGroup[EMaterialsFormControls.keyRoadblocksPains] = this.fb.group({
      [EMaterialsFormControls.hasComment]: [false],
      [EMaterialsFormControls.value]: ['', [Validators.maxLength(1000)]],
    });

    itemGroup[EMaterialsFormControls.supportRequiredFromSECGDC] = this.fb.group({
      [EMaterialsFormControls.hasComment]: [false],
      [EMaterialsFormControls.value]: ['', [Validators.maxLength(500)]],
    });

    return this.fb.group(itemGroup);
  }

  /**
   * Build Service Level FormArray
   */
  buildServiceLevelFormGroup(): FormArray {
    return this.fb.array(
      [this.createServiceLevelItem()],
      [Validators.required]
    );
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
  buildDirectLocalizationFormGroup(): FormGroup {
    return this.fb.group({
      [EMaterialsFormControls.entityLevelFormGroup]: this.buildEntityLevelFormGroup(),
      [EMaterialsFormControls.serviceLevelFormGroup]: this.buildServiceLevelFormGroup(),
      [EMaterialsFormControls.attachmentsFormGroup]: this.buildAttachmentsFormGroup(),
    });
  }

  /**
   * Get Entity Level FormArray
   */
  getEntityLevelFormArray(formGroup: FormGroup): FormArray | null {
    return formGroup.get(EMaterialsFormControls.entityLevelFormGroup) as FormArray | null;
  }

  /**
   * Get Service Level FormArray
   */
  getServiceLevelFormArray(formGroup: FormGroup): FormArray | null {
    return formGroup.get(EMaterialsFormControls.serviceLevelFormGroup) as FormArray | null;
  }

  /**
   * Add a new entity level item
   */
  addEntityLevelItem(formGroup: FormGroup): void {
    const array = this.getEntityLevelFormArray(formGroup);
    if (!array) return;
    array.push(this.createEntityLevelItem());
  }

  /**
   * Remove an entity level item
   */
  removeEntityLevelItem(formGroup: FormGroup, index: number): void {
    const array = this.getEntityLevelFormArray(formGroup);
    if (!array) return;

    const currentLength = array.length;
    if (currentLength > 1) {
      array.removeAt(index);
    } else {
      array.clear();
      array.push(this.createEntityLevelItem());
    }
  }

  /**
   * Add a new service level item
   */
  addServiceLevelItem(formGroup: FormGroup): void {
    const array = this.getServiceLevelFormArray(formGroup);
    if (!array) return;
    array.push(this.createServiceLevelItem());
  }

  /**
   * Remove a service level item
   */
  removeServiceLevelItem(formGroup: FormGroup, index: number): void {
    const array = this.getServiceLevelFormArray(formGroup);
    if (!array) return;

    const currentLength = array.length;
    if (currentLength > 1) {
      array.removeAt(index);
    } else {
      array.clear();
      array.push(this.createServiceLevelItem());
    }
  }
}

