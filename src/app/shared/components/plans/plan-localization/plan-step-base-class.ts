import { computed, effect, inject, OnInit, signal, InputSignal, ModelSignal, Directive } from '@angular/core';
import { AbstractControl, FormArray, FormControl, FormGroup } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DestroyRef } from '@angular/core';
import { ProductPlanFormService } from 'src/app/shared/services/plan/product-plan-form-service/product-plan-form-service';
import { ServicePlanFormService } from 'src/app/shared/services/plan/service-plan-form-service/service-plan-form-service';
import { FormUtilityService } from 'src/app/shared/services/form-utility/form-utility.service';
import { ToasterService } from 'src/app/shared/services/toaster/toaster.service';
import { PlanStore } from 'src/app/shared/stores/plan/plan.store';
import { EMaterialsFormControls } from 'src/app/shared/enums';
import { IFieldInformation, IPageComment } from 'src/app/shared/interfaces/plans.interface';
import { TColors } from 'src/app/shared/interfaces';
import { TCommentPhase } from './product-localization-plan-wizard/product-localization-plan-wizard';

/**
 * Abstract base class for plan localization step forms.
 * Implements the Template Method pattern to provide common comment management functionality
 * while allowing subclasses to customize step-specific behavior.
 *
 * Note: Abstract base classes using inject() don't require Angular decorators.
 */
@Directive()
export abstract class PlanStepBaseClass {
  // Injected services
  protected readonly formUtilityService = inject(FormUtilityService);
  protected readonly toasterService = inject(ToasterService);
  readonly planStore = inject(PlanStore);
  protected readonly destroyRef = inject(DestroyRef);

  // Abstract properties - must be provided by subclasses (defined as inputs/models in @Component)
  abstract readonly pageTitle: InputSignal<string>;
  abstract readonly commentPhase: ModelSignal<TCommentPhase>;
  abstract readonly selectedInputs: ModelSignal<IFieldInformation[]>;
  abstract readonly pageComments: InputSignal<IPageComment[]>;
  abstract readonly isViewMode: InputSignal<boolean>;
  abstract readonly correctedFieldIds: InputSignal<string[]>;
  abstract readonly correctedFields: InputSignal<IFieldInformation[]>;

  // Abstract property for plan form service - subclasses must provide either ProductPlanFormService or ServicePlanFormService
  abstract readonly planFormService: ProductPlanFormService | ServicePlanFormService;

  // Abstract method - must be implemented by subclasses to map field information to form control
  abstract getControlForField(field: IFieldInformation): FormControl<any> | null;

  // Common signals
  showCheckbox = computed(() => this.commentPhase() !== 'none' && !this.isResubmitMode());
  comment = signal<string>('');
  showDeleteConfirmationDialog = signal<boolean>(false);

  // Store original values for before/after comparison in resubmit mode
  private originalFieldValues = signal<Map<string, any>>(new Map());
  private previousCorrectedFieldsLength = signal<number>(-1);

  // Resubmit mode check
  isResubmitMode = computed(() => {
    return this.planStore.wizardMode() === 'resubmit';
  });

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

  // A dedicated, always-disabled control for displaying the comment inside each step.
  // This prevents editing in the step UI while keeping the dialog editable.
  private readonly stepCommentControl = new FormControl<string>('', { nonNullable: true });
  private stepCommentSyncInitialized = false;

  protected get stepCommentFormControl(): FormControl<string> {
    return this.stepCommentControl;
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

    // Setup resubmit mode effect to handle correctedFields when they become available
    this.setupResubmitModeEffect();

    // Call hook for step-specific initialization
    this.initializeStepSpecificLogic();

    // Always keep the step comment control disabled.
    this.stepCommentControl.disable({ emitEvent: false });
  }

  ngOnInit(): void {
    // Only proceed if form group is available
    const formGroup = this.getFormGroup();
    if (!formGroup || !this.planFormService) {
      return;
    }

    // Now that derived services/form groups are initialized, safely sync the step display control.
    if (!this.stepCommentSyncInitialized) {
      this.stepCommentSyncInitialized = true;
      this.stepCommentControl.setValue(this.commentFormControl.value ?? '', { emitEvent: false });
      // Sync from commentFormControl to stepCommentControl (for display)
      this.commentFormControl.valueChanges
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(value => {
          this.stepCommentControl.setValue(value ?? '', { emitEvent: false });
        });
      // Sync from stepCommentControl back to commentFormControl (when user edits in app-comment-input)
      this.stepCommentControl.valueChanges
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(value => {
          // Only sync if stepCommentControl is enabled (i.e., in editing mode)
          if (this.stepCommentControl.enabled) {
            this.commentFormControl.setValue(value ?? '', { emitEvent: false });
          }
        });
    }

    const wizardMode = this.planStore.wizardMode();
    const isView = this.isViewMode();

    if (isView && wizardMode !== 'resubmit') {
      // In view mode (but not resubmit), disable all controls immediately
      formGroup.disable({ emitEvent: false });
    }
    // Resubmit mode logic is handled in the effect to wait for correctedFields to be available
  }

  /**
   * Sets up an effect to handle resubmit mode when correctedFields become available.
   * This ensures we wait for the data to load before processing corrected fields.
   */
  private setupResubmitModeEffect(): void {
    effect(() => {
      const formGroup = this.getFormGroup();
      if (!formGroup || !this.planFormService) {
        return;
      }

      const wizardMode = this.planStore.wizardMode();
      const isResubmit = wizardMode === 'resubmit';
      const correctedFields = this.correctedFields();
      const currentLength = correctedFields?.length ?? 0;
      const previousLength = this.previousCorrectedFieldsLength();

      if (!isResubmit) {
        // Reset tracking when not in resubmit mode
        if (previousLength !== -1) {
          this.previousCorrectedFieldsLength.set(-1);
        }
        return;
      }

      // Process if this is the first time (previousLength === -1) or if correctedFields changed
      if (previousLength === -1 || currentLength !== previousLength) {
        this.handleResubmitModeFields(formGroup, correctedFields);
        this.previousCorrectedFieldsLength.set(currentLength);
      }
    });
  }

  /**
   * Handles enabling/disabling controls for resubmit mode based on corrected fields.
   */
  private handleResubmitModeFields(formGroup: FormGroup, correctedFields: IFieldInformation[]): void {
    // Store original values for before/after comparison
    if (correctedFields?.length > 0) {
      this.storeOriginalValues(correctedFields);
    }

    // Disable all controls first
    formGroup.disable({ emitEvent: false });

    if (!correctedFields?.length) {
      return;
    }

    // Collect enabled controls and their parent chains
    const { enabledControls, enabledParentChains } = this.collectEnabledControls(correctedFields);

    // Enable parent chains and controls
    this.enableCorrectedFields(enabledParentChains, correctedFields);

    // Disable siblings that don't have enabled descendants
    this.disableUnselectedSiblings(enabledParentChains, enabledControls);
  }

  /**
   * Collects all controls and their parent chains that should be enabled.
   */
  private collectEnabledControls(
    correctedFields: IFieldInformation[]
  ): {
    enabledControls: Set<AbstractControl>;
    enabledParentChains: Map<AbstractControl, AbstractControl[]>;
  } {
    const enabledControls = new Set<AbstractControl>();
    const enabledParentChains = new Map<AbstractControl, AbstractControl[]>();

    correctedFields.forEach(field => {
      const control = this.getControlForField(field);
      if (!control) {
        return;
      }

      const parentChain = this.buildParentChain(control);
      parentChain.forEach(parent => enabledControls.add(parent));
      enabledControls.add(control);
      enabledParentChains.set(control, parentChain);
    });

    return { enabledControls, enabledParentChains };
  }

  /**
   * Builds the parent chain for a control (from root to immediate parent).
   */
  private buildParentChain(control: AbstractControl): AbstractControl[] {
    const parentChain: AbstractControl[] = [];
    let parent: AbstractControl | null = control.parent;

    while (parent) {
      if (parent instanceof FormGroup || parent instanceof FormArray) {
        parentChain.unshift(parent); // Add to beginning to maintain order (root to leaf)
      }
      parent = parent.parent;
    }

    return parentChain;
  }

  /**
   * Enables the corrected fields and their parent chains.
   */
  private enableCorrectedFields(
    enabledParentChains: Map<AbstractControl, AbstractControl[]>,
    correctedFields: IFieldInformation[]
  ): void {
    enabledParentChains.forEach((parentChain, control) => {
      // Enable parent chain
      parentChain.forEach(parent => {
        parent.enable({ emitEvent: false, onlySelf: true });
      });

      // Enable the control itself
      control.enable({ emitEvent: false, onlySelf: true });
      control.markAsPristine();
      control.markAsUntouched();

      // Subscribe to status changes to track when field becomes valid
      control.statusChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
        if (control.status === 'VALID') {
          const field = correctedFields.find(f => this.getControlForField(f) === control);
          if (field) {
            this.upDateSelectedInputs(false, field);
          }
        }
      });
    });
  }

  /**
   * Disables siblings that don't have enabled descendants.
   */
  private disableUnselectedSiblings(
    enabledParentChains: Map<AbstractControl, AbstractControl[]>,
    enabledControls: Set<AbstractControl>
  ): void {
    const allParents = new Set<AbstractControl>();
    enabledParentChains.forEach(parentChain => {
      parentChain.forEach(parent => allParents.add(parent));
    });

    allParents.forEach(parent => {
      if (parent instanceof FormGroup) {
        Object.keys(parent.controls).forEach(key => {
          const siblingControl = parent.get(key);
          if (siblingControl && !this.hasEnabledDescendant(siblingControl, enabledControls)) {
            siblingControl.disable({ emitEvent: false, onlySelf: true });
          }
        });
      } else if (parent instanceof FormArray) {
        parent.controls.forEach(siblingControl => {
          if (!this.hasEnabledDescendant(siblingControl, enabledControls)) {
            siblingControl.disable({ emitEvent: false, onlySelf: true });
          }
        });
      }
    });
  }

  /**
   * Checks if a control or any of its descendants should be enabled.
   */
  private hasEnabledDescendant(control: AbstractControl, enabledControls: Set<AbstractControl>): boolean {
    if (enabledControls.has(control)) {
      return true;
    }

    if (control instanceof FormGroup) {
      return Object.keys(control.controls).some(key => {
        const child = control.get(key);
        return child ? this.hasEnabledDescendant(child, enabledControls) : false;
      });
    }

    if (control instanceof FormArray) {
      return control.controls.some(child => this.hasEnabledDescendant(child, enabledControls));
    }

    return false;
  }

  /**
   * Stores original values of corrected fields for before/after comparison.
   */
  private storeOriginalValues(correctedFields: IFieldInformation[]): void {
    const originalValues = new Map<string, any>();

    correctedFields.forEach(field => {
      const control = this.getControlForField(field);
      if (control) {
        // Create a unique key for the field
        const fieldKey = this.getFieldKey(field);
        originalValues.set(fieldKey, control.value);
      }
    });

    this.originalFieldValues.set(originalValues);
  }

  /**
   * Gets a unique key for a field for storing/retrieving original values.
   */
  private getFieldKey(field: IFieldInformation): string {
    return `${field.section}.${field.inputKey}${field.id ? `.${field.id}` : ''}`;
  }

  /**
   * Gets the original value for a field (before correction).
   */
  getOriginalValue(field: IFieldInformation): any {
    const fieldKey = this.getFieldKey(field);
    return this.originalFieldValues().get(fieldKey);
  }

  /**
   * Gets the current value for a field (after correction).
   */
  getCurrentValue(field: IFieldInformation): any {
    const control = this.getControlForField(field);
    return control ? control.value : null;
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
        // Also disable the step comment control (used by app-comment-input)
        this.stepCommentControl.disable({ emitEvent: false });
        this.formUtilityService.disableHasCommentControls(this.getFormGroup());
      }
      if (['adding', 'editing'].includes(this.commentPhase())) {
        this.commentFormControl.enable();
        // Also enable the step comment control (used by app-comment-input) when editing
        if (this.commentPhase() === 'editing') {
          // Sync the value from commentFormControl to stepCommentControl before enabling
          const commentValue = this.commentFormControl.value ?? '';
          this.stepCommentControl.setValue(commentValue, { emitEvent: false });
          this.stepCommentControl.enable({ emitEvent: false });
          // Sync any changes from stepCommentControl back to commentFormControl
          // This happens automatically via the subscription in ngOnInit, but we ensure
          // the initial value is synced here
        }
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
   * In resubmit mode, also checks correctedFields() for employee-selected fields.
   */
  protected highlightInput(inputKey: string, rowId?: string): boolean {
    // Check selectedInputs (for employee adding comments)
    const isSelected = this.selectedInputs().some(
      input =>
        input.inputKey === inputKey &&
        (rowId === undefined || input.id === rowId)
    );
    
    // In resubmit mode, also check correctedFields (employee-selected fields)
    const isCorrected = this.isResubmitMode() && this.correctedFields().some(
      input =>
        input.inputKey === inputKey &&
        (rowId === undefined || input.id === rowId)
    );
    
    const phase = this.commentPhase();
    return (isSelected || isCorrected) && (phase === 'adding' || phase === 'editing' || phase === 'none');
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
    this.comment.set('');
    this.commentFormControl.reset();
    if (this.isResubmitMode()) {
      this.commentPhase.set('none');
      this.commentFormControl.disable({ emitEvent: false });
    } else {
      this.commentPhase.set('adding');
    }
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
    if (this.selectedInputs().length === 0 && !this.isResubmitMode()) {
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

    // In resubmit (investor) flow, reset any current orange selections and counters
    if (this.isResubmitMode()) {
      // Clear the selected inputs so step highlights/counts reset
      try {
        this.selectedInputs.set([]);
        this.resetAllHasCommentControls();
      } catch (e) {
        // Defensive: should not block save UX if resetting fails
        console.warn('Failed to reset selected inputs after saving investor comment', e);
      }
    }

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

    // In resubmit (investor) flow, reset any current orange selections and counters
    if (this.isResubmitMode()) {
      try {
        this.selectedInputs.set([]);
        this.resetAllHasCommentControls();
      } catch (e) {
        console.warn('Failed to reset selected inputs after editing investor comment', e);
      }
    }

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

  /**
   * Helper method to check if a field should be highlighted in view mode.
   * Determines if a field is part of the corrected fields list.
   */
  isFieldCorrected(inputKey: string, section?: string): boolean {
    if (!this.isViewMode()) return false;

    // Check if any comment field matches this inputKey (and section if provided)
    const matchingFields = this.pageComments()
      .flatMap(c => c.fields)
      .filter(f => {
        const keyMatch = f.inputKey === inputKey || f.inputKey === `${section}.${inputKey}`;
        const sectionMatch = !section || f.section === section;
        return keyMatch && sectionMatch;
      });

    // If any matching field has an ID in correctedFieldIds, highlight it
    return matchingFields.some(f => f.id && this.correctedFieldIds().includes(f.id));
  }
}
