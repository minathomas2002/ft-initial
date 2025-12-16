import { AbstractControl, FormArray, FormGroup } from '@angular/forms';

/**
 * Recursively check if a control or any of its nested controls is dirty, invalid, and has a required error
 * @param control - The AbstractControl to check
 * @returns true if any control meets all three conditions (dirty, invalid, and has required error), false otherwise
 */
export function hasIncompleteControl(control: AbstractControl): boolean {
  // Check if current control is dirty, invalid, and has required error
  if (control.dirty && control.invalid && control.errors?.['required']) {
    return true;
  }

  // If it's a FormGroup or FormArray, check nested controls
  if (control instanceof FormGroup || control instanceof FormArray) {
    for (const nestedControl of Object.values(control.controls)) {
      if (hasIncompleteControl(nestedControl)) {
        return true;
      }
    }
  }

  return false;
}
