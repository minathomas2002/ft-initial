import { ChangeDetectionStrategy, Component, computed, effect, inject, input, model, signal } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ProductPlanFormService } from 'src/app/shared/services/plan/product-plan-form-service/product-plan-form-service';
import { EMaterialsFormControls } from 'src/app/shared/enums';
import { SaudizationMatrixComponent } from './saudization-matrix/saudization-matrix.component';
import { BaseErrorMessages } from '../../../base-components/base-error-messages/base-error-messages';
import { GroupInputWithCheckbox } from '../../../form/group-input-with-checkbox/group-input-with-checkbox';
import { FileuploadComponent } from '../../../utility-components/fileupload/fileupload.component';
import { IFieldInformation, IPageComment } from 'src/app/shared/interfaces/plans.interface';
import { TColors } from 'src/app/shared/interfaces';
import { CommentStateComponent } from '../../comment-state-component/comment-state-component';
import { FormsModule } from '@angular/forms';
import { GeneralConfirmationDialogComponent } from 'src/app/shared/components/utility-components/general-confirmation-dialog/general-confirmation-dialog.component';
import { TextareaModule } from 'primeng/textarea';
import { PlanStepBaseClass } from '../plan-step-base-class';
import { TCommentPhase } from '../product-localization-plan-wizard/product-localization-plan-wizard';
import { CommentInputComponent } from '../../comment-input/comment-input';

@Component({
  selector: 'app-plan-localization-step-04-saudization-form',
  imports: [
    ReactiveFormsModule,
    BaseErrorMessages,
    GroupInputWithCheckbox,
    FileuploadComponent,
    SaudizationMatrixComponent,
    CommentStateComponent,
    FormsModule,
    GeneralConfirmationDialogComponent,
    TextareaModule,
    CommentInputComponent
  ],
  templateUrl: './plan-localization-step-04-saudizationForm.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlanLocalizationStep04SaudizationForm extends PlanStepBaseClass {
  isViewMode = input<boolean>(false);
  isReviewMode = input<boolean>(false);
  readonly planFormService = inject(ProductPlanFormService);

  pageTitle = input<string>('Saudization');

  // Computed property to determine if file upload should be disabled
  isFileUploadDisabled = computed(() => this.isViewMode() || this.isReviewMode());

  formGroup = this.planFormService.step4_saudization;
  readonly EMaterialsFormControls = EMaterialsFormControls;

  selectedInputColor = input<TColors>('orange');
  commentPhase = model<TCommentPhase>('none');
  selectedInputs = model<IFieldInformation[]>([]);
  pageComments = input<IPageComment[]>([]);
  commentTitle = input<string>('Comments');
  correctedFieldIds = input<string[]>([]);

  // Files signal for file upload component
  files = signal<File[]>([]);

  // Implement abstract method from base class
  getFormGroup(): FormGroup {
    return this.formGroup;
  }

  constructor() {
    super();
    // Initialize files from form control value
    const attachmentsControl = this.getAttachmentsFormGroup()?.get(EMaterialsFormControls.attachments);
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
      const attachmentsControl = this.getAttachmentsFormGroup()?.get(EMaterialsFormControls.attachments);
      if (attachmentsControl) {
        const control = this.getValueControl(attachmentsControl);
        // Compare arrays by length and content to avoid infinite loops
        const currentValue = control.value;
        const isDifferent = !Array.isArray(currentValue) ||
          currentValue.length !== filesValue.length ||
          currentValue.some((file: File, index: number) => file !== filesValue[index]);

        if (isDifferent) {
          control.setValue(filesValue, { emitEvent: true });
          // Mark as dirty and trigger validation to show errors
          control.markAsDirty();
          control.updateValueAndValidity();
        }
      }
    });
  }

  // Expose base class methods as public for template access
  override onDeleteComments(): void {
    super.onDeleteComments();
  }

  override onConfirmDeleteComment(): void {
    super.onConfirmDeleteComment();
  }

  override onCancelDeleteComment(): void {
    super.onCancelDeleteComment();
  }

  override onSaveComment(): void {
    super.onSaveComment();
  }

  override onSaveEditedComment(): void {
    super.onSaveEditedComment();
  }

  override resetAllHasCommentControls(): void {
    super.resetAllHasCommentControls();
  }

  // Arrow function wrappers for comment functionality to pass to child components
  // Using arrow functions to preserve 'this' context when passed to child components
  upDateSelectedInputsWrapper = (value: boolean, fieldInformation: IFieldInformation, rowId?: string): void => {
    this.upDateSelectedInputs(value, fieldInformation, rowId);
  };

  highlightInputWrapper = (inputKey: string, rowId?: string): boolean => {
    return this.highlightInput(inputKey, rowId);
  };

  // Wrapper for getHasCommentControl to match expected signature (non-null return)
  // SaudizationMatrixComponent expects (formGroup: AbstractControl) => FormControl<boolean>
  getHasCommentControlWrapper = (formGroup: AbstractControl): FormControl<boolean> => {
    const result = this.getHasCommentControl(formGroup);
    if (!result) {
      // Return a dummy control if null (shouldn't happen in normal usage, but satisfies type requirement)
      return new FormControl<boolean>(false) as FormControl<boolean>;
    }
    return result;
  };

  // Arrow function wrapper to preserve 'this' context when passed to child components
  getValueControlWrapper = (formGroup: AbstractControl): FormControl<any> => {
    return this.getValueControl(formGroup);
  };

  // Arrow function wrappers to preserve 'this' context when passed to child components
  getYearFormGroupWrapper = (year: number): FormGroup | null => {
    return this.planFormService?.getYearFormGroup(year) || null;
  };

  getRowControlWrapper = (year: number, rowName: string): AbstractControl | null => {
    const yearGroup = this.getYearFormGroupWrapper(year);
    return yearGroup?.get(rowName) || null;
  };

  // Get form groups
  getSaudizationFormGroup(): FormGroup | undefined {
    return this.planFormService?.saudizationFormGroup;
  }

  getAttachmentsFormGroup(): FormGroup | undefined {
    return this.planFormService?.attachmentsFormGroup;
  }

  // Get year form group
  getYearFormGroup(year: number): FormGroup | null {
    return this.planFormService?.getYearFormGroup(year) || null;
  }

  // Get row control for a specific year
  getRowControl(year: number, rowName: string): AbstractControl | null {
    const yearGroup = this.getYearFormGroup(year);
    return yearGroup?.get(rowName) || null;
  }

  // Override hook method for step-specific initialization
  protected override initializeStepSpecificLogic(): void {
    // Ensure form service is available before accessing form groups
    if (!this.planFormService) {
      return;
    }

    // Check if attachments form group is available (may not be initialized during construction)
    const attachmentsFormGroup = this.planFormService.attachmentsFormGroup;
    if (!attachmentsFormGroup) {
      return;
    }

    // Initialize files from form control value
    const attachmentsControl = attachmentsFormGroup.get(EMaterialsFormControls.attachments);
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
      if (!this.planFormService) {
        return;
      }
      const attachmentsFormGroup = this.planFormService.attachmentsFormGroup;
      if (!attachmentsFormGroup) {
        return;
      }
      const attachmentsControl = attachmentsFormGroup.get(EMaterialsFormControls.attachments);
      if (attachmentsControl) {
        const control = this.getValueControl(attachmentsControl);
        // Compare arrays by length and content to avoid infinite loops
        const currentValue = control.value;
        const isDifferent = !Array.isArray(currentValue) ||
          currentValue.length !== filesValue.length ||
          currentValue.some((file: File, index: number) => file !== filesValue[index]);

        if (isDifferent) {
          control.setValue(filesValue, { emitEvent: true });
          // Mark as dirty and trigger validation to show errors
          control.markAsDirty();
          control.updateValueAndValidity();
        }
      }
    });
  }

  // Helper to get year control names
  getYearControlName(year: number): string {
    return `year${year}` as keyof typeof EMaterialsFormControls;
  }

  // Override upDateSelectedInputs to expose as public method
  override upDateSelectedInputs(value: boolean, fieldInformation: IFieldInformation, rowId?: string): void {
    super.upDateSelectedInputs(value, fieldInformation, rowId);
  }

  // Expose highlightInput as public method
  override highlightInput(inputKey: string, rowId?: string): boolean {
    return super.highlightInput(inputKey, rowId);
  }

  // Helper method to check if a field should be highlighted in view mode
  isFieldCorrected(inputKey: string, section?: string, rowId?: string): boolean {
    if (!this.isViewMode()) return false;
    // Check if any comment field matches this inputKey (and section if provided)
    const matchingFields = this.pageComments()
      .flatMap(c => c.fields)
      .filter(f => {
        const keyMatch = f.inputKey === inputKey || f.inputKey === `${section}.${inputKey}`;
        const sectionMatch = !section || f.section === section;
        const rowMatch = !rowId || f.id === rowId;
        return keyMatch && sectionMatch && rowMatch;
      });
    // If any matching field has an ID in correctedFieldIds, highlight it
    return matchingFields.some(f => f.id && this.correctedFieldIds().includes(f.id));
  }

  // Helper method to get combined comment text for display
  getCombinedCommentText(): string {
    if (!this.isViewMode() || this.pageComments().length === 0) return '';
    return this.pageComments().map(c => c.comment).join('\n\n');
  }

  // Helper method to get all field labels from comments
  getCommentedFieldLabels(): string {
    if (!this.isViewMode() || this.pageComments().length === 0) return '';
    const allLabels = this.pageComments().flatMap(c => c.fields.map(f => f.label));
    return [...new Set(allLabels)].join(', ');
  }
}

