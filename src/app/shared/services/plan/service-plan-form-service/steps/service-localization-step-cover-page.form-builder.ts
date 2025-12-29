import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EMaterialsFormControls } from 'src/app/shared/enums';

export class ServiceLocalizationStepCoverPageFormBuilder {
  constructor(
    private readonly fb: FormBuilder
  ) { }

  buildCompanyInformationFormGroup(): FormGroup {
    return this.fb.group({
      [EMaterialsFormControls.companyName]: this.fb.group({
        [EMaterialsFormControls.hasComment]: this.fb.control(false),
        [EMaterialsFormControls.value]: this.fb.control('', [Validators.required, Validators.maxLength(100)]),
      }),
    });
  }

  /**
   * Create a FormGroup for a single service item
   */
  createServiceItem(): FormGroup {
    return this.fb.group({
      rowId: [null], // Hidden control to store the row ID (for edit mode)
      [EMaterialsFormControls.serviceName]: this.fb.group({
        [EMaterialsFormControls.hasComment]: this.fb.control(false),
        [EMaterialsFormControls.value]: this.fb.control('', [Validators.required, Validators.maxLength(100)]),
      }),
    });
  }

  /**
   * Build Services FormArray
   */
  buildServicesFormGroup(): FormArray {
    return this.fb.array(
      [this.createServiceItem()],
      [Validators.required]
    );
  }

  /**
   * Build Step 1 main form group
   */
  buildCoverPageFormGroup(): FormGroup {
    return this.fb.group({
      [EMaterialsFormControls.coverPageCompanyInformationFormGroup]: this.buildCompanyInformationFormGroup(),
      [EMaterialsFormControls.servicesFormGroup]: this.buildServicesFormGroup(),
    });
  }

  /**
   * Get Services FormArray from cover page form group
   */
  getServicesFormArray(formGroup: FormGroup): FormArray | null {
    return formGroup.get(EMaterialsFormControls.servicesFormGroup) as FormArray | null;
  }

  /**
   * Add a new service item to the FormArray
   */
  addServiceItem(formGroup: FormGroup): void {
    const servicesArray = this.getServicesFormArray(formGroup);
    if (!servicesArray) return;

    servicesArray.push(this.createServiceItem());
  }

  /**
   * Remove a service item from the FormArray
   */
  removeServiceItem(formGroup: FormGroup, index: number): void {
    const servicesArray = this.getServicesFormArray(formGroup);
    if (!servicesArray) return;

    const currentLength = servicesArray.length;
    if (currentLength > 1) {
      servicesArray.removeAt(index);
    } else {
      // Keep at least one item with empty values
      servicesArray.clear();
      servicesArray.push(this.createServiceItem());
    }
  }
}

