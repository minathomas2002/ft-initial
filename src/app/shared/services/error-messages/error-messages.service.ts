import { Injectable, inject } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { I18nService } from '../i18n/i18n.service';

type ValidationMessageKey =
  | 'expectedLength'
  | 'required'
  | 'maxlength'
  | 'minlength'
  | 'max'
  | 'min'
  | 'inComplete'
  | 'totalExceeds100'
  | 'invalidPhoneNumber'
  | 'email'
  | 'alphabetsAndSpacesOnly'
  | 'invalidJobTitle'
  | 'invalidContactNumber'
  | 'passwordMismatch'
  | 'fileSizeExceeded'
  | 'dateRangeInvalid'
  | 'minQuantityError'
  | 'maxQuantityError';

@Injectable({
  providedIn: 'root',
})
export class ErrorMessagesService {
  private readonly i18n = inject(I18nService);

  getErrorMessages(control: AbstractControl | null, label: string): string[] {
    if (!this.hasErrors(control)) {
      return [];
    }

    return Object.entries(control!.errors!)
      .map(([errorKey, errorValue]) =>
        this.buildErrorMessage(errorKey, errorValue, label, control)
      )
      .filter((message): message is string => message !== null);
  }

  private hasErrors(control: AbstractControl | null): boolean {
    return !!control?.errors && control.dirty;
  }

  private buildErrorMessage(
    errorKey: string,
    errorValue: unknown,
    label: string,
    control: AbstractControl | null
  ): string | null {
    if (['expectedLength', 'description'].includes(errorKey)) {
      return null;
    }
    if (this.isValidationMessageKey(errorKey)) {
      return this.getValidationMessage(
        errorKey as ValidationMessageKey,
        errorValue,
        label,
        control
      );
    }

    return this.i18n.translate('common.validation.fallback');
  }

  private isValidationMessageKey(
    errorKey: string
  ): errorKey is ValidationMessageKey {
    const keys: ValidationMessageKey[] = [
      'expectedLength',
      'required',
      'maxlength',
      'minlength',
      'max',
      'min',
      'inComplete',
      'totalExceeds100',
      'invalidPhoneNumber',
      'email',
      'alphabetsAndSpacesOnly',
      'invalidJobTitle',
      'invalidContactNumber',
      'passwordMismatch',
      'fileSizeExceeded',
      'dateRangeInvalid',
      'minQuantityError',
      'maxQuantityError',
    ];
    return keys.includes(errorKey as ValidationMessageKey);
  }

  private getValidationMessage(
    errorKey: ValidationMessageKey,
    errorValue: unknown,
    label: string,
    control: AbstractControl | null
  ): string {
    const err = errorValue as Record<string, unknown>;
    const isNumeric = this.isNumericControl(control);

    switch (errorKey) {
      case 'expectedLength':
        return this.i18n.translate('common.validation.expectedLength', {
          label,
          expectedLength: String(err?.['expectedLength'] ?? ''),
        });
      case 'required':
        return this.i18n.translate('common.validation.required', { label });
      case 'maxlength':
        return this.i18n.translate(
          isNumeric ? 'common.validation.maxlengthDigits' : 'common.validation.maxlength',
          { label, count: String(err?.['requiredLength'] ?? '') }
        );
      case 'minlength':
        return this.i18n.translate(
          isNumeric ? 'common.validation.minlengthDigits' : 'common.validation.minlength',
          { label, count: String(err?.['requiredLength'] ?? '') }
        );
      case 'max':
        return this.i18n.translate('common.validation.max', {
          label,
          max: String(err?.['max'] ?? ''),
        });
      case 'min':
        return this.i18n.translate('common.validation.min', {
          label,
          min: String(err?.['min'] ?? ''),
        });
      case 'inComplete':
        return this.i18n.translate('common.validation.inComplete', { label });
      case 'totalExceeds100':
        return this.i18n.translate('common.validation.totalExceeds100', {
          label,
        });
      case 'invalidPhoneNumber':
        return this.i18n.translate('common.validation.invalidPhoneNumber', {
          label,
        });
      case 'email':
        return this.i18n.translate('common.validation.email', { label });
      case 'alphabetsAndSpacesOnly':
        return this.i18n.translate('common.validation.alphabetsAndSpacesOnly', {
          label,
        });
      case 'invalidJobTitle':
        return this.i18n.translate('common.validation.invalidJobTitle', {
          label,
        });
      case 'invalidContactNumber':
        return this.i18n.translate('common.validation.invalidContactNumber');
      case 'passwordMismatch':
        return this.i18n.translate('common.validation.passwordMismatch');
      case 'fileSizeExceeded': {
        const maxSize = (err?.['maxSize'] as number) ?? 0;
        const maxSizeMB = Math.round(maxSize / (1024 * 1024));
        return this.i18n.translate('common.validation.fileSizeExceeded', {
          label,
          maxSizeMB: String(maxSizeMB),
        });
      }
      case 'dateRangeInvalid':
        return this.i18n.translate('common.validation.dateRangeInvalid', {
          label,
        });
      case 'minQuantityError':
        return (
          (err?.['message'] as string) ??
          this.i18n.translate('common.validation.minQuantityError', { label })
        );
      case 'maxQuantityError':
        return (
          (err?.['message'] as string) ??
          this.i18n.translate('common.validation.maxQuantityError', { label })
        );
      default:
        return this.i18n.translate('common.validation.fallback');
    }
  }

  private isNumericControl(control: AbstractControl | null): boolean {
    const value = control?.value;
    if (value == null) return false;
    if (typeof value === 'number') return true;
    if (typeof value === 'string') return /^\d+$/.test(value);
    return false;
  }
}
