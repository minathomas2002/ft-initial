import { AbstractControl } from "@angular/forms";

export const VALIDATION_MESSAGES = {

  expectedLength: (label: string, error: { expectedLength: string }) =>
    `${label} must be ${error.expectedLength} digits`,

  required: (label: string) =>
    `${label} is required`,

  maxlength: (label: string, error: any) =>
    `${label} must be less than ${error.requiredLength} characters`,

  minlength: (label: string, error: any) =>
    `${label} must be at least ${error.requiredLength} characters`,

  max: (label: string, error: any) =>
    `${label} must be less than ${error.max}`,

  min: (label: string, error: any) =>
    `${label} must be greater than or equal to ${error.min}`,

  inComplete: (label: string) =>
    `${label} has missing or invalid fields`,

  totalExceeds100: (label: string) =>
    `${label} must be 100%`,

  invalidPhoneNumber: (label: string, error: any) =>
    `Please enter a valid ${label}`,

  email: (label: string) =>
    `${label} is invalid`,

  alphabetsAndSpacesOnly: (label: string) =>
    `Please enter a valid ${label} containing only letters.`,

  invalidJobTitle: (label: string) =>
    `Please enter a valid ${label}.`,

  invalidContactNumber: (label: string) =>
    `Please enter a valid mobile number (e.g., 05XXXXXXXX).`,

  passwordMismatch: (label: string) =>
    `Passwords do not match`,

  fileSizeExceeded: (label: string, error: { maxSize: number; actualSize: number }) => {
    const maxSizeMB = Math.round(error.maxSize / (1024 * 1024));
    return `All uploaded files in ${label} should be less than ${maxSizeMB} MB`;
  },

  dateRangeInvalid: (label: string) =>
    `${label} must be after the start date`,

  minQuantityError: (label: string, error: any) =>
    error?.message || `${label} must be less than max quantity`,

  maxQuantityError: (label: string, error: any) =>
    error?.message || `${label} must be greater than min quantity`,
} as const;

type ValidationMessageKey = keyof typeof VALIDATION_MESSAGES;
type ValidationMessageFactory = typeof VALIDATION_MESSAGES[ValidationMessageKey];
export class ErrorMessagesFactory {
  static getErrorMessages(
    control: AbstractControl | null,
    label: string
  ): string[] {
    if (!this.hasErrors(control)) {
      return [];
    }

    return Object.entries(control!.errors!)
      .map(([errorKey, errorValue]) =>
        this.buildErrorMessage(errorKey, errorValue, label, control)
      )
      .filter((message): message is string => message !== null);
  }

  private static hasErrors(control: AbstractControl | null): boolean {
    return !!control?.errors && control.dirty;
  }

  private static buildErrorMessage(
    errorKey: string,
    errorValue: any,
    label: string,
    control: AbstractControl | null
  ): string | null {
    if (['expectedLength', 'description'].includes(errorKey)) {
      return null;
    }
    if (this.isValidationMessageKey(errorKey)) {
      return this.getValidationMessage(errorKey, errorValue, label, control);
    }

    return this.getFallbackMessage();
  }

  private static isValidationMessageKey(
    errorKey: string
  ): errorKey is ValidationMessageKey {
    return errorKey in VALIDATION_MESSAGES;
  }

  private static getValidationMessage(
    errorKey: ValidationMessageKey,
    errorValue: any,
    label: string,
    control: AbstractControl | null
  ): string {
    const messageFactory = VALIDATION_MESSAGES[errorKey];
    const message = this.callMessageFactory(messageFactory, label, errorValue);

    if (this.isNumericControl(control)) {
      return message
        .replace(/\bcharacters\b/g, 'digits')
        .replace(/\bcharacter\b/g, 'digit');
    }

    return message;
  }

  private static callMessageFactory(
    messageFactory: ValidationMessageFactory,
    label: string,
    errorValue: any
  ): string {
    const isSingleParameterFactory = messageFactory.length === 1;

    if (isSingleParameterFactory) {
      return (messageFactory as (label: string) => string)(label);
    }

    return messageFactory(label, errorValue);
  }

  private static isNumericControl(control: AbstractControl | null): boolean {
    const value = control?.value;
    if (value == null) return false;
    if (typeof value === 'number') return true;
    if (typeof value === 'string') return /^\d+$/.test(value);
    return false;
  }

  private static getFallbackMessage(): string {
    return "This field is invalid";
  }
}
