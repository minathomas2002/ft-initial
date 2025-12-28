import { ChangeDetectionStrategy, Component, effect, inject, input, signal } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ProductPlanFormService } from 'src/app/shared/services/plan/materials-form-service/product-plan-form-service';
import { EMaterialsFormControls } from 'src/app/shared/enums';
import { SaudizationMatrixComponent } from './saudization-matrix/saudization-matrix.component';
import { BaseErrorMessages } from '../../../base-components/base-error-messages/base-error-messages';
import { GroupInputWithCheckbox } from '../../../form/group-input-with-checkbox/group-input-with-checkbox';
import { FileuploadComponent } from '../../../utility-components/fileupload/fileupload.component';

@Component({
  selector: 'app-plan-localization-step-04-saudization-form',
  imports: [
    ReactiveFormsModule,
    BaseErrorMessages,
    GroupInputWithCheckbox,
    FileuploadComponent,
    SaudizationMatrixComponent,
  ],
  templateUrl: './plan-localization-step-04-saudizationForm.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlanLocalizationStep04SaudizationForm {
  isViewMode = input<boolean>(false);
  private readonly productPlanFormService = inject(ProductPlanFormService);

  formGroup = this.productPlanFormService.step4_saudization;
  readonly EMaterialsFormControls = EMaterialsFormControls;

  // Show checkbox signal (controls visibility of comment checkboxes)
  showCheckbox = signal(false);

  // Files signal for file upload component
  files = signal<File[]>([]);

  // Helper methods - delegate to ProductPlanFormService
  // Using arrow functions to preserve 'this' context when passed to child components
  getValueControl = (formGroup: AbstractControl): FormControl<any> => {
    return this.productPlanFormService.getValueControl(formGroup);
  };

  getHasCommentControl = (formGroup: AbstractControl): FormControl<boolean> => {
    return this.productPlanFormService.getHasCommentControl(formGroup);
  };

  // Get form groups
  getSaudizationFormGroup = (): FormGroup => {
    return this.productPlanFormService.saudizationFormGroup;
  };

  getAttachmentsFormGroup = (): FormGroup => {
    return this.productPlanFormService.attachmentsFormGroup;
  };

  // Get year form group
  getYearFormGroup = (year: number): FormGroup | null => {
    return this.productPlanFormService.getYearFormGroup(year);
  };

  // Get row control for a specific year
  getRowControl = (year: number, rowName: string): AbstractControl | null => {
    const yearGroup = this.getYearFormGroup(year);
    return yearGroup?.get(rowName) || null;
  };

  constructor() {
    // Initialize files from form control value
    const attachmentsControl = this.getAttachmentsFormGroup().get(EMaterialsFormControls.attachments);
    if (attachmentsControl) {
      const control = this.getValueControl(attachmentsControl);
      const formValue = control.value;
      if (Array.isArray(formValue)) {
        this.files.set(formValue);
      }
    }

    // Sync files signal changes to form control
    effect(() => {
      const filesValue = this.files();
      const attachmentsControl = this.getAttachmentsFormGroup().get(EMaterialsFormControls.attachments);
      if (attachmentsControl) {
        const control = this.getValueControl(attachmentsControl);
        // Only update if different to avoid infinite loops
        if (control.value !== filesValue) {
          control.setValue(filesValue, { emitEvent: false });
        }
      }
    });
  }

  // Helper to get year control names
  getYearControlName(year: number): string {
    return `year${year}` as keyof typeof EMaterialsFormControls;
  }
}

