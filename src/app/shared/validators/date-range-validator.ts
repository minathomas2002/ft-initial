import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export const dateRangeValidator: ValidatorFn = (
  control: AbstractControl
): ValidationErrors | null => {

  const from = control.get('dateFrom')?.value;
  const to = control.get('dateTo')?.value;

  if (!from || !to) return null;

  const fromDate = new Date(from);
  const toDate = new Date(to);

  return toDate >= fromDate
    ? null
    : { dateRangeInvalid: true };
};