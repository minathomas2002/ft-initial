import { AbstractControl, ValidationErrors } from "@angular/forms";

export function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');
  
    if (!password || !confirmPassword) {
      return null;
    }
  
    const mismatch = password.value && confirmPassword.value && password.value !== confirmPassword.value;
  
    if (mismatch) {
      confirmPassword.setErrors({ ...(confirmPassword.errors ?? {}), passwordMismatch: true });
      return { passwordMismatch: true };
    }
  
    if (confirmPassword.hasError('passwordMismatch')) {
      const { passwordMismatch, ...otherErrors } = confirmPassword.errors ?? {};
      confirmPassword.setErrors(Object.keys(otherErrors).length ? otherErrors : null);
    }
  
    return null;
  }
  
  