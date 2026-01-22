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
import { PlanStore } from 'src/app/shared/stores/plan/plan.store';
import { ConditionalColorClassDirective } from 'src/app/shared/directives';

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
    CommentInputComponent,
    ConditionalColorClassDirective
  ],
  templateUrl: './plan-localization-step-04-saudizationForm.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlanLocalizationStep04SaudizationForm extends PlanStepBaseClass {
  isViewMode = input<boolean>(false);
  isReviewMode = input<boolean>(false);
  override readonly planStore = inject(PlanStore);
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
  correctedFields = input<IFieldInformation[]>([]);
  showCommentState = input<boolean>(false);

  // Check if investor comment exists for this step
  hasInvestorComment = computed((): boolean => {
    if (!this.isResubmitMode()) return false;
    const formGroup = this.getFormGroup();
    const investorCommentControl = formGroup.get('investorComment') as FormControl<string> | null;
    return !!(investorCommentControl?.value && investorCommentControl.value.trim().length > 0);
  });

  // Handle start editing for investor comment
  onStartEditing(): void {
    if (this.isResubmitMode()) {
      this.commentPhase.set('editing');

    }
  }

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

  // Implement abstract method from base class to get form control for a field (handles year-based rows)
  getControlForField(field: IFieldInformation): FormControl<any> | null {
    const { inputKey, id: rowId } = field;

    if (!rowId) {
      return null;
    }

    const saudizationFormGroup = this.getSaudizationFormGroup();
    if (!saudizationFormGroup) {
      return null;
    }

    const { baseControlName, yearNumber } = this.parseSaudizationInputKey(inputKey);
    const yearsToCheck = this.getYearsToCheck(yearNumber);

    return this.findControlInYears(saudizationFormGroup, yearsToCheck, baseControlName, rowId);
  }

  /**
   * Parses the saudization input key to extract base control name and year number.
   * Input key format: "controlName_yearX" (e.g., "annualHeadcount_year1")
   */
  private parseSaudizationInputKey(inputKey: string): { baseControlName: string; yearNumber: number | null } {
    const yearMatch = inputKey.match(/_year(\d+)$/);
    const baseControlName = yearMatch ? inputKey.replace(/_year\d+$/, '') : inputKey;
    const yearNumber = yearMatch ? parseInt(yearMatch[1], 10) : null;

    return { baseControlName, yearNumber };
  }

  /**
   * Gets the list of years to check based on the year number.
   * If yearNumber is provided, check only that year; otherwise check all years (1-7).
   */
  private getYearsToCheck(yearNumber: number | null): number[] {
    return yearNumber ? [yearNumber] : [1, 2, 3, 4, 5, 6, 7];
  }

  /**
   * Finds the control in the specified years by matching base control name and rowId.
   */
  private findControlInYears(
    saudizationFormGroup: FormGroup,
    yearsToCheck: number[],
    baseControlName: string,
    rowId: string
  ): FormControl<any> | null {
    for (const year of yearsToCheck) {
      const yearGroup = saudizationFormGroup.get(`year${year}`);
      if (!(yearGroup instanceof FormGroup)) {
        continue;
      }

      const rowControl = yearGroup.get(baseControlName);
      if (!(rowControl instanceof FormGroup)) {
        continue;
      }

      // Check if the rowId matches (rowId is stored as a value in the rowControl)
      const controlRowId = rowControl.get('rowId')?.value;
      if (controlRowId === rowId) {
        return this.getValueControl(rowControl);
      }
    }

    return null;
  }

}

