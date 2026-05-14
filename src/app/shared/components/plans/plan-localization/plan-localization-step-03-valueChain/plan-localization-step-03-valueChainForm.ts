import { ChangeDetectionStrategy, Component, computed, effect, inject, input, model } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AbstractControl, FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { EInHouseProcuredType, ELocalizationStatusType, EMaterialsFormControls, EOpportunityLocalizationTablesValidation, EPlanPageTitle } from 'src/app/shared/enums';
import { BaseErrorMessages } from 'src/app/shared/components/base-components/base-error-messages/base-error-messages';
import { PlanValueChainSectionComponent } from './plan-value-chain-section/plan-value-chain-section.component';
import { TooltipModule } from 'primeng/tooltip';
import { ValueChainSummaryComponent } from './value-chain-summary/value-chain-summary.component';
import { PlanStore } from 'src/app/shared/stores/plan/plan.store';
import { IFieldInformation, IPageComment, IProductPlanResponse } from 'src/app/shared/interfaces/plans.interface';
import { getFieldValueFromProductPlanResponse } from 'src/app/shared/utils/plan-original-value-from-response';
import { createValueChainFieldKey, extractValueChainControlName, extractValueChainIndex } from 'src/app/shared/utils/value-chain-field-helpers';
import { TColors } from 'src/app/shared/interfaces';
import { GeneralConfirmationDialogComponent } from 'src/app/shared/components/utility-components/general-confirmation-dialog/general-confirmation-dialog.component';
import { PlanStepBaseClass } from '../plan-step-base-class';
import { TCommentPhase } from 'src/app/shared/types/plan-comments.types';
import { ProductPlanFormService } from 'src/app/shared/services/plan/product-plan-form-service/product-plan-form-service';
import { CommentStateComponent } from '../../comment-state-component/comment-state-component';
import { CommentInputComponent } from '../../comment-input/comment-input';
import { OpportunitiesStore } from 'src/app/shared/stores/opportunities/opportunities.store';
import { TranslatePipe } from 'src/app/shared/pipes/translate.pipe';
import { I18nService } from 'src/app/shared/services/i18n';
import { GroupInputWithCheckbox } from 'src/app/shared/components/form/group-input-with-checkbox/group-input-with-checkbox';
import { DEFAULT_PLAN_SECTION_TITLE_TEXT_CLASS } from 'src/app/shared/utils/plan-wizard-comment-color';

@Component({
  selector: 'app-plan-localization-step-03-valueChain-form',
  imports: [
    TranslatePipe,
    ReactiveFormsModule,
    BaseErrorMessages,
    PlanValueChainSectionComponent,
    TooltipModule,
    ValueChainSummaryComponent,
    GeneralConfirmationDialogComponent,
    CommentStateComponent,
    CommentInputComponent,
    GroupInputWithCheckbox,
  ],
  templateUrl: './plan-localization-step-03-valueChainForm.html',
  styleUrl: './plan-localization-step-03-valueChainForm.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlanLocalizationStep03ValueChainForm extends PlanStepBaseClass {
  readonly opportunitiesStore = inject(OpportunitiesStore);
  private readonly i18n = inject(I18nService);
  isViewMode = input<boolean>(false);

  /** Translated table headers for value chain sections (Expense Header, In-house/Procured, Cost %, Year 1–7) */
  override readonly planStore = inject(PlanStore);
  readonly planFormService = inject(ProductPlanFormService);

  /** Stable callbacks for `app-plan-value-chain-section` (template function inputs). */
  readonly valueChainGetHasCommentControl = (formGroup: AbstractControl) => this.getHasCommentControl(formGroup);
  readonly valueChainGetValueControl = (formGroup: AbstractControl) => this.getValueControl(formGroup);
  readonly valueChainHighlightInput = (inputKey: string, rowId?: string) => this.highlightInput(inputKey, rowId);
  readonly valueChainShouldHighlightTdInReviewMode = (
    inputKey: string,
    rowId: string | undefined | null,
    itemControl: AbstractControl,
    controlName: string
  ) => this.shouldHighlightTdInReviewMode(inputKey, rowId, itemControl, controlName);
  readonly valueChainOnInHouseOrProcuredChange = (itemControl: AbstractControl) =>
    this.onInHouseOrProcuredChange(itemControl);

  pageTitle = input<EPlanPageTitle>(EPlanPageTitle.ValueChain);

  formGroup = this.planFormService.step3_valueChain;

  selectedInputColor = input<TColors>('orange');
  commentPhase = model<TCommentPhase>('none');
  selectedInputs = model<IFieldInformation[]>([]);
  pageComments = input<IPageComment[]>([]);
  commentTitle = input<string>('Comments');
  correctedFieldIds = input<string[]>([]);
  correctedFields = input<IFieldInformation[]>([]);
  showCommentState = input<boolean>(false);
  originalPlanResponse = input<IProductPlanResponse | null>(null);
  /** Tailwind text color for the value-chain section title; driven by wizard when step has comments. */
  valueChainComponentsTitleColorClass = input<string>(DEFAULT_PLAN_SECTION_TITLE_TEXT_CLASS);

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

  // Implement abstract method from base class
  getFormGroup(): FormGroup {
    return this.formGroup;
  }

  /** Whole-step comment checkbox (Review mode); bound to `valueChainPageCommentGroup.hasComment`. */
  get valueChainPageCommentGroup(): FormGroup | null {
    const g = this.formGroup.get(EMaterialsFormControls.valueChainPageCommentGroup);
    return g instanceof FormGroup ? g : null;
  }

  protected override shouldEnableEntireFormInResubmitMode(): boolean {
    if (!this.isResubmitMode()) return false;
    return this.pageComments().some(c => {
      if ((c.comment ?? '').trim().length > 0) return true;
      return (c.fields ?? []).some(f => f.section === 'valueChain' && f.inputKey === 'valueChainPage');
    });
  }

  protected override onEntireFormEnabledInResubmit(): void {
    setTimeout(() => this.applyYearsViewForAllRows(), 0);
  }

  // Expose base class methods as public for template access
  override highlightInput(inputKey: string, rowId?: string): boolean {
    return super.highlightInput(inputKey, rowId);
  }

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



  // Get section FormArrays
  getDesignEngineeringFormArray(): FormArray | null {
    return this.planFormService.getValueChainSectionFormArray(EMaterialsFormControls.designEngineeringFormGroup);
  }

  getSourcingFormArray(): FormArray | null {
    return this.planFormService.getValueChainSectionFormArray(EMaterialsFormControls.sourcingFormGroup);
  }

  getManufacturingFormArray(): FormArray | null {
    return this.planFormService.getValueChainSectionFormArray(EMaterialsFormControls.manufacturingFormGroup);
  }

  getAssemblyTestingFormArray(): FormArray | null {
    return this.planFormService.getValueChainSectionFormArray(EMaterialsFormControls.assemblyTestingFormGroup);
  }

  getAfterSalesFormArray(): FormArray | null {
    return this.planFormService.getValueChainSectionFormArray(EMaterialsFormControls.afterSalesFormGroup);
  }

  // Factory functions for creating new items (used by form-array-input component)
  createDesignEngineeringItem = (): FormGroup => {
    return this.planFormService.createValueChainItem();
  };

  createSourcingItem = (): FormGroup => {
    return this.planFormService.createValueChainItem();
  };

  createManufacturingItem = (): FormGroup => {
    return this.planFormService.createValueChainItem();
  };

  createAssemblyTestingItem = (): FormGroup => {
    return this.planFormService.createValueChainItem();
  };

  createAfterSalesItem = (): FormGroup => {
    return this.planFormService.createValueChainItem();
  };

  // Remove handlers - delegate to FormService so deletions sync with payload
  removeDesignEngineeringItem = (index: number) => this.planFormService.removeValueChainItem(EMaterialsFormControls.designEngineeringFormGroup, index);
  removeSourcingItem = (index: number) => this.planFormService.removeValueChainItem(EMaterialsFormControls.sourcingFormGroup, index);
  removeManufacturingItem = (index: number) => this.planFormService.removeValueChainItem(EMaterialsFormControls.manufacturingFormGroup, index);
  removeAssemblyTestingItem = (index: number) => this.planFormService.removeValueChainItem(EMaterialsFormControls.assemblyTestingFormGroup, index);
  removeAfterSalesItem = (index: number) => this.planFormService.removeValueChainItem(EMaterialsFormControls.afterSalesFormGroup, index);

  /** Create unique field key for value chain: section_control_index */
  createFieldKey = createValueChainFieldKey;
  /**
   * TD orange background: Review mode only, corrected field, and user has NOT checked the box (not yet addressed).
   * When user selects/checks the input, no orange.
   */
  shouldHighlightTdInReviewMode(
    inputKey: string,
    rowId: string | undefined | null,
    itemControl: AbstractControl,
    controlName: string
  ): boolean {
    if (this.planStore.wizardMode() !== 'Review') return false;
    if (this.selectedInputColor() !== 'green') return false;
    const isCorrectedField = this.correctedFields().some(
      f => f.inputKey === inputKey && (rowId == null ? f.id == null : f.id === rowId)
    );
    if (!isCorrectedField) return false;
    const fieldGroup = itemControl.get(controlName);
    const hasCommentChecked = fieldGroup instanceof FormGroup
      ? !!(fieldGroup.get(EMaterialsFormControls.hasComment)?.value)
      : false;
    return !hasCommentChecked;
  }

  /** Section type to number: designEngineering=1, sourcing=2, manufacturing=3, assemblyTesting=4, afterSales=5 */
  private static readonly SECTION_TYPE_MAP: Record<string, number> = {
    designEngineering: 1,
    sourcing: 2,
    manufacturing: 3,
    assemblyTesting: 4,
    afterSales: 5,
  };

  /** True when valueChainRows in originalPlanResponse has at least one row with this sectionType */
  hasSectionInResponse(sectionKey: string): boolean {
    const response = this.originalPlanResponse();
    const pp = response?.productPlan;
    const rows = pp?.valueChainStep?.valueChainRows ?? (pp as any)?.valueChainRows ?? [];
    const sectionType = PlanLocalizationStep03ValueChainForm.SECTION_TYPE_MAP[sectionKey];
    return sectionType != null && rows.some((r: { sectionType: number }) => r.sectionType === sectionType);
  }

  /** Years (1-7) that have fields in correctedFields - for value-chain-summary highlight. Review mode only. */
  highlightedYears = computed(() => {
    if (this.planStore.wizardMode() !== 'Review') return [];
    const fields = this.correctedFields();
    const years = new Set<number>();
    (fields ?? []).forEach((f) => {
      const m = f.inputKey?.match(/year(\d+)/);
      if (m) years.add(parseInt(m[1], 10));
    });
    return [...years];
  });

  private static readonly YEAR_KEYS = [
    EMaterialsFormControls.year1,
    EMaterialsFormControls.year2,
    EMaterialsFormControls.year3,
    EMaterialsFormControls.year4,
    EMaterialsFormControls.year5,
    EMaterialsFormControls.year6,
    EMaterialsFormControls.year7,
  ] as const;

  private static readonly SECTION_CONFIG: { key: string; getArray: (c: PlanLocalizationStep03ValueChainForm) => FormArray | null }[] = [
    { key: 'designEngineering', getArray: c => c.getDesignEngineeringFormArray() },
    { key: 'sourcing', getArray: c => c.getSourcingFormArray() },
    { key: 'manufacturing', getArray: c => c.getManufacturingFormArray() },
    { key: 'assemblyTesting', getArray: c => c.getAssemblyTestingFormArray() },
    { key: 'afterSales', getArray: c => c.getAfterSalesFormArray() },
  ];

  /**
   * When a corrected field becomes dirty in resubmit mode: do NOT enable other fields in the row.
   * Each field stays independent; changing one field does not unlock siblings.
   */
  protected override onCorrectedFieldBecameDirty(_control: AbstractControl, _field: IFieldInformation): void {
    // Do not enable sibling fields when any corrected field changes
    return;
  }

  /**
   * Add year value controls for Procured rows with corrected fields so the base class does not disable them.
   */
  protected override collectAdditionalEnabledControlsForResubmit(
    correctedFields: IFieldInformation[]
  ): { controls: AbstractControl[]; parentChains: Map<AbstractControl, AbstractControl[]> } {
    const controls: AbstractControl[] = [];
    const parentChains = new Map<AbstractControl, AbstractControl[]>();
    if (!this.isResubmitMode() || !correctedFields?.length) return { controls, parentChains };
    for (const { key, getArray } of PlanLocalizationStep03ValueChainForm.SECTION_CONFIG) {
      const arr = getArray(this);
      if (!arr) continue;
      arr.controls.forEach((item, index) => {
        const rowId = item.get('rowId')?.value ?? null;
        const inHouseVal = item.get(EMaterialsFormControls.inHouseOrProcured)?.get(EMaterialsFormControls.value)?.value;
        const isProcured = inHouseVal !== '1' && inHouseVal !== EInHouseProcuredType.InHouse && inHouseVal !== EInHouseProcuredType.InHouse.toString();
        if (!isProcured) return;
        if (!this.shouldEnableYearsForProcuredRowInResubmit(key, index, rowId, true, correctedFields)) return;
        for (const yearKey of PlanLocalizationStep03ValueChainForm.YEAR_KEYS) {
          const yearGroup = item.get(yearKey);
          if (!(yearGroup instanceof FormGroup)) continue;
          const valueCtrl = this.planFormService.getValueControl(yearGroup);
          controls.push(valueCtrl);
          parentChains.set(valueCtrl, this.buildParentChain(valueCtrl));
        }
      });
    }
    return { controls, parentChains };
  }

  /** When user changes In-house/Procured: apply years enable/disable for that row. In resubmit, only applies on user change (not on loadPlanData). */
  onInHouseOrProcuredChange(itemControl: AbstractControl): void {
    if (this.planStore.wizardMode() === 'view' || this.planStore.wizardMode() === 'Review') return;
    const section = this.getSectionForItemControl(itemControl);
    if (!section) return;

    // Resubmit: year fields gate on `userChangedInHouse` (value control dirty). PrimeNG may emit
    // `onChange` before the control is marked dirty; ensure dirty so years enable when switching to Procured.
    if (this.isResubmitMode()) {
      const inHouseValueCtrl = itemControl.get(EMaterialsFormControls.inHouseOrProcured)?.get(EMaterialsFormControls.value);
      inHouseValueCtrl?.markAsDirty();
    }

    this.applyYearsViewForItem(itemControl, section.key, section.index, true);

    // In resubmit mode: when switching to In House, years become null (not applicable). Remove them from selectedInputs
    // so they are no longer highlighted as corrected - their value has effectively changed to null.
    if (this.isResubmitMode()) {
      const inHouseVal = itemControl.get(EMaterialsFormControls.inHouseOrProcured)?.get(EMaterialsFormControls.value)?.value;
      const isInHouse = inHouseVal === '1' || inHouseVal === EInHouseProcuredType.InHouse || inHouseVal === EInHouseProcuredType.InHouse.toString();
      if (isInHouse) {
        this.removeYearFieldsFromSelectedInputs(section.key, section.index, itemControl.get('rowId')?.value ?? null);
      }
    }
  }

  /** Remove year (1–7) fields for a given row from selectedInputs. Used when switching to In House in resubmit mode. */
  private removeYearFieldsFromSelectedInputs(sectionKey: string, index: number, rowId: string | null): void {
    const yearInputKeys = PlanLocalizationStep03ValueChainForm.YEAR_KEYS.map(yearKey =>
      createValueChainFieldKey(sectionKey, yearKey, index)
    );
    const current = this.selectedInputs();
    const updated = current.filter(
      input =>
        !(
          yearInputKeys.includes(input.inputKey) &&
          (rowId == null ? input.id == null : input.id === rowId)
        )
    );
    if (updated.length !== current.length) this.selectedInputs.set(updated);
  }

  private getSectionForItemControl(itemControl: AbstractControl): { key: string; index: number } | null {
    for (const { key, getArray } of PlanLocalizationStep03ValueChainForm.SECTION_CONFIG) {
      const arr = getArray(this);
      if (!arr) continue;
      const idx = arr.controls.indexOf(itemControl);
      if (idx >= 0) return { key, index: idx };
    }
    return null;
  }

  /** Apply years enable/disable for a single row. In create/edit: In House = hide years + set "No"; Procured = show years + null. */
  private applyYearsViewForItem(itemControl: AbstractControl, sectionKey: string, index: number, clearStaleNoFromInHouseTransition = false): void {
    const inHouseVal = itemControl.get(EMaterialsFormControls.inHouseOrProcured)?.get(EMaterialsFormControls.value)?.value;
    const inHouseCtrl = itemControl.get(EMaterialsFormControls.inHouseOrProcured)?.get(EMaterialsFormControls.value);
    const rowId = itemControl.get('rowId')?.value ?? null;
    const isInHouse = inHouseVal === '1' || inHouseVal === EInHouseProcuredType.InHouse || inHouseVal === EInHouseProcuredType.InHouse.toString();
    const userChangedInHouse = !!(inHouseCtrl && inHouseCtrl.dirty);
    const anyFieldInRowDirty = this.isAnyControlInRowDirty(itemControl);
    const isCreateOrEdit = !this.isViewMode() && this.planStore.wizardMode() !== 'Review' && this.planStore.wizardMode() !== 'resubmit';
    const isEntireFormEnabledInResubmit = this.isResubmitMode() && this.shouldEnableEntireFormInResubmitMode();

    for (const yearKey of PlanLocalizationStep03ValueChainForm.YEAR_KEYS) {
      const yearGroup = itemControl.get(yearKey);
      if (!(yearGroup instanceof FormGroup)) continue;
      const valueCtrl = this.getValueControl(yearGroup);

      const fieldKey = createValueChainFieldKey(sectionKey, yearKey, index);
      const isYearCorrected = this.isYearCorrected(fieldKey, rowId);

      if (isInHouse) {
        if (isCreateOrEdit || userChangedInHouse) {
          valueCtrl.setValue(null);
        }
        valueCtrl.removeValidators(Validators.required);
        valueCtrl.disable();
        yearGroup.disable({ emitEvent: false, onlySelf: true });
      } else {
        // Only clear year when user JUST switched from In House to Procured (stale "No" → null for fresh input).
        // Do NOT clear when costPercentage/expenseHeader changes: "No" is a valid Procured choice and inHouse stays dirty.
        const yearValue = valueCtrl.value;
        if (clearStaleNoFromInHouseTransition && userChangedInHouse && yearValue === ELocalizationStatusType.No.toString()) {
          valueCtrl.setValue(null);
        }
        // In resubmit: enable when any field in row is corrected and current is Procured (on load/revisit)
        const procuredRowWithCorrectedField = this.shouldEnableYearsForProcuredRowInResubmit(sectionKey, index, rowId, !isInHouse);
        const canEdit =
          !this.isResubmitMode() ||
          isEntireFormEnabledInResubmit ||
          isYearCorrected ||
          userChangedInHouse ||
          anyFieldInRowDirty ||
          procuredRowWithCorrectedField;
        if (canEdit) {
          yearGroup.enable({ emitEvent: false, onlySelf: true });
          valueCtrl.enable();
          valueCtrl.addValidators(Validators.required);
        } else {
          valueCtrl.disable();
          yearGroup.disable({ emitEvent: false, onlySelf: true });
        }
      }
      valueCtrl.updateValueAndValidity();
    }
  }

  private isAnyControlInRowDirty(rowControl: AbstractControl): boolean {
    if (!(rowControl instanceof FormGroup)) return false;
    const allNames = [
      EMaterialsFormControls.expenseHeader,
      EMaterialsFormControls.inHouseOrProcured,
      EMaterialsFormControls.costPercentage,
      ...PlanLocalizationStep03ValueChainForm.YEAR_KEYS,
    ];
    return allNames.some((name) => {
      const group = rowControl.get(name);
      if (!(group instanceof FormGroup)) return false;
      const valueCtrl = group.get(EMaterialsFormControls.value);
      return !!(valueCtrl && valueCtrl.dirty);
    });
  }

  private isYearCorrected(fieldKey: string, rowId: string | null): boolean {
    return this.correctedFields().some(
      f =>
        f.inputKey === fieldKey &&
        ((rowId == null && f.id == null) || f.id === rowId)
    );
  }

  /**
   * In resubmit: true when current is Procured, original was In-House, and inHouseOrProcured is in correctedFields.
   * Only enables year fields when investor switched from In-House to Procured (on load/revisit).
   */
  private shouldEnableYearsForProcuredRowInResubmit(
    sectionKey: string,
    index: number,
    rowId: string | null,
    currentIsProcured: boolean,
    correctedOverride?: IFieldInformation[]
  ): boolean {
    if (!this.isResubmitMode() || !currentIsProcured) return false;
    const corrected = correctedOverride ?? this.correctedFields();
    if (!corrected?.length) return false;
    const inHouseFieldKey = createValueChainFieldKey(sectionKey, EMaterialsFormControls.inHouseOrProcured, index);
    const isInHouseCorrected = corrected.some(
      f =>
        (f.inputKey === inHouseFieldKey || (f.section === sectionKey && extractValueChainControlName(f.inputKey) === EMaterialsFormControls.inHouseOrProcured && extractValueChainIndex(f.inputKey) === index)) &&
        ((rowId == null && f.id == null) || f.id === rowId)
    );
    if (!isInHouseCorrected) return false;
    const field: IFieldInformation = { section: sectionKey, inputKey: inHouseFieldKey, id: rowId ?? undefined, label: '' };
    const originalVal = this.getOriginalFieldValueFromPlanResponse(field);
    const wasInHouse = originalVal === '1' || originalVal === 1 || originalVal === EInHouseProcuredType.InHouse || originalVal === EInHouseProcuredType.InHouse.toString();
    return wasInHouse;
  }

  private applyYearsViewForAllRows(): void {
    if (this.isViewMode() || this.planStore.wizardMode() === 'Review') return;
    for (const { key, getArray } of PlanLocalizationStep03ValueChainForm.SECTION_CONFIG) {
      const arr = getArray(this);
      if (!arr) continue;
      arr.controls.forEach((item, index) => {
        this.applyYearsViewForItem(item, key, index);
      });
    }
  }

  // @ts-expect-error - Intentionally shadowing base class method with incompatible signature (itemControl vs rowId)
  upDateSelectedInputs = (value: boolean, fieldInformation: IFieldInformation, itemControl?: AbstractControl): void => {
    // Extract row ID if itemControl is provided
    let rowId: string | undefined;
    if (itemControl) {
      rowId = itemControl.get('rowId')?.value;
    }
    // Call protected base class method with extracted rowId
    super.upDateSelectedInputs(value, fieldInformation, rowId);
  };

  isRequired(item: EOpportunityLocalizationTablesValidation): boolean {
    return this.opportunitiesStore.opportunityLocalizationTablesValidation()?.[item] ?? false;
  }

  get EOpportunityLocalizationTablesValidation() {
    return EOpportunityLocalizationTablesValidation
  }

  override ngOnInit(): void {
    super.ngOnInit();
    if (!this.isResubmitMode()) {
      this.applyYearsViewForAllRows();
    } else {
      // In resubmit: run after base class effect (setTimeout ensures we run after disableUnselectedSiblings)
      setTimeout(() => {
        this.applyYearsViewForAllRows();
        // Nested setTimeout: subscribe AFTER all initial programmatic value changes
        // (base class enable + applyYearsViewForAllRows from both ngOnInit and the
        // initializeStepSpecificLogic effect) have settled.
        setTimeout(() => this.setupResubmitClearIndicatorOnChange(), 0);
      }, 0);
    }
  }

  /** Tracks whether the resubmit "clear indicator" subscription is already attached. */
  private resubmitClearIndicatorSubscribed = false;

  /**
   * In resubmit mode, once the investor mutates any value chain section
   * (row added/removed or a field value edited), the step's orange indicator
   * should be cleared because the investor has acted on the corrections.
   *
   * Only watches the five section FormArrays (designEngineering, sourcing,
   * manufacturing, assemblyTesting, afterSales). Changes to the page-level
   * comment input or hasComment groups are intentionally excluded.
   */
  private setupResubmitClearIndicatorOnChange(): void {
    if (this.resubmitClearIndicatorSubscribed) return;
    this.resubmitClearIndicatorSubscribed = true;

    PlanLocalizationStep03ValueChainForm.SECTION_CONFIG.forEach(({ getArray }) => {
      const arr = getArray(this);
      if (!arr) return;
      arr.valueChanges
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(() => {
          if (!this.isResubmitMode()) return;
          if (this.selectedInputs().length === 0) return;
          this.selectedInputs.set([]);
        });
    });
  }

  // Override hook method for step-specific initialization
  protected override initializeStepSpecificLogic(): void {
    effect(() => {
      const validation = this.opportunitiesStore.opportunityLocalizationTablesValidation();
      this.planFormService.updateValueChainValidation(validation);
    });

    effect(() => {
      const mode = this.planStore.wizardMode();
      const corrected = this.correctedFields();
      if (mode === 'resubmit') {
        if (!corrected?.length) return;
        setTimeout(() => this.applyYearsViewForAllRows(), 0);
        return;
      }
      if (mode === 'edit' && this.planStore.productPlanData()) {
        setTimeout(() => this.applyYearsViewForAllRows(), 0);
      }
    });
  }

  getOriginalFieldValueFromPlanResponse(field: IFieldInformation): any {
    return getFieldValueFromProductPlanResponse(field, this.originalPlanResponse());
  }

  // Implement abstract method from base class to get form control for a field (handles FormArray rows)
  getControlForField(field: IFieldInformation): FormControl<any> | null {
    const { section, inputKey, id: rowId } = field;

    // Get the appropriate FormArray based on section
    let formArray: FormArray | null = null;
    if (section === 'designEngineering') {
      formArray = this.getDesignEngineeringFormArray();
    } else if (section === 'sourcing') {
      formArray = this.getSourcingFormArray();
    } else if (section === 'manufacturing') {
      formArray = this.getManufacturingFormArray();
    } else if (section === 'assemblyTesting') {
      formArray = this.getAssemblyTestingFormArray();
    } else if (section === 'afterSales') {
      formArray = this.getAfterSalesFormArray();
    }

    if (!formArray) return null;

    // Find the row: by rowId when available, otherwise by index from unique inputKey (for new unsaved rows)
    let rowIndex = -1;
    if (rowId) {
      rowIndex = formArray.controls.findIndex(
        control => control.get('rowId')?.value === rowId
      );
    }
    if (rowIndex === -1) {
      const indexFromKey = extractValueChainIndex(inputKey);
      if (indexFromKey >= 0 && indexFromKey < formArray.length) {
        rowIndex = indexFromKey;
      }
    }
    if (rowIndex === -1) return null;

    const rowControl = formArray.at(rowIndex);
    const controlName = extractValueChainControlName(inputKey);
    const fieldControl = rowControl.get(controlName);
    if (fieldControl) {
      return this.getValueControl(fieldControl);
    }

    return null;
  }

}

