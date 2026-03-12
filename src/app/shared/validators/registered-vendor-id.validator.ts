import { AbstractControl, ValidationErrors } from '@angular/forms';

export function registeredVendorIDPatternValidator(): (
  control: AbstractControl,
) => ValidationErrors | null {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    // Allow empty (will be caught by required validator)
    if (!value) {
      return null;
    }

    let registeredVendorID: string | null = null;

    if (value !== undefined) {
      registeredVendorID = value;
    }

    if (!registeredVendorID || registeredVendorID.trim() === '') {
      return null;
    }

    const trimmedRegisteredVendorID = registeredVendorID.trim();
    const length = trimmedRegisteredVendorID.length;

    if (length !== 7) {
      return {
        invalidRegisteredVendorIDLength: true,
        expectedLength: 7,
      };
    }

    return null;
  };
}
