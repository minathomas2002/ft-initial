import { computed, effect, inject, signal, InputSignal, ModelSignal } from '@angular/core';
import { AbstractControl, FormControl, FormGroup } from '@angular/forms';
import { ProductPlanFormService } from 'src/app/shared/services/plan/product-plan-form-service/product-plan-form-service';
import { ServicePlanFormService } from 'src/app/shared/services/plan/service-plan-form-service/service-plan-form-service';
import { FormUtilityService } from 'src/app/shared/services/form-utility/form-utility.service';
import { ToasterService } from 'src/app/shared/services/toaster/toaster.service';
import { EMaterialsFormControls } from 'src/app/shared/enums';
import { IFieldInformation, IPageComment } from 'src/app/shared/interfaces/plans.interface';
import { TCommentPhase } from './product-localization-plan-wizard/product-localization-plan-wizard';

/**
 * Abstract base class for plan localization step forms.
 * Implements the Template Method pattern to provide common comment management functionality
 * while allowing subclasses to customize step-specific behavior.
 */
export abstract class PlanStepBaseClass {
  // Injected services
  protected readonly formUtilityService = inject(FormUtilityService);
  protected readonly toasterService = inject(ToasterService);

  // Abstract properties - must be provided by subclasses (defined as inputs/models in @Component)
  abstract readonly pageTitle: InputSignal<string>;
  abstract readonly commentPhase: ModelSignal<TCommentPhase>;
  abstract readonly selectedInputs: ModelSignal<IFieldInformation[]>;

  // Abstract property for plan form service - subclasses must provide either ProductPlanFormService or ServicePlanFormService
  abstract readonly planFormService: ProductPlanFormService | ServicePlanFormService;

  // Common signals
  showCheckbox = computed(() => this.commentPhase() !== 'none');
  comment = signal<string>('');
  showDeleteConfirmationDialog = signal<boolean>(false);

  // Abstract method - must be implemented by subclasses
  abstract getFormGroup(): FormGroup;

  // Get comment form control from the form group
  protected get commentFormControl(): FormControl<string> {
    const formGroup = this.getFormGroup();
    let control = formGroup.get(EMaterialsFormControls.comment) as FormControl<string> | null;
    if (!control) {
      // Create a new control if it doesn't exist (shouldn't happen in normal flow, but defensive)
      // Use nonNullable: true to ensure type is FormControl<string> not FormControl<string | null>
      control = new FormControl('', { nonNullable: true }) as FormControl<string>;
      formGroup.addControl(EMaterialsFormControls.comment, control);
    }
    return control;
  }

  // Computed page comment for timeline
  pageComment = computed<IPageComment>(() => {
    return {
      pageTitleForTL: this.pageTitle() ?? '',
      comment: this.comment() ?? '',
      fields: this.selectedInputs(),
    };
  });

  constructor() {
    // Setup common comment phase effect
    this.setupCommentPhaseEffect();

    // Call hook for step-specific initialization
    this.initializeStepSpecificLogic();
  }

  /**
   * Hook method for step-specific constructor logic.
   * Override this in subclasses to add step-specific initialization.
   */
  protected initializeStepSpecificLogic(): void {
    // Default implementation does nothing
    // Subclasses can override to add their specific logic
  }

  /**
   * Sets up the comment phase effect that handles form control enabling/disabling
   * based on the comment phase state.
   */
  protected setupCommentPhaseEffect(): void {
    effect(() => {
      if (this.commentPhase() === 'viewing') {
        const commentValue = this.commentFormControl.value ?? '';
        this.comment.set(commentValue);
        this.commentFormControl.setValue(commentValue, { emitEvent: false });
        this.commentFormControl.disable({ emitEvent: false });
        this.formUtilityService.disableHasCommentControls(this.getFormGroup());
      }
      if (['adding', 'editing'].includes(this.commentPhase())) {
        this.commentFormControl.enable();
        this.formUtilityService.enableHasCommentControls(this.getFormGroup());
      }
    });
  }

  /**
   * Updates the selected inputs list based on checkbox state.
   * Supports both simple fields and fields with row IDs (for FormArrays).
   */
  protected upDateSelectedInputs(value: boolean, fieldInformation: IFieldInformation, rowId?: string): void {
    const currentInputs = this.selectedInputs();

    // Set row ID if provided (for FormArray items)
    if (rowId) {
      fieldInformation.id = rowId;
    }

    const existingIndex = currentInputs.findIndex(
      input =>
        input.section === fieldInformation.section &&
        input.inputKey === fieldInformation.inputKey &&
        input.id === fieldInformation.id
    );

    if (value) {
      // Add field if not already selected
      if (existingIndex === -1) {
        this.selectedInputs.set([...currentInputs, fieldInformation]);
      }
    } else {
      // Remove field if it exists
      if (existingIndex !== -1) {
        this.selectedInputs.set(currentInputs.filter((_, index) => index !== existingIndex));
      }
    }
  }

  /**
   * Determines if an input should be highlighted based on selection and comment phase.
   * Supports both simple fields and fields with row IDs (for FormArrays).
   */
  protected highlightInput(inputKey: string, rowId?: string): boolean {
    const isSelected = this.selectedInputs().some(
      input =>
        input.inputKey === inputKey &&
        (rowId === undefined || input.id === rowId)
    );
    const phase = this.commentPhase();
    return isSelected && (phase === 'adding' || phase === 'editing' || phase === 'none');
  }

  /**
   * Initiates the delete comments flow by showing the confirmation dialog.
   */
  protected onDeleteComments(): void {
    this.showDeleteConfirmationDialog.set(true);
  }

  /**
   * Confirms and executes the deletion of comments and selected fields.
   */
  protected onConfirmDeleteComment(): void {
    this.formUtilityService.resetHasCommentControls(this.getFormGroup());
    this.selectedInputs.set([]);
    this.comment.set('');
    this.commentFormControl.reset();
    this.commentPhase.set('none');
    this.showDeleteConfirmationDialog.set(false);
    this.toasterService.success('Your comments and selected fields were removed successfully.');
  }

  /**
   * Cancels the delete comments operation.
   */
  protected onCancelDeleteComment(): void {
    this.showDeleteConfirmationDialog.set(false);
  }

  /**
   * Validates and saves a new comment.
   */
  protected onSaveComment(): void {
    // Validate at least one field is selected
    if (this.selectedInputs().length === 0) {
      this.toasterService.error('Please select at least one field before adding a comment.');
      return;
    }

    // Validate comment text
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

    // Save comment
    this.comment.set(commentValue);
    this.commentFormControl.setValue(commentValue, { emitEvent: false });
    this.commentPhase.set('viewing');
    this.commentFormControl.disable();
    this.toasterService.success('Your comments have been saved successfully.');
  }

  /**
   * Validates and saves an edited comment.
   */
  protected onSaveEditedComment(): void {
    // Validate comment text
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

    // Update comment
    this.comment.set(commentValue);
    this.commentFormControl.setValue(commentValue, { emitEvent: false });
    this.commentPhase.set('viewing');
    this.commentFormControl.disable();
    this.toasterService.success('Your updates have been saved successfully.');
  }

  /**
   * Resets all hasComment controls in the form group.
   */
  protected resetAllHasCommentControls(): void {
    this.formUtilityService.resetHasCommentControls(this.getFormGroup());
  }

  /**
   * Helper method to get the hasComment control from a form group.
   * Delegates to planFormService for consistency.
   * Returns null if control is null, undefined, or not a FormGroup.
   */
  protected getHasCommentControl(control: AbstractControl | null | undefined): FormControl<boolean> | null {
    if (!control || !(control instanceof FormGroup)) {
      return null;
    }
    return this.planFormService.getHasCommentControl(control);
  }

  /**
   * Helper method to get the value control from a form group.
   * Delegates to planFormService for consistency.
   */
  protected getValueControl(control: AbstractControl): FormControl<any> {
    return this.planFormService.getValueControl(control);
  }

  /**
   * Helper method to get a form control.
   * Delegates to planFormService for consistency.
   */
  protected getFormControl(control: AbstractControl): FormControl<any> {
    return this.planFormService.getFormControl(control);
  }
}
