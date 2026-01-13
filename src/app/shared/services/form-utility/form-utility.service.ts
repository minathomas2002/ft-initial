import { Injectable } from '@angular/core';
import { FormGroup, FormArray, AbstractControl, FormControl } from '@angular/forms';
import { EMaterialsFormControls } from 'src/app/shared/enums';

@Injectable({
  providedIn: 'root',
})
export class FormUtilityService {
  /**
   * Recursively counts validation errors in a FormGroup
   * @param formGroup The FormGroup to count errors for
   * @returns The total number of validation errors found
   */
  countFormErrors(formGroup: FormGroup): number {
    if (!formGroup || !(formGroup instanceof FormGroup)) {
      return 0;
    }

    let errorCount = 0;

    // Count errors on the FormGroup itself only if it's interacted with
    if ((formGroup.dirty || formGroup.touched) && formGroup.errors) {
      errorCount += Object.keys(formGroup.errors).length;
    }
    // Recursively count errors in all controls
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      if (!control) return;

      if (control instanceof FormGroup) {
        errorCount += this.countFormErrors(control);
        return;
      }

      if (control instanceof FormArray) {
        // Count array-level errors (if any) only if interacted with
        if ((control.dirty || control.touched) && control.invalid && control.errors) {
          errorCount += Object.keys(control.errors).length;
        }

        // IMPORTANT: recurse into array items (tables/rows)
        control.controls.forEach((arrayControl) => {
          if (arrayControl instanceof FormGroup) {
            errorCount += this.countFormErrors(arrayControl);
          } else if (arrayControl instanceof FormControl) {
            if ((arrayControl.dirty || arrayControl.touched) && arrayControl.invalid) {
              errorCount++;
            }
          }
        });
        return;
      }

      if (control instanceof FormControl) {
        if ((control.dirty || control.touched) && control.invalid) {
          errorCount++;
        }
      }
    });

    return errorCount;
  }

  /**
   * Recursively reset all hasComment FormControls in a control
   * @param control The AbstractControl (FormGroup or FormArray) to reset hasComment controls in
   */
  resetHasCommentControls(control: AbstractControl): void {
    if (control instanceof FormGroup) {
      Object.keys(control.controls).forEach(key => {
        const childControl = control.controls[key];

        // Check if this is a FormGroup that contains hasComment
        if (childControl instanceof FormGroup) {
          const hasCommentControl = childControl.get(EMaterialsFormControls.hasComment);
          if (hasCommentControl instanceof FormControl) {
            // Reset hasComment to false
            hasCommentControl.setValue(false, { emitEvent: false });
          }
          // Continue recursively to handle nested structures
          this.resetHasCommentControls(childControl);
        } else if (childControl instanceof FormArray) {
          // Handle FormArrays
          childControl.controls.forEach(arrayControl => {
            this.resetHasCommentControls(arrayControl);
          });
        }
      });
    } else if (control instanceof FormArray) {
      control.controls.forEach(arrayControl => {
        this.resetHasCommentControls(arrayControl);
      });
    }
  }

  /**
   * Recursively disable all hasComment FormControls in a control
   * @param control The AbstractControl (FormGroup or FormArray) to disable hasComment controls in
   */
  disableHasCommentControls(control: AbstractControl): void {
    if (control instanceof FormGroup) {
      Object.keys(control.controls).forEach(key => {
        const childControl = control.controls[key];

        // Check if this is a FormGroup that contains hasComment
        if (childControl instanceof FormGroup) {
          const hasCommentControl = childControl.get(EMaterialsFormControls.hasComment);
          if (hasCommentControl instanceof FormControl) {
            // Disable hasComment control
            hasCommentControl.disable({ emitEvent: false });
          }
          // Continue recursively to handle nested structures
          this.disableHasCommentControls(childControl);
        } else if (childControl instanceof FormArray) {
          // Handle FormArrays
          childControl.controls.forEach(arrayControl => {
            this.disableHasCommentControls(arrayControl);
          });
        }
      });
    } else if (control instanceof FormArray) {
      control.controls.forEach(arrayControl => {
        this.disableHasCommentControls(arrayControl);
      });
    }
  }

  /**
   * Recursively enable all hasComment FormControls in a control
   * @param control The AbstractControl (FormGroup or FormArray) to enable hasComment controls in
   */
  enableHasCommentControls(control: AbstractControl): void {
    if (control instanceof FormGroup) {
      Object.keys(control.controls).forEach(key => {
        const childControl = control.controls[key];

        // Check if this is a FormGroup that contains hasComment
        if (childControl instanceof FormGroup) {
          const hasCommentControl = childControl.get(EMaterialsFormControls.hasComment);
          if (hasCommentControl instanceof FormControl) {
            // Enable hasComment control
            hasCommentControl.enable({ emitEvent: false });
          }
          // Continue recursively to handle nested structures
          this.enableHasCommentControls(childControl);
        } else if (childControl instanceof FormArray) {
          // Handle FormArrays
          childControl.controls.forEach(arrayControl => {
            this.enableHasCommentControls(arrayControl);
          });
        }
      });
    } else if (control instanceof FormArray) {
      control.controls.forEach(arrayControl => {
        this.enableHasCommentControls(arrayControl);
      });
    }
  }
}

