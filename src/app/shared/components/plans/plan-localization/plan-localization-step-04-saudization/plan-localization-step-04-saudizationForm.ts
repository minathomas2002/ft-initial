import { ChangeDetectionStrategy, Component, computed, effect, inject, input, model, signal } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ProductPlanFormService } from 'src/app/shared/services/plan/product-plan-form-service/product-plan-form-service';
import { EMaterialsFormControls } from 'src/app/shared/enums';
import { SaudizationMatrixComponent } from './saudization-matrix/saudization-matrix.component';
import { BaseErrorMessages } from '../../../base-components/base-error-messages/base-error-messages';
import { GroupInputWithCheckbox } from '../../../form/group-input-with-checkbox/group-input-with-checkbox';
import { FileuploadComponent } from '../../../utility-components/fileupload/fileupload.component';
import { IFieldInformation, IPageComment } from 'src/app/shared/interfaces/plans.interface';
import { TCommentPhase } from '../product-localization-plan-wizard/product-localization-plan-wizard';
import { TColors } from 'src/app/shared/interfaces';
import { ToasterService } from 'src/app/shared/services/toaster/toaster.service';
import { FormUtilityService } from 'src/app/shared/services/form-utility/form-utility.service';
import { CommentStateComponent } from '../../comment-state-component/comment-state-component';
import { FormsModule } from '@angular/forms';
import { GeneralConfirmationDialogComponent } from 'src/app/shared/components/utility-components/general-confirmation-dialog/general-confirmation-dialog.component';
import { ConditionalColorClassDirective } from 'src/app/shared/directives';
import { TextareaModule } from 'primeng/textarea';
import { BaseLabelComponent } from 'src/app/shared/components/base-components/base-label/base-label.component';

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
    BaseLabelComponent
  ],
  templateUrl: './plan-localization-step-04-saudizationForm.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlanLocalizationStep04SaudizationForm {
  isViewMode = input<boolean>(false);
  isReviewMode = input<boolean>(false);
  pageTitle = input<string>('Saudization');
  private readonly productPlanFormService = inject(ProductPlanFormService);
  private readonly toasterService = inject(ToasterService);
  private readonly formUtilityService = inject(FormUtilityService);

  // Computed property to determine if file upload should be disabled
  isFileUploadDisabled = computed(() => this.isViewMode() || this.isReviewMode());

  formGroup = this.productPlanFormService.step4_saudization;
  readonly EMaterialsFormControls = EMaterialsFormControls;

  // Show checkbox signal (controls visibility of comment checkboxes)
  showCheckbox = model<boolean>(false);
  commentPhase = model<TCommentPhase>('none');
  selectedInputColor = input<TColors>('orange');
  selectedInputs = model<IFieldInformation[]>([]);
  comment = signal<string>('');
  showDeleteConfirmationDialog = signal<boolean>(false);

  commentFormControl = this.formGroup.get(EMaterialsFormControls.comment) as FormControl<string>;

  pageComment = computed<IPageComment>(() => {
    return {
      pageTitleForTL: this.pageTitle() ?? '',
      comment: this.comment() ?? '',
      fields: this.selectedInputs(),
    }
  });

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

  // Arrow function wrappers for comment functionality to pass to child components
  upDateSelectedInputsWrapper = (value: boolean, fieldInformation: IFieldInformation, rowId?: string): void => {
    this.upDateSelectedInputs(value, fieldInformation, rowId);
  };

  highlightInputWrapper = (inputKey: string, rowId?: string): boolean => {
    return this.highlightInput(inputKey, rowId);
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

    // Comment phase effect
    effect(() => {
      if (this.commentPhase() === 'viewing') {
        const commentValue = this.commentFormControl.value ?? '';
        this.comment.set(commentValue);
        this.commentFormControl.setValue(commentValue, { emitEvent: false });
        this.commentFormControl.disable();
        this.formUtilityService.disableHasCommentControls(this.formGroup);
      }
      if (['adding', 'editing'].includes(this.commentPhase())) {
        this.commentFormControl.enable();
        this.formUtilityService.enableHasCommentControls(this.formGroup);
      }
    });
  }

  // Helper to get year control names
  getYearControlName(year: number): string {
    return `year${year}` as keyof typeof EMaterialsFormControls;
  }

  upDateSelectedInputs(value: boolean, fieldInformation: IFieldInformation, rowId?: string): void {
    const currentInputs = this.selectedInputs();

    // Set row ID for both selecting and unselecting (needed to find item when unselecting)
    if (rowId) {
      fieldInformation.id = rowId;
    }

    const existingIndex = currentInputs.findIndex(
      input => input.section === fieldInformation.section &&
        input.inputKey === fieldInformation.inputKey &&
        input.id === fieldInformation.id
    );

    if (value) {
      if (existingIndex === -1) {
        this.selectedInputs.set([...currentInputs, fieldInformation]);
      }
    } else {
      if (existingIndex !== -1) {
        this.selectedInputs.set(currentInputs.filter((_, index) => index !== existingIndex));
      }
    }
  }

  highlightInput(inputKey: string, rowId?: string): boolean {
    const isSelected = this.selectedInputs().some(input =>
      input.inputKey === inputKey &&
      (rowId === undefined || input.id === rowId)
    );
    const phase = this.commentPhase();
    return isSelected && (phase === 'adding' || phase === 'editing');
  }

  onDeleteComments(): void {
    this.showDeleteConfirmationDialog.set(true);
  }

  onConfirmDeleteComment(): void {
    this.resetAllHasCommentControls();
    this.selectedInputs.set([]);
    this.comment.set('');
    this.commentFormControl.reset();
    this.commentPhase.set('none');
    this.showCheckbox.set(false);
    this.showDeleteConfirmationDialog.set(false);
    this.toasterService.success('Your comments and selected fields were removed successfully.');
  }

  onCancelDeleteComment(): void {
    this.showDeleteConfirmationDialog.set(false);
  }

  onSaveComment(): void {
    if (this.selectedInputs().length === 0) {
      this.toasterService.error('Please select at least one field before adding a comment.');
      return;
    }

    const commentValue = this.commentFormControl.value?.trim() || '';
    if (!commentValue) {
      this.commentFormControl.markAsTouched();
      this.toasterService.error('Please enter a comment.');
      return;
    }

    if (commentValue.length > 255) {
      this.toasterService.error('Comment cannot exceed 255 characters.');
      return;
    }

    this.comment.set(commentValue);
    this.commentFormControl.setValue(commentValue, { emitEvent: false });
    this.commentPhase.set('viewing');
    this.commentFormControl.disable();
    this.toasterService.success('Your comments have been saved successfully.');
  }

  onSaveEditedComment(): void {
    const commentValue = this.commentFormControl.value?.trim() || '';
    if (!commentValue) {
      this.commentFormControl.markAsTouched();
      this.toasterService.error('Please enter a comment.');
      return;
    }

    if (commentValue.length > 255) {
      this.toasterService.error('Comment cannot exceed 255 characters.');
      return;
    }

    this.comment.set(commentValue);
    this.commentFormControl.setValue(commentValue, { emitEvent: false });
    this.commentPhase.set('viewing');
    this.commentFormControl.disable();
    this.toasterService.success('Your updates have been saved successfully.');
  }

  resetAllHasCommentControls(): void {
    this.formUtilityService.resetHasCommentControls(this.formGroup);
  }
}

