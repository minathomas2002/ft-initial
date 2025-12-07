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
        // If it's a nested FormGroup, recursively count its errors
        if (control instanceof FormGroup) {
          errorCount += this.countFormErrors(control);
        }
        // If it's a FormArray, recursively count errors in each control
        else if (control instanceof FormArray) {
          control.controls.forEach((arrayControl: AbstractControl) => {
            // Only count errors if the array control is dirty
            if (arrayControl.dirty && arrayControl.errors) {
              errorCount += Object.keys(arrayControl.errors).length;
            }
            // If the array control is a FormGroup, recursively count its errors
            if (arrayControl instanceof FormGroup) {
              errorCount += this.countFormErrors(arrayControl);
            }
          });
        }
      }
    });

    return errorCount;
  }
}

