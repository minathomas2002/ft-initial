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

    // First, count errors in child controls
    const childErrorCount = this.countChildControlErrors(formGroup);
    
    // Count errors on the FormGroup itself only if:
    // 1. It's interacted with
    // 2. It has errors
    // 3. The errors are NOT cross-field validation errors (like quantityRange) that are already represented by individual field errors
    // This prevents double-counting when cross-field validators set errors on both the FormGroup and individual controls
    if ((formGroup.dirty || formGroup.touched) && formGroup.errors) {
      const formGroupErrors = formGroup.errors;
      const errorKeys = Object.keys(formGroupErrors);
      
      // Check if this is a cross-field validation error that's already represented by child control errors
      // Known cross-field validation error keys: quantityRange, dateRange, etc.
      const isCrossFieldError = errorKeys.some(key => 
        key === 'quantityRange' || 
        key === 'dateRange' || 
        key.toLowerCase().includes('range') ||
        key.toLowerCase().includes('crossfield')
      );
      
      // Only count FormGroup errors if they're not cross-field errors OR if there are no child control errors
      // This ensures cross-field validations that set errors on individual fields are only counted once
      if (!isCrossFieldError || childErrorCount === 0) {
        errorCount += errorKeys.length;
      }
    }
    
    // Add child control errors
    errorCount += childErrorCount;

    return errorCount;
  }

  /**
   * Counts errors in child controls of a FormGroup (recursively)
   * @param formGroup The FormGroup to count child errors for
   * @returns The total number of errors in child controls
   */
  private countChildControlErrors(formGroup: FormGroup): number {
    let errorCount = 0;
    
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      if (!control) return;

      if (control instanceof FormGroup) {
        // Recursively count errors in FormGroup children
        // Count errors in child controls regardless of FormGroup touched state
        errorCount += this.countChildControlErrors(control);
        return;
      }

      if (control instanceof FormArray) {
        // Only count individual invalid controls within the FormArray, NOT the FormArray itself
        // This ensures we count each invalid control separately (e.g., if 3 controls are invalid, count = 3, not 4)
        control.controls.forEach(child => {
          if (child instanceof FormGroup) {
            // Recursively count errors in FormGroup children
            // Count all invalid controls that are dirty OR touched, regardless of parent FormGroup state
            errorCount += this.countChildControlErrors(child);
          } else if (child instanceof FormArray) {
            // Nested FormArrays: recurse to count individual controls only
            child.controls.forEach(nestedChild => {
              if (nestedChild instanceof FormGroup) {
                errorCount += this.countChildControlErrors(nestedChild);
              } else if (nestedChild instanceof FormControl) {
                // Count if control is invalid AND (dirty)
                if ((nestedChild.dirty) && nestedChild.invalid) {
                  errorCount++;
                }
              }
            });
          } else if (child instanceof FormControl) {
            // Count if control is invalid AND (dirty OR touched)
            if ((child.dirty) && child.invalid) {
              errorCount++;
            }
          }
        });
        return;
      }

      if (control instanceof FormControl) {
        // Count if control is invalid AND (dirty OR touched)
        if ((control.dirty) && control.invalid) {
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
            hasCommentControl.setValue(false, { emitEvent: true });
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

