import { ChangeDetectionStrategy, Component, computed, effect, inject, input, model, signal } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ProductPlanFormService } from 'src/app/shared/services/plan/product-plan-form-service/product-plan-form-service';
import { EMaterialsFormControls, EPlanPageTitle } from 'src/app/shared/enums';
import { SaudizationMatrixComponent } from './saudization-matrix/saudization-matrix.component';
import { BaseErrorMessages } from '../../../base-components/base-error-messages/base-error-messages';
import { GroupInputWithCheckbox } from '../../../form/group-input-with-checkbox/group-input-with-checkbox';
import { FileuploadComponent } from '../../../utility-components/fileupload/fileupload.component';
import { IFieldInformation, IPageComment, IProductPlanResponse } from 'src/app/shared/interfaces/plans.interface';
import { getFieldValueFromProductPlanResponse } from 'src/app/shared/utils/plan-original-value-from-response';
import { TColors } from 'src/app/shared/interfaces';
import { CommentStateComponent } from '../../comment-state-component/comment-state-component';
import { FormsModule } from '@angular/forms';
import { GeneralConfirmationDialogComponent } from 'src/app/shared/components/utility-components/general-confirmation-dialog/general-confirmation-dialog.component';
import { TextareaModule } from 'primeng/textarea';
import { PlanStepBaseClass } from '../plan-step-base-class';
import { TCommentPhase } from 'src/app/shared/types/plan-comments.types';
import { CommentInputComponent } from '../../comment-input/comment-input';
import { PlanStore } from 'src/app/shared/stores/plan/plan.store';
import { ConditionalColorClassDirective } from 'src/app/shared/directives';
import { SAUDIZATION_ROW_KEYS } from './saudization.constants';
import { TranslatePipe } from 'src/app/shared/pipes/translate.pipe';

@Component({
  selector: 'app-plan-localization-step-04-saudization-form',
  imports: [
    TranslatePipe,
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
    ConditionalColorClassDirective,
  ],
  templateUrl: './plan-localization-step-04-saudizationForm.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlanLocalizationStep04SaudizationForm extends PlanStepBaseClass {
  isViewMode = input<boolean>(false);
  isReviewMode = input<boolean>(false);
  override readonly planStore = inject(PlanStore);
  readonly planFormService = inject(ProductPlanFormService);

  pageTitle = input<EPlanPageTitle>(EPlanPageTitle.Saudization);

  // Computed property to determine if file upload should be disabled
  // In resubmit mode, allow editing only if the attachments field is part of the corrected fields.
  isFileUploadDisabled = computed(() => {
    if (this.isReviewMode()) return true;
    if (this.isViewMode() && !this.isResubmitMode()) return true;
    if (this.isResubmitMode()) {
      const canEditAttachments = this.correctedFields().some(
        f => f.section === 'attachments' && f.inputKey === 'attachments'
      );
      return !canEditAttachments;
    }
    return false;
  });

  formGroup = this.planFormService.step4_saudization;

  selectedInputColor = input<TColors>('orange');
  commentPhase = model<TCommentPhase>('none');
  selectedInputs = model<IFieldInformation[]>([]);
  pageComments = input<IPageComment[]>([]);
  commentTitle = input<string>('Comments');
  correctedFieldIds = input<string[]>([]);
  correctedFields = input<IFieldInformation[]>([]);
  showCommentState = input<boolean>(false);
  originalPlanResponse = input<IProductPlanResponse | null>(null);

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
  attachmentsLabel = computed(() => this.i18nService.translate('plans.form.attachments'));

  // Implement abstract method from base class
  getFormGroup(): FormGroup {
    return this.formGroup;
  }

  constructor() {
    super();
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
        const currentEmpty = currentValue == null || (Array.isArray(currentValue) && currentValue.length === 0);
        const filesEmpty = filesValue == null || (Array.isArray(filesValue) && filesValue.length === 0);
        const isDifferent = (currentEmpty && filesEmpty)
          ? false
          : !Array.isArray(currentValue) ||
          currentValue.length !== filesValue.length ||
          currentValue.some((file: File, index: number) => file !== filesValue[index]);

        if (isDifferent) {
          control.setValue(filesValue);
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

  override onSaveEditedComment(): void {
    super.onSaveEditedComment();
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


  }

  // Helper to get year control names
  getYearControlName(year: number): string {
    return `year${year}` as keyof typeof EMaterialsFormControls;
  }

  // Override upDateSelectedInputs to expose as public method
  override upDateSelectedInputs(value: boolean, fieldInformation: IFieldInformation, rowId?: string): void {
    super.upDateSelectedInputs(value, fieldInformation, rowId);
  }

  /**
   * Override to support legacy formats (year "1"-"7", controlName_yearN) for backward compatibility
   * when matching correctedFields. Primary format is yearKey (year1-year7) + id.
   */
  override highlightInput(inputKey: string, rowId?: string): boolean {
    if (super.highlightInput(inputKey, rowId)) return true;
    if (!rowId || !this.isResubmitMode()) return false;
    const yearKeyMatch = inputKey.match(/^year([1-7])$/);
    if (yearKeyMatch) {
      return super.highlightInput(yearKeyMatch[1], rowId);
    }
    return false;
  }

  getOriginalFieldValueFromPlanResponse(field: IFieldInformation): any {
    return getFieldValueFromProductPlanResponse(field, this.originalPlanResponse());
  }

  // Implement abstract method from base class to get form control for a field (handles year-based rows)
  getControlForField(field: IFieldInformation): FormControl<any> | null {
    const { inputKey, id: rowId } = field;

    // Handle non-matrix fields (e.g., attachments)
    if (field.section === 'attachments' && inputKey === EMaterialsFormControls.attachments) {
      const attachmentsFormGroup = this.getAttachmentsFormGroup();
      const attachmentsControl = attachmentsFormGroup?.get(EMaterialsFormControls.attachments);
      return attachmentsControl ? this.getValueControl(attachmentsControl) : null;
    }

    if (!rowId) {
      return null;
    }

    const saudizationFormGroup = this.getSaudizationFormGroup();
    if (!saudizationFormGroup) {
      return null;
    }

    // YearKey format: "year1"-"year7" – find row by rowId in that year
    const yearKeyMatch = inputKey.match(/^year([1-7])$/);
    if (yearKeyMatch) {
      return this.findControlByRowIdInYear(saudizationFormGroup, parseInt(yearKeyMatch[1], 10), rowId);
    }

    // Legacy format: "1"-"7" (year only)
    const legacyYearNum = /^[1-7]$/.test(inputKey) ? parseInt(inputKey, 10) : null;
    if (legacyYearNum != null) {
      return this.findControlByRowIdInYear(saudizationFormGroup, legacyYearNum, rowId);
    }

    const { baseControlName, yearNumber } = this.parseSaudizationInputKey(inputKey);
    const yearsToCheck = this.getYearsToCheck(yearNumber);

    return this.findControlInYears(saudizationFormGroup, yearsToCheck, baseControlName, rowId);
  }

  /**
   * Finds control when inputKey is yearKey or year-only. Searches row types in the given year.
   */
  private findControlByRowIdInYear(
    saudizationFormGroup: FormGroup,
    year: number,
    rowId: string
  ): FormControl<any> | null {
    const yearGroup = saudizationFormGroup.get(`year${year}`);
    if (!(yearGroup instanceof FormGroup)) return null;

    for (const rowName of SAUDIZATION_ROW_KEYS) {
      const rowControl = yearGroup.get(rowName);
      if (!(rowControl instanceof FormGroup)) continue;
      if (rowControl.get('rowId')?.value === rowId) {
        return this.getValueControl(rowControl);
      }
    }
    return null;
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

