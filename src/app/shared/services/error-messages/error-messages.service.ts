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
  | 'maxQuantityError'
  | 'invalidRegisteredVendorIDLength';

@Injectable({
  providedIn: 'root',
})
export class ErrorMessagesService {
  private readonly i18n = inject(I18nService);

  getErrorMessages(control: AbstractControl | null, label: string): string[] {
    if (!this.hasErrors(control)) {
      return [];
    }

    const safeLabel = typeof label === 'string' ? label : 'Field';
    const messages = Object.entries(control!.errors!)
      .map(([errorKey, errorValue]) =>
        this.buildErrorMessage(errorKey, errorValue, safeLabel, control)
      )
      .filter((message): message is string => message !== null && typeof message === 'string');

    // #region agent log
    if (messages.length > 0 && control!.errors!['required']) {
      const payload = {sessionId:'bd8107',location:'error-messages.service.ts:getErrorMessages',message:'getErrorMessages with required error',data:{labelType:typeof label,labelValue:label,labelIsObject:typeof label==='object',messages,messagesTypes:messages.map(m=>typeof m),controlErrors:control!.errors},timestamp:Date.now(),hypothesisId:'H1'};
      fetch('http://127.0.0.1:7242/ingest/5b034c01-0b5b-4320-b714-d662075e070b',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'bd8107'},body:JSON.stringify(payload)}).catch(()=>{});
      if (typeof label !== 'string') console.warn('[DEBUG-bd8107] getErrorMessages label was not string:', payload);
    }
    // #endregion

    return messages;
  }

  private hasErrors(control: AbstractControl | null): boolean {
    const hasErr = !!control?.errors && (control.dirty || control.touched);
    // #region agent log
    if (control?.errors?.['required'] && !hasErr && control.invalid) {
      const payload = {sessionId:'bd8107',location:'error-messages.service.ts:hasErrors',message:'hasErrors false for required control',data:{dirty:control.dirty,touched:control.touched,invalid:control.invalid},timestamp:Date.now(),hypothesisId:'H4'};
      fetch('http://127.0.0.1:7242/ingest/5b034c01-0b5b-4320-b714-d662075e070b',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'bd8107'},body:JSON.stringify(payload)}).catch(()=>{});
      console.warn('[DEBUG-bd8107] hasErrors blocked:', payload);
    }
    // #endregion
    return hasErr;
  }

  private buildErrorMessage(
    errorKey: string,
    errorValue: unknown,
    label: string,
    control: AbstractControl | null
  ): string | null {
    const safeLabel = typeof label === 'string' ? label : 'Field';
    if (['expectedLength', 'description'].includes(errorKey)) {
      return null;
    }
    if (this.isValidationMessageKey(errorKey)) {
      return this.getValidationMessage(
        errorKey as ValidationMessageKey,
        errorValue,
        safeLabel,
        control
      );
    }

    if (errorValue && typeof errorValue === 'object' && typeof (errorValue as Record<string, unknown>)?.['message'] === 'string') {
      return (errorValue as Record<string, unknown>)['message'] as string;
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
      'invalidRegisteredVendorIDLength',
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
      case 'required': {
        const result = this.i18n.translate('common.validation.required', { label });
        // #region agent log
        if (typeof label !== 'string') {
          fetch('http://127.0.0.1:7242/ingest/5b034c01-0b5b-4320-b714-d662075e070b',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'bd8107'},body:JSON.stringify({sessionId:'bd8107',location:'error-messages.service.ts:getValidationMessage',message:'required case with non-string label',data:{labelType:typeof label,labelValue:JSON.stringify(label),resultType:typeof result,result},timestamp:Date.now(),hypothesisId:'H1'})}).catch(()=>{});
        }
        // #endregion
        return result;
      }
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
      case 'invalidRegisteredVendorIDLength':
        return this.i18n.translate('common.validation.expectedLength', {
          label,
          expectedLength: String(control!.errors?.['expectedLength'] ?? ''),
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
      case 'minQuantityError': {
        const msg = err?.['message'];
        return (typeof msg === 'string' ? msg : null) ?? this.i18n.translate('common.validation.minQuantityError', { label });
      }
      case 'maxQuantityError': {
        const msg = err?.['message'];
        return (typeof msg === 'string' ? msg : null) ?? this.i18n.translate('common.validation.maxQuantityError', { label });
      }
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
