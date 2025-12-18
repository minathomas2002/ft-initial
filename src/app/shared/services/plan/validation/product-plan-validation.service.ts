import { Injectable, inject } from '@angular/core';
import { AbstractControl, FormArray, FormControl, FormGroup } from '@angular/forms';
import { ProductPlanFormService } from '../materials-form-service/product-plan-form-service';
import { ErrorMessagesFactory } from 'src/app/shared/classes/error-messages.factory';

export interface IFormFieldError {
  fieldPath: string;
  fieldLabel: string;
  errors: string[];
}

export interface IStepValidationErrors {
  stepNumber: number;
  hasErrors: boolean;
  fieldErrors: Map<string, IFormFieldError>;
}

@Injectable({
  providedIn: 'root'
})
export class ProductPlanValidationService {
  private readonly formService = inject(ProductPlanFormService);

  /**
   * Validates all forms and returns structured error information
   */
  validateAllForms(): Map<number, IStepValidationErrors> {
    const errors = new Map<number, IStepValidationErrors>();

    // Validate Step 1
    const step1Errors = this.validateFormGroup(
      this.formService.step1_overviewCompanyInformation,
      'Step 1'
    );
    errors.set(1, {
      stepNumber: 1,
      hasErrors: step1Errors.size > 0,
      fieldErrors: step1Errors
    });

    // Validate Step 2
    const step2Errors = this.validateFormGroup(
      this.formService.step2_productPlantOverview,
      'Step 2'
    );
    errors.set(2, {
      stepNumber: 2,
      hasErrors: step2Errors.size > 0,
      fieldErrors: step2Errors
    });

    // Validate Step 3
    const step3Errors = this.validateFormGroup(
      this.formService.step3_valueChain,
      'Step 3'
    );
    errors.set(3, {
      stepNumber: 3,
      hasErrors: step3Errors.size > 0,
      fieldErrors: step3Errors
    });

    // Validate Step 4
    const step4Errors = this.validateFormGroup(
      this.formService.step4_saudization,
      'Step 4'
    );
    errors.set(4, {
      stepNumber: 4,
      hasErrors: step4Errors.size > 0,
      fieldErrors: step4Errors
    });

    return errors;
  }

  /**
   * Marks all fields in all forms as touched to trigger validation display
   */
  markAllFieldsAsTouched(): void {
    this.markFormGroupAsTouched(this.formService.step1_overviewCompanyInformation);
    this.markFormGroupAsTouched(this.formService.step2_productPlantOverview);
    this.markFormGroupAsTouched(this.formService.step3_valueChain);
    this.markFormGroupAsTouched(this.formService.step4_saudization);
  }

  /**
   * Validates a form group and returns field errors
   */
  private validateFormGroup(
    formGroup: FormGroup,
    prefix: string = ''
  ): Map<string, IFormFieldError> {
    const errors = new Map<string, IFormFieldError>();
    this.collectFormErrors(formGroup, prefix, errors);
    return errors;
  }

  /**
   * Recursively collects errors from a form group
   */
  private collectFormErrors(
    control: AbstractControl,
    path: string,
    errors: Map<string, IFormFieldError>
  ): void {
    if (control instanceof FormControl) {
      if (control.invalid && control.errors) {
        const errorMessages = ErrorMessagesFactory.getErrorMessages(control, this.getFieldLabel(path));
        if (errorMessages.length > 0) {
          errors.set(path, {
            fieldPath: path,
            fieldLabel: this.getFieldLabel(path),
            errors: errorMessages
          });
        }
      }
    } else if (control instanceof FormGroup) {
      Object.keys(control.controls).forEach(key => {
        const childControl = control.get(key);
        if (childControl) {
          const childPath = path ? `${path}.${key}` : key;
          this.collectFormErrors(childControl, childPath, errors);
        }
      });
    } else if (control instanceof FormArray) {
      control.controls.forEach((arrayControl, index) => {
        const arrayPath = `${path}[${index}]`;
        this.collectFormErrors(arrayControl, arrayPath, errors);
      });
    }
  }

  /**
   * Marks a form group and all nested controls as touched
   */
  private markFormGroupAsTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      if (control) {
        if (control instanceof FormGroup) {
          this.markFormGroupAsTouched(control);
        } else if (control instanceof FormArray) {
          control.controls.forEach(arrayControl => {
            if (arrayControl instanceof FormGroup) {
              this.markFormGroupAsTouched(arrayControl);
            } else {
              arrayControl.markAsTouched();
            }
          });
        } else {
          control.markAsTouched();
        }
      }
    });
    formGroup.markAsTouched();
  }

  /**
   * Gets a human-readable label for a field path
   */
  private getFieldLabel(path: string): string {
    // Extract the last part of the path as the field name
    const parts = path.split('.');
    const fieldName = parts[parts.length - 1];

    // Convert camelCase to Title Case
    return fieldName
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  }

  /**
   * Checks if any step has validation errors
   */
  hasAnyErrors(validationErrors: Map<number, IStepValidationErrors>): boolean {
    for (const stepErrors of validationErrors.values()) {
      if (stepErrors.hasErrors) {
        return true;
      }
    }
    return false;
  }

  /**
   * Gets errors for a specific step
   */
  getStepErrors(
    validationErrors: Map<number, IStepValidationErrors>,
    stepNumber: number
  ): IStepValidationErrors | undefined {
    return validationErrors.get(stepNumber);
  }

  /**
   * Checks if a specific step has errors
   */
  hasStepErrors(
    validationErrors: Map<number, IStepValidationErrors>,
    stepNumber: number
  ): boolean {
    const stepErrors = validationErrors.get(stepNumber);
    return stepErrors?.hasErrors ?? false;
  }

  /**
   * Gets field errors for a specific field path
   */
  getFieldErrors(
    validationErrors: Map<number, IStepValidationErrors>,
    stepNumber: number,
    fieldPath: string
  ): string[] {
    const stepErrors = validationErrors.get(stepNumber);
    if (!stepErrors) {
      return [];
    }
    const fieldError = stepErrors.fieldErrors.get(fieldPath);
    return fieldError?.errors ?? [];
  }

  /**
   * Checks if a specific field has errors
   */
  hasFieldErrors(
    validationErrors: Map<number, IStepValidationErrors>,
    stepNumber: number,
    fieldPath: string
  ): boolean {
    return this.getFieldErrors(validationErrors, stepNumber, fieldPath).length > 0;
  }
}
