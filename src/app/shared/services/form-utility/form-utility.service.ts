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
      if (control && control instanceof FormGroup) {
        errorCount += this.countFormErrors(control);
      }
      else if (control && control.dirty && control.invalid) {
        errorCount++
      }
    });

    return errorCount;
  }
}

