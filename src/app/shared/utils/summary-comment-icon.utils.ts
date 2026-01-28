import { AbstractControl, FormArray, FormGroup } from '@angular/forms';

const RESUBMIT_CHANGED_ONCE_FLAG = '__ftResubmitChangedOnce';

function hasResubmitChangedOnceFlag(control: AbstractControl | null | undefined): boolean {
  if (!control) return false;
  return !!(control as any)[RESUBMIT_CHANGED_ONCE_FLAG];
}

export function isControlDirty(
  control: AbstractControl | null | undefined,
  valueControlName: string = 'value'
): boolean {
  if (!control) return false;

  if (control instanceof FormGroup) {
    const valueControl = control.get(valueControlName);
    return !!(
      valueControl?.dirty ||
      control.dirty ||
      hasResubmitChangedOnceFlag(valueControl) ||
      hasResubmitChangedOnceFlag(control)
    );
  }

  return !!(control.dirty || hasResubmitChangedOnceFlag(control));
}

export function findRowGroupByRowId(
  array: FormArray | null | undefined,
  rowId: string | undefined,
  rowIdControlName: string = 'rowId'
): FormGroup | null {
  if (!array || rowId === undefined) return null;

  const idx = array.controls.findIndex(
    (ctrl) => (ctrl as FormGroup).get(rowIdControlName)?.value === rowId
  );

  if (idx < 0) return null;
  return array.at(idx) as FormGroup;
}

export function shouldHideSummaryCommentIcon(
  wizardMode: string | null | undefined,
  control: AbstractControl | null | undefined,
  valueControlName: string = 'value'
): boolean {
  return wizardMode === 'resubmit' && isControlDirty(control, valueControlName);
}
