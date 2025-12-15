import { AbstractControl } from "@angular/forms";

export const VALIDATION_MESSAGES = {
  required: (label: string) =>
    `${label} is required`,

  maxlength: (label: string, error: any) =>
    `${label} must be less than ${error.requiredLength} characters`,

  minlength: (label: string, error: any) =>
    `${label} must be at least ${error.requiredLength} characters`,

  email: (label: string) =>
    `${label} is invalid`,
} as const;

type ValidationMessageKey = keyof typeof VALIDATION_MESSAGES;
type ValidationMessageFactory = typeof VALIDATION_MESSAGES[ValidationMessageKey];
type ErrorWithMessage = { message: string };

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
        this.buildErrorMessage(errorKey, errorValue, label)
      )
      .filter((message): message is string => message !== null);
  }

  private static hasErrors(control: AbstractControl | null): boolean {
    return !!control?.errors && control.dirty;
  }

  private static buildErrorMessage(
    errorKey: string,
    errorValue: any,
    label: string
  ): string | null {
    if (this.isValidationMessageKey(errorKey)) {
      return this.getValidationMessage(errorKey, errorValue, label);
    }

    if (this.hasMessageProperty(errorValue)) {
      return errorValue.message;
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
    label: string
  ): string {
    const messageFactory = VALIDATION_MESSAGES[errorKey];
    return this.callMessageFactory(messageFactory, label, errorValue);
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

  private static hasMessageProperty(
    errorValue: any
  ): errorValue is ErrorWithMessage {
    return (
      errorValue &&
      typeof errorValue === "object" &&
      "message" in errorValue
    );
  }

  private static getFallbackMessage(): string {
    return "This field is invalid";
  }
}
