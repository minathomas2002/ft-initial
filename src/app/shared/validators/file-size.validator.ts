import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Validator for checking if the total size of multiple files exceeds the maximum allowed size
 * @param maxSizeInBytes Maximum allowed size in bytes (default: 30 MB)
 * @returns ValidatorFn that validates File[] controls
 */
export function fileSizeValidator(maxSizeInBytes: number = 30 * 1024 * 1024): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const files = control.value;

    // If no files, validation passes (use required validator for that)
    if (!files || !Array.isArray(files) || files.length === 0) {
      return null;
    }

    // Calculate total size
    const totalSize = files.reduce((total: number, file: File) => {
      if (file instanceof File) {
        return total + file.size;
      }
      return total;
    }, 0);

    // Check if total size exceeds limit
    if (totalSize > maxSizeInBytes) {
      return {
        fileSizeExceeded: {
          maxSize: maxSizeInBytes,
          actualSize: totalSize,
        },
      };
    }

    return null;
  };
}
