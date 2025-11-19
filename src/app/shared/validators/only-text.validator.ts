import { AbstractControl, ValidationErrors } from '@angular/forms';

/**
 * Validator for text input: only letters (any language) and spaces allowed
 * No numbers or special characters
 * Useful for full names, names, etc.
 */
export function onlyTextValidator(): (control: AbstractControl) => ValidationErrors | null {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value || '';

    // Allow empty (will be caught by required validator)
    if (!value) {
      return null;
    }

    // Check if value contains only Unicode letters (any language) and spaces
    // \p{L} matches any letter from any language (Unicode letter category)
    // \s matches whitespace characters (spaces)
    const lettersOnlyPattern = /^[\p{L}\s]+$/u;

    if (!lettersOnlyPattern.test(value)) {
      return { invalidFullName: true };
    }

    return null;
  };
}
