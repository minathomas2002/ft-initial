import { Injectable } from '@angular/core';
import { FormGroup, FormArray, AbstractControl, FormControl } from '@angular/forms';

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

    // Count errors on the FormGroup itself only if it's interacted with
    if ((formGroup.dirty || formGroup.touched) && formGroup.errors) {
      errorCount += Object.keys(formGroup.errors).length;
    }
    // Recursively count errors in all controls
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      if (!control) return;

      if (control instanceof FormGroup) {
        errorCount += this.countFormErrors(control);
        return;
      }

      if (control instanceof FormArray) {
        // Count array-level errors (if any) only if interacted with
        if ((control.dirty || control.touched) && control.invalid && control.errors) {
          errorCount += Object.keys(control.errors).length;
        }

        // IMPORTANT: recurse into array items (tables/rows)
        control.controls.forEach((arrayControl) => {
          if (arrayControl instanceof FormGroup) {
            errorCount += this.countFormErrors(arrayControl);
          } else if (arrayControl instanceof FormControl) {
            if ((arrayControl.dirty || arrayControl.touched) && arrayControl.invalid) {
              errorCount++;
            }
          }
        });
        return;
      }

      if (control instanceof FormControl) {
        if ((control.dirty || control.touched) && control.invalid) {
          errorCount++;
        }
      }
    });

    return errorCount;
  }
}

