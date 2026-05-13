import { computed, effect, inject, OnInit, signal, InputSignal, ModelSignal, Directive } from '@angular/core';
import { AbstractControl, FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DestroyRef } from '@angular/core';
import { ProductPlanFormService } from 'src/app/shared/services/plan/product-plan-form-service/product-plan-form-service';
import { ServicePlanFormService } from 'src/app/shared/services/plan/service-plan-form-service/service-plan-form-service';
import { FormUtilityService } from 'src/app/shared/services/form-utility/form-utility.service';
import { ToasterService } from 'src/app/shared/services/toaster/toaster.service';
import { I18nService } from 'src/app/shared/services/i18n';
import { PlanCommentSyncService } from 'src/app/shared/services/plan/plan-comment-sync.service';
import { PlanStore } from 'src/app/shared/stores/plan/plan.store';
import { EMaterialsFormControls, EPlanPageTitle, ERoles } from 'src/app/shared/enums';
import { IFieldInformation, IPageComment } from 'src/app/shared/interfaces/plans.interface';
import { TColors } from 'src/app/shared/interfaces';
import { TCommentPhase } from 'src/app/shared/types/plan-comments.types';
import { RoleService } from 'src/app/shared/services/role/role-service';

/**
 * Abstract base class for plan localization step forms.
 * Implements the Template Method pattern to provide common comment management functionality
 * while allowing subclasses to customize step-specific behavior.
 *
 * Note: Abstract base classes using inject() don't require Angular decorators.
 */
@Directive()
export abstract class PlanStepBaseClass implements OnInit {
  /** Tracks which controls have been marked as "changed once" in resubmit mode (avoids mutating control objects). */
  private readonly resubmitChangedOnceMap = new WeakMap<AbstractControl, boolean>();
  /** Ensures we only attach status/value subscriptions once per control to avoid duplicate handlers. */
  private readonly resubmitSubscribedControls = new WeakSet<AbstractControl>();

  // Injected services
  protected readonly formUtilityService = inject(FormUtilityService);
  protected readonly toasterService = inject(ToasterService);
  protected readonly i18nService = inject(I18nService);
  private readonly planCommentSyncService = inject(PlanCommentSyncService);
  protected readonly roleService = inject(RoleService);
  readonly planStore = inject(PlanStore);
  protected readonly destroyRef = inject(DestroyRef);

  // Abstract properties - must be provided by subclasses (defined as inputs/models in @Component)
  abstract readonly pageTitle: InputSignal<EPlanPageTitle>;
  abstract readonly commentPhase: ModelSignal<TCommentPhase>;
  abstract readonly selectedInputs: ModelSignal<IFieldInformation[]>;
  abstract readonly pageComments: InputSignal<IPageComment[]>;
  abstract readonly isViewMode: InputSignal<boolean>;
  abstract readonly correctedFieldIds: InputSignal<string[]>;
  abstract readonly correctedFields: InputSignal<IFieldInformation[]>;
  get EMaterialsFormControls() {
    return EMaterialsFormControls;
  }
  // Abstract property for plan form service - subclasses must provide either ProductPlanFormService or ServicePlanFormService
  abstract readonly planFormService: ProductPlanFormService | ServicePlanFormService;

  // Abstract method - must be implemented by subclasses to map field information to form control
  abstract getControlForField(field: IFieldInformation): FormControl<any> | null;

  /**
   * Abstract method - must be implemented by subclasses to get the original value of a field
   * from the plan's originalPlanResponse (BE response before corrections).
   * Used for before/after comparison in resubmit mode.
   */
  abstract getOriginalFieldValueFromPlanResponse(field: IFieldInformation): any;

  // Common signals
  showCheckbox = computed(() => this.commentPhase() !== 'none' && !this.isResubmitMode());
  isInvestorPersona = computed(() => this.roleService.hasAnyRoleSignal([ERoles.INVESTOR])());
  comment = signal<string>('');
  showDeleteConfirmationDialog = signal<boolean>(false);

  // Store original values for before/after comparison in resubmit mode
  private originalFieldValues = signal<Map<string, unknown>>(new Map());
  private previousCorrectedFieldsLength = signal<number>(-1);

  // Resubmit-mode highlight tracking: once a corrected field is changed (or becomes dirty),
  // it should never be highlighted again, even if reverted back to its initial/original value.
  private correctedFieldInitialValues = signal<Map<string, unknown>>(new Map());
  private correctedFieldChangedOnce = signal<Set<string>>(new Set());

  // Resubmit mode check
  isResubmitMode = computed(() => {
    return this.planStore.wizardMode() === 'resubmit';
  });

  // Abstract method - must be implemented by subclasses
  abstract getFormGroup(): FormGroup;

  // Get comment form control from the form group.
  // Always ensures the control has no validators so it can never
  // make the parent FormGroup invalid and block plan submission.
  protected get commentFormControl(): FormControl<string> {
    const formGroup = this.getFormGroup();
    let control = formGroup.get(EMaterialsFormControls.comment) as FormControl<string> | null;
    if (!control) {
      // Create a new control if it doesn't exist (shouldn't happen in normal flow, but defensive)
      control = new FormControl('') as FormControl<string>;
      formGroup.addControl(EMaterialsFormControls.comment, control);
    }
    // Defensively strip any validators that may have been attached elsewhere.
    if (control.validator || control.asyncValidator) {
      control.clearValidators();
      control.clearAsyncValidators();
      control.updateValueAndValidity({ emitEvent: false });
    }
    return control;
  }

  // A dedicated, always-disabled control for displaying the comment inside each step.
  // This prevents editing in the step UI while keeping the dialog editable.
  private readonly stepCommentControl = new FormControl<string>('');
  private stepCommentSyncInitialized = false;

  protected get stepCommentFormControl(): FormControl<string | null> {
    return this.stepCommentControl;
  }

  // Computed page comment for timeline
  pageComment = computed<IPageComment>(() => {
    return {
      pageTitleForTL: this.pageTitle(),
      comment: this.comment() ?? '',
      fields: this.selectedInputs(),
    };
  });

  // Combined incoming comments for the current step (used to prefill dialog when needed).
  incomingCommentText = computed(() =>
    this.pageComments()
      .map(c => c.comment?.trim())
      .filter((c): c is string => !!c)
      .join('\n\n')
  );

  constructor() {
    // Setup common comment phase effect
    this.setupCommentPhaseEffect();

    // Setup resubmit mode effect to handle correctedFields when they become available
    this.setupResubmitModeEffect();

    // Call hook for step-specific initialization (must only register effects/setup here;
    // logic that needs planFormService etc. should run in ngOnInit in the subclass)
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
        const fields = this.planStore.originalPlanComments()?.comments.find(c => c.pageTitleForTL === this.pageTitle())?.fields
        this.handleResubmitModeFields(formGroup, fields!);
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

    // Reset / initialize resubmit highlight tracking each time corrected fields are (re)processed.
    this.initializeResubmitCorrectedFieldTracking(correctedFields);

    // Disable all controls first
    formGroup.disable({ emitEvent: false });

    if (this.shouldEnableEntireFormInResubmitMode()) {
      formGroup.enable({ emitEvent: false });
      this.onEntireFormEnabledInResubmit();
      return;
    }

    if (!correctedFields?.length) {
      return;
    }

    // Collect enabled controls and their parent chains
    const { enabledControls, enabledParentChains } = this.collectEnabledControls(correctedFields);

    // Merge additional controls from subclasses (e.g. value chain year fields for Procured rows)
    const additional = this.collectAdditionalEnabledControlsForResubmit(correctedFields);
    additional.controls.forEach(control => {
      enabledControls.add(control);
      const parentChain = additional.parentChains.get(control) ?? this.buildParentChain(control);
      parentChain.forEach(p => enabledControls.add(p));
      enabledParentChains.set(control, parentChain);
    });

    // Enable parent chains and controls
    this.enableCorrectedFields(enabledParentChains, correctedFields);

    // Disable siblings that don't have enabled descendants
    this.disableUnselectedSiblings(enabledParentChains, enabledControls);
  }

  /**
   * Captures initial values for corrected fields and resets the "changed once" set.
   * We track "changed once" instead of doing before/after comparisons to avoid
   * re-highlighting when the investor reverts back to the original value.
   */
  private initializeResubmitCorrectedFieldTracking(correctedFields: IFieldInformation[]): void {
    const initialValues = new Map<string, unknown>();
    (correctedFields ?? []).forEach(field => {
      const control = this.getControlForField(field);
      if (!control) {
        return;
      }
      initialValues.set(this.getFieldKey(field), control.value);
    });

    this.correctedFieldInitialValues.set(initialValues);
    this.correctedFieldChangedOnce.set(new Set());
  }

  /**
   * Called when a corrected field control becomes dirty (user edited it).
   * Override in subclasses to e.g. enable sibling controls in the same row so the user can complete the record.
   */
  protected onCorrectedFieldBecameDirty(_control: AbstractControl, _field: IFieldInformation): void {
    // Default: no-op. Value chain form overrides to enable row siblings.
  }

  /**
   * Override in subclasses to add extra controls enabled in resubmit mode.
   * Use case: when a section has corrected fields but its opportunityLocalizationTablesValidation
   * flag is false, enable the entire section so the user can add remaining fields.
   */
  protected collectAdditionalEnabledControlsForResubmit(
    _correctedFields: IFieldInformation[]
  ): { controls: AbstractControl[]; parentChains: Map<AbstractControl, AbstractControl[]> } {
    return { controls: [], parentChains: new Map() };
  }

  /**
   * When true in resubmit mode, the entire step form is enabled (edit-like), bypassing per-field enablement.
   * Subclasses (e.g. value chain with a page-level investor comment) may override.
   */
  protected shouldEnableEntireFormInResubmitMode(): boolean {
    return false;
  }

  /** Hook after full form enable in resubmit; override for step-specific sync (e.g. year controls). */
  protected onEntireFormEnabledInResubmit(): void {}

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
   * Protected for use by subclasses in collectAdditionalEnabledControlsForResubmit.
   */
  protected buildParentChain(control: AbstractControl): AbstractControl[] {
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
      const fieldForControl = correctedFields.find(f => this.getControlForField(f) === control);

      parentChain.forEach(parent => {
        parent.enable({ emitEvent: false, onlySelf: true });
      });

      control.enable({ emitEvent: false, onlySelf: true });
      if (control.status === 'VALID') {
        control.markAsPristine();
        control.markAsUntouched();
      } else {
        control.markAsDirty();
      }

      // Attach subscriptions only once per control to avoid duplicate handlers and leaks
      if (!this.resubmitSubscribedControls.has(control)) {
        this.resubmitSubscribedControls.add(control);
        control.statusChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
          // if (fieldForControl) this.markCorrectedFieldChangedOnce(fieldForControl, control);
          if (control.status === 'VALID' && control.dirty) {
            const field = correctedFields.find(f => this.getControlForField(f) === control);
            if (field) {
              const currentValue = control.value;
              const originalValue = this.getOriginalValue(field);
              this.upDateSelectedInputs(originalValue == currentValue, field);
            }
          }
        });
        control.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
          // if (fieldForControl) this.markCorrectedFieldChangedOnce(fieldForControl, control);
          if (control.dirty) {
            const field = correctedFields.find(f => this.getControlForField(f) === control);
            if (control.status === 'VALID' && field) {
              const currentValue = control.value;
              const originalValue = this.getOriginalValue(field);
              this.upDateSelectedInputs(originalValue == currentValue, field);
            }
            if (field) this.onCorrectedFieldBecameDirty(control, field);
          }
        });
      }
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
   * Values are taken from the BE originalPlanResponse via getOriginalFieldValueFromPlanResponse.
   */
  private storeOriginalValues(correctedFields: IFieldInformation[]): void {
    const originalValues = new Map<string, unknown>();

    correctedFields.forEach(field => {
      const fieldKey = this.getFieldKey(field);
      const value = this.getOriginalFieldValueFromPlanResponse(field);
      originalValues.set(fieldKey, value);
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
        if (!this.isResubmitMode()) {
          this.formUtilityService.disableHasCommentControls(this.getFormGroup());
        }
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

    const targetInputKey = this.normalizeInputKeyForComparison(fieldInformation.inputKey);
    const targetId = this.normalizeIdForComparison(fieldInformation.id);

    const existingIndex = currentInputs.findIndex(
      input =>
        input.section === fieldInformation.section &&
        this.normalizeInputKeyForComparison(input.inputKey) === targetInputKey &&
        this.normalizeIdForComparison(input.id) === targetId
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
   * Normalizes input keys for robust matching between API-loaded fields and UI field metadata.
   * Examples:
   * - 'section.fieldName' -> 'fieldName'
   * - 'fieldName_0' -> 'fieldName'
   */
  private normalizeInputKeyForComparison(inputKey: string): string {
    const key = inputKey ?? '';
    const withoutPrefix = key.replace(/^.+\./, '');
    return this.stripIndexSuffix(withoutPrefix);
  }

  /** Normalizes IDs so string/number representations compare consistently. */
  private normalizeIdForComparison(id: unknown): string {
    return id == null ? '' : String(id);
  }

  /**
   * Strips numeric index suffix from inputKey (e.g. 'whyChoseThisCompany_0' -> 'whyChoseThisCompany').
   * Enables flexible matching when correctedFields use base key or index-suffixed format.
   */
  protected stripIndexSuffix(inputKey: string): string {
    const match = inputKey.match(/^(.+)_(\d+)$/);
    return match ? match[1] : inputKey;
  }

  /**
   * Determines if an input should be highlighted based on selection and comment phase.
   * Supports both simple fields and fields with row IDs (for FormArrays).
   * In resubmit mode, also checks correctedFields() for employee-selected fields.
   * Matches inputKey flexibly: exact match or normalized (strip index suffix) when rowId matches.
   */
  protected highlightInput(inputKey: string, rowId?: string): boolean {
    // Check selectedInputs (for employee adding comments)
    const isSelected = this.selectedInputs().some(
      input =>
        input.inputKey === inputKey &&
        (rowId === undefined || input.id === rowId)
    );

    // In resubmit mode, highlight corrected fields only until the investor changes them once.
    // After first change, do NOT re-highlight even if the value is reverted.
    const correctedField = this.isResubmitMode()
      ? this.correctedFields().find(input => input.inputKey === inputKey && (rowId === undefined || input.id === rowId))
      : undefined;
    let isCorrected = false;
    if (correctedField) {
      const control = this.getControlForField(correctedField);
      const originalValue = this.getOriginalValue(correctedField);
      const isAttachmentsField =
        (correctedField.section === 'attachments' && correctedField.inputKey === 'attachments') ||
        inputKey === 'attachments';

      if (isAttachmentsField) {
        // Attachments: use dirty flag—value comparison fails (File[] vs BE objects, ref equality)
        isCorrected = control?.dirty ?? false;
      } else if (originalValue === undefined) {
        // New rows/fields with no original value (e.g. assemblyTesting when original had no sectionType 4):
        // use dirty flag—comparison would falsely treat as "corrected" since current !== undefined
        isCorrected = control?.dirty ?? false;
      } else {
        let currentValue = control?.value;
        if (correctedField.inputKey === 'contactNumber') {
          currentValue = currentValue?.countryCode + '' + currentValue?.phoneNumber;
        }
        isCorrected = !this.valuesEqual(currentValue?.toString(), originalValue?.toString());
      }

    }

    return this.isResubmitMode() ? (isSelected && !isCorrected) : (isSelected && this.commentPhase() !== 'viewing');
  }

  private valuesEqual(a: any, b: any): boolean {
    if (a === b) {
      return true;
    }
    if (a == null || b == null) {
      return a === b;
    }
    // Cheap structural compare for arrays/objects; falls back safely.
    const typeA = typeof a;
    const typeB = typeof b;
    if (typeA !== typeB) {
      return false;
    }
    if (typeA === 'object') {
      try {
        return JSON.stringify(a) === JSON.stringify(b);
      } catch {
        return false;
      }
    }
    return false;
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
    this.comment.set('');
    this.commentFormControl.reset();
    if (this.isResubmitMode()) {
      this.commentPhase.set('none');
      this.commentFormControl.disable({ emitEvent: false });
      // this.selectedInputs.set(this.correctedFields());
      // In resubmit mode, keep fields in the store (needed for correctedFields derivation)
      // but clear the comment text and remove from currentUserPageComments
      this.planCommentSyncService.clearPageCommentTextInStore(this.pageTitle());
    } else {
      this.formUtilityService.resetHasCommentControls(this.getFormGroup());
      this.commentPhase.set('adding');
      this.selectedInputs.set([]);
      // In non-resubmit mode, remove the entry entirely from the store
      this.planCommentSyncService.removePageCommentFromStore(this.pageTitle());
    }
    this.showDeleteConfirmationDialog.set(false);
    this.toasterService.success(this.isInvestorPersona() ? this.i18nService.translate('plans.comments.removedSuccess') : this.i18nService.translate('plans.comments.removedWithFieldsSuccess'));
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
  protected onSaveComment(commentValue: string | undefined): void {
    // Validate at least one field is selected
    if (this.selectedInputs().length === 0 && !this.isResubmitMode()) {
      this.toasterService.error(this.i18nService.translate('plans.comments.selectFieldFirst'));
      return;
    }

    // Validate comment text
    const comment = commentValue || this.commentFormControl.value?.trim() || '';

    if (!comment) {
      this.commentFormControl.markAsTouched();
      this.toasterService.error(this.i18nService.translate('plans.comments.enterComment'));
      return;
    }

    if (comment.length > 255) {
      this.toasterService.error(this.i18nService.translate('plans.comments.maxLength'));
      return;
    }

    // Save comment
    this.comment.set(comment);
    this.commentFormControl.setValue(comment, { emitEvent: false });
    this.commentPhase.set('viewing');
    this.commentFormControl.disable();
    this.planCommentSyncService.syncPageCommentToStore(this.pageComment());
    // Merge this page's comment into planComments (add/remove fields as user selected)
    // this.planCommentSyncService.syncPageCommentToStore(this.pageComment());

    this.toasterService.success(this.i18nService.translate('plans.comments.savedSuccess'));
  }

  /**
   * Validates and saves an edited comment.
   */
  protected onSaveEditedComment(): void {
    // Validate comment text
    const commentValue = this.commentFormControl.value?.trim() || '';
    if (!commentValue) {
      this.commentFormControl.markAsTouched();
      this.toasterService.error(this.i18nService.translate('plans.comments.enterComment'));
      return;
    }

    if (commentValue.length > 255) {
      this.toasterService.error(this.i18nService.translate('plans.comments.maxLength'));
      return;
    }

    // Update comment
    this.comment.set(commentValue);
    this.commentFormControl.setValue(commentValue, { emitEvent: false });
    this.commentPhase.set('viewing');
    this.commentFormControl.disable();

    // Merge this page's comment into planComments (add/remove fields as user selected)
    this.planCommentSyncService.syncPageCommentToStore(this.pageComment());

    this.toasterService.success(this.i18nService.translate('plans.comments.updatesSavedSuccess'));
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
  isFieldShouldbeCorrected(inputKey: string, section?: string): boolean {
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
