import { AbstractControl, ValidationErrors } from "@angular/forms";

/**
 * Validator that checks if the trimmed value is empty
 * Treats whitespace-only values as invalid (same as required)
 */
export function trimmedRequiredValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (value === null || value === undefined) {
        return { required: true };
    }
    const trimmedValue = String(value).trim();
    if (trimmedValue === '') {
        return { required: true };
    }
    return null;
}