import { Injectable } from '@angular/core';
import { FormGroup, FormArray, AbstractControl } from '@angular/forms';

@Injectable({
  providedIn: 'root',
})
export class FormUtilityService {
  /**
   * Recursively counts validation errors in a FormGroup
   * @param formGroup The FormGroup to count errors for
   * @returns The total number of validation errors found
   */
  countFormErrors(formGroup: FormGroup): number {
    if (!formGroup || !(formGroup instanceof FormGroup)) {
      return 0;
    }

    let errorCount = 0;

    // Count errors on the FormGroup itself only if it's dirty
    if (formGroup.dirty && formGroup.errors) {
      errorCount += Object.keys(formGroup.errors).length;
    }

    // Recursively count errors in all controls
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      if (control) {
        // Only count errors if the control is dirty
        if (control.dirty && control.errors) {
          errorCount += Object.keys(control.errors).length;
        }

        // Recursively handle nested FormGroups
        if (control instanceof FormGroup) {
          errorCount += this.countFormErrors(control);
        }
        // Recursively handle FormArrays
        else if (control instanceof FormArray) {
          control.controls.forEach((arrayControl) => {
            if (arrayControl instanceof FormGroup) {
              errorCount += this.countFormErrors(arrayControl);
            } else if (arrayControl.dirty && arrayControl.errors) {
              errorCount += Object.keys(arrayControl.errors).length;
            }
          });
        }
      }
    });

    return errorCount;
  }
}

