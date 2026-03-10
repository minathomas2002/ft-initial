import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  model,
  signal,
  DestroyRef,
} from '@angular/core';
import { FormArray, ReactiveFormsModule, FormControl, AbstractControl, FormGroup } from '@angular/forms';
import { BaseLabelComponent } from 'src/app/shared/components/base-components/base-label/base-label.component';
import { InputTextModule } from 'primeng/inputtext';
import { DatePickerModule } from 'primeng/datepicker';
import { SelectModule } from 'primeng/select';
import { GroupInputWithCheckbox } from 'src/app/shared/components/form/group-input-with-checkbox/group-input-with-checkbox';
import { FormArrayInput } from 'src/app/shared/components/utility-components/form-array-input/form-array-input';
import { BaseErrorMessages } from 'src/app/shared/components/base-components/base-error-messages/base-error-messages';
import { RadioButtonModule } from 'primeng/radiobutton';
import { TrimOnBlurDirective, ConditionalColorClassDirective, HidePlaceholderWhenDisabledEmptyDirective } from 'src/app/shared/directives';
import { PlanStore } from 'src/app/shared/stores/plan/plan.store';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { EMaterialsFormControls, EPlanPageTitle } from 'src/app/shared/enums';
import { EServiceProvidedTo } from 'src/app/shared/enums';
import { PhoneInputComponent } from 'src/app/shared/components/form/phone-input/phone-input.component';
import { ServicePlanFormService } from 'src/app/shared/services/plan/service-plan-form-service/service-plan-form-service';
import { TextareaModule } from 'primeng/textarea';
import { CommentStateComponent } from '../../comment-state-component/comment-state-component';
import { GeneralConfirmationDialogComponent } from 'src/app/shared/components/utility-components/general-confirmation-dialog/general-confirmation-dialog.component';
import { PlanStepBaseClass } from '../../plan-localization/plan-step-base-class';
import { TCommentPhase } from 'src/app/shared/types/plan-comments.types';
import { IFieldInformation, IPageComment, IServiceLocalizationPlanResponse } from 'src/app/shared/interfaces/plans.interface';
import { ISelectItem, TColors } from 'src/app/shared/interfaces';
import { getFieldValueFromServicePlanResponse } from 'src/app/shared/utils/plan-original-value-from-response';
import { FormsModule } from '@angular/forms';
import { CommentInputComponent } from '../../comment-input/comment-input';
import { MultiSelect } from 'primeng/multiselect';
import { InputNumber, InputNumberModule } from 'primeng/inputnumber';
import { TranslatePipe } from 'src/app/shared/pipes';

@Component({
  selector: 'app-service-localization-step-overview',
  imports: [
    ReactiveFormsModule,
    BaseLabelComponent,
    InputTextModule,
    DatePickerModule,
    SelectModule,
    GroupInputWithCheckbox,
    FormArrayInput,
    BaseErrorMessages,
    RadioButtonModule,
    TrimOnBlurDirective,
    ConditionalColorClassDirective,
    HidePlaceholderWhenDisabledEmptyDirective,
    PhoneInputComponent,
    TextareaModule,
    CommentStateComponent,
    GeneralConfirmationDialogComponent,
    FormsModule,
    CommentInputComponent,
    MultiSelect,
    InputNumberModule,
    TranslatePipe
  ],
  templateUrl: './service-localization-step-overview.html',
  styleUrl: './service-localization-step-overview.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ServiceLocalizationStepOverview extends PlanStepBaseClass {
  isViewMode = input<boolean>(false);
  isReviewMode = input<boolean>(false);

  readonly planFormService = inject(ServicePlanFormService);
  override readonly planStore = inject(PlanStore);
  override readonly destroyRef = inject(DestroyRef);

  pageTitle = input.required<EPlanPageTitle>();
  selectedInputColor = input.required<TColors>();
  commentPhase = model<TCommentPhase>('none');
  selectedInputs = model<IFieldInformation[]>([]);
  pageComments = input<IPageComment[]>([]);
  commentTitle = input<string>('Comments');
  correctedFieldIds = input<string[]>([]);
  correctedFields = input<IFieldInformation[]>([]);
  showCommentState = input<boolean>(false);
  originalPlanResponse = input<IServiceLocalizationPlanResponse | null>(null);
  showWarningMesageDeletedOpportunity = computed(() => {
    return this.planStore.linkedToDeletedOpportunity()
  });

  onViewOpportunityDetails(event: MouseEvent): void {
    if (!this.showWarningMesageDeletedOpportunity()) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    this.toasterService.error('Opportunity is no longer available');
  }


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

  get formGroup() {
    return this.planFormService?.step2_overview ?? new FormGroup({});
  }

  get basicInformationFormGroup() {
    return this.planFormService?.basicInformationFormGroup;
  }
  get basicInformationFormGroupControls() {
    return this.planFormService?.basicInformationFormGroup?.controls;
  }
  get companyInformationFormGroup() {
    return this.planFormService?.overviewCompanyInformationFormGroup;
  }
  get companyInformationFormGroupControls() {
    return this.planFormService?.overviewCompanyInformationFormGroup?.controls;
  }
  get locationInformationFormGroup() {
    return this.planFormService?.locationInformationFormGroup;
  }
  get locationInformationFormGroupControls() {
    return this.planFormService?.locationInformationFormGroup?.controls;
  }
  get localAgentInformationFormGroup() {
    return this.planFormService?.localAgentInformationFormGroup;
  }
  get localAgentInformationFormGroupControls() {
    return this.planFormService?.localAgentInformationFormGroup?.controls;
  }

  getDetailsFormArray(): FormArray {
    return this.planFormService?.getServiceDetailsFormArray() ?? new FormArray<any>([]);
  }

  // Dropdown options
  serviceTypeOptions = this.planStore.serviceTypeOptions;
  serviceCategoryOptions = this.planStore.serviceCategoryOptions;
  serviceProvidedToOptions = this.planStore.serviceProvidedToOptions;
  yesNoOptions = this.planStore.yesNoOptions;
  localizationMethodologyOptions = this.planStore.localizationMethodologyOptions;

  availableOpportunities = this.planStore.availableOpportunities;
  isLoadingAvailableOpportunities = this.planStore.isLoadingAvailableOpportunities;

  private get doYouCurrentlyHaveLocalAgentInKSAControl() {
    return this.locationInformationFormGroupControls?.[EMaterialsFormControls.doYouCurrentlyHaveLocalAgentInKSA];
  }

  // Use private field with getter to ensure signal is always initialized
  private _doYouHaveLocalAgentInKSASignal: ReturnType<typeof signal<boolean | null>> | undefined;
  private get doYouHaveLocalAgentInKSASignal(): ReturnType<typeof signal<boolean | null>> {
    if (!this._doYouHaveLocalAgentInKSASignal) {
      this._doYouHaveLocalAgentInKSASignal = signal<boolean | null>(null);
    }
    return this._doYouHaveLocalAgentInKSASignal;
  }

  showLocalAgentInformation = computed(() => {
    return this.doYouHaveLocalAgentInKSASignal() === true;
  });

  isOpportunityDisabled = computed(() => {
    return this.planStore.appliedOpportunity() !== null;
  });

  availableQuarters = computed(() => this.planFormService?.getAvailableQuarters(5) ?? []);

  // Implement abstract method from base class
  getFormGroup(): FormGroup {
    return this.formGroup;
  }
  opportunityControlSignal = toSignal<ISelectItem | null>(this.getFormControl(this.basicInformationFormGroupControls[EMaterialsFormControls.opportunity]).valueChanges, {
    initialValue: this.getFormControl(this.basicInformationFormGroupControls[EMaterialsFormControls.opportunity]).value ?? null
  });

  // Expose base class methods as public for template access
  override upDateSelectedInputs(value: boolean, fieldInformation: IFieldInformation, rowId?: string): void {
    super.upDateSelectedInputs(value, fieldInformation, rowId);
  }

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

  // override onSaveComment(): void {
  //   super.onSaveComment();
  // }

  override onSaveEditedComment(): void {
    super.onSaveEditedComment();
  }

  onServiceProvidedToChange(value: Array<string | number> | null, index: number): void {
    this.planFormService.toggleServiceProvidedToCompanyNamesValidation(value, index);

    // When user deselects "Others", remove the Company Names field from selectedInputs
    // so the wizard indicator updates correctly (description is no longer a required field).
    if (!this.hasServiceProvidedToOthers(value)) {
      const inputKey = `serviceProvidedToCompanyNames`;
      const current = this.selectedInputs();
      const updated = current.filter(
        input => !(input.section === 'serviceDetails' && input.inputKey === inputKey)
      );
      if (updated.length !== current.length) {
        this.selectedInputs.set(updated);
      }
    }
  }

  onServiceTargetedForLocalizationChange(value: string | boolean | number | null, index: number): void {
    this.planFormService.toggleExpectedLocalizationDateValidation(value, index);
  }

  onRegisteredVendorIDWithSecInput(event: Event): void {
    const inputEl = event.target as HTMLInputElement | null;
    if (!inputEl) return;

    const rawValue = inputEl.value ?? '';
    const digitsOnly = rawValue.replace(/\D+/g, '').slice(0, 7);

    if (digitsOnly !== rawValue) {
      inputEl.value = digitsOnly;
    }

    const ctrl = this.getValueControl(this.locationInformationFormGroupControls?.[EMaterialsFormControls.registeredVendorIDwithSEC]);
    if (!ctrl) return;

    // Allow empty strings and nulls; user clearing the field should remain valid.
    const nextValue: string | null = digitsOnly;

    // Apply after Angular's DefaultValueAccessor runs, ensuring the FormControl ends up sanitized.
    queueMicrotask(() => {
      if (ctrl.value !== nextValue) {
        ctrl.setValue(nextValue, { emitEvent: false });
      }
    });
  }

  hasServiceProvidedToOthers(value: unknown): boolean {
    const list = Array.isArray(value) ? value : [];
    const selected = list.map((v) => String(v));
    return selected.includes(EServiceProvidedTo.Others.toString());
  }

  // Override hook method for step-specific initialization
  protected override initializeStepSpecificLogic(): void {
    // Defer service-dependent initialization until after component is fully constructed
    // This ensures planFormService is available (inject() runs during property initialization)
    effect(() => {
      // Access planFormService to ensure it's initialized
      const service = this.planFormService;
      if (!service) {
        return;
      }

      // Sync services from cover page to overview details on component initialization
      // Use a flag to ensure this only runs once
      if (!this._servicesSynced) {
        service.syncServicesFromCoverPageToOverview();
        this._servicesSynced = true;
      }

      // Initialize validation for existing details rows (use current values)
      const detailsArray = this.getDetailsFormArray();
      if (detailsArray) {
        detailsArray.controls.forEach((ctrl, idx) => {
          const serviceProvidedToControl = ctrl.get(EMaterialsFormControls.serviceProvidedTo);
          if (serviceProvidedToControl) {
            const val = this.getValueControl(serviceProvidedToControl)?.value ?? null;
            service.toggleServiceProvidedToCompanyNamesValidation(val, idx);
          }

          const serviceTargetedForLocalizationControl = ctrl.get(
            EMaterialsFormControls.serviceTargetedForLocalization
          );
          if (serviceTargetedForLocalizationControl) {
            const val = this.getValueControl(serviceTargetedForLocalizationControl)?.value ?? null;
            // Preserve expectedLocalizationDate value before toggling validation
            // (toggle may reset it if serviceTargetedForLocalization is not "Yes")
            const expectedLocalizationDateControl = ctrl.get(EMaterialsFormControls.expectedLocalizationDate);
            const expectedLocalizationDateValue = expectedLocalizationDateControl
              ? this.getValueControl(expectedLocalizationDateControl)?.value ?? null
              : null;

            service.toggleExpectedLocalizationDateValidation(val, idx);

            // Restore the value if it was cleared by the toggle
            if (expectedLocalizationDateValue && expectedLocalizationDateControl) {
              const valueControl = this.getValueControl(expectedLocalizationDateControl);
              if (valueControl && !valueControl.value) {
                valueControl.setValue(expectedLocalizationDateValue, { emitEvent: false });
              }
            }
          }
        });
      }
    });

    // In resubmit mode, ensure dependent "Others" fields are enabled when relevant
    effect(() => {
      if (!this.isResubmitMode()) {
        return;
      }
      const detailsArray = this.getDetailsFormArray();
      if (!detailsArray) {
        return;
      }

      const correctedFieldsList = this.correctedFields();

      detailsArray.controls.forEach((ctrl, index) => {
        if (!(ctrl instanceof FormGroup)) {
          return;
        }

        const serviceProvidedToControl = ctrl.get(EMaterialsFormControls.serviceProvidedTo);
        const companyNamesControl = ctrl.get(EMaterialsFormControls.serviceProvidedToCompanyNames);
        const rowId = ctrl.get('rowId')?.value || ctrl.get('id')?.value || ctrl.get(EMaterialsFormControls.serviceId)?.value;

        // Check if parent field (serviceProvidedTo) is in correctedFields
        const isParentCorrected = correctedFieldsList.some(field =>
          field.section === 'serviceDetails' &&
          field.inputKey === `serviceProvidedTo` &&
          (field.id === rowId || !field.id)
        );

        // Enable parent if it's corrected
        if (serviceProvidedToControl && isParentCorrected) {
          this.getValueControl(serviceProvidedToControl).enable({ emitEvent: false });
        }

        if (!companyNamesControl) {
          return;
        }

        // Check backend response value for serviceProvidedTo
        const serviceProvidedToValue = serviceProvidedToControl
          ? this.getValueControl(serviceProvidedToControl).value
          : null;
        const hasOthersSelected = this.hasServiceProvidedToOthers(serviceProvidedToValue);

        // Check if dependent field (serviceProvidedToCompanyNames) is in correctedFields
        const isCompanyNamesFieldCorrected = correctedFieldsList.some(field =>
          field.section === 'serviceDetails' &&
          field.inputKey === `serviceProvidedToCompanyNames` &&
          (field.id === rowId || !field.id)
        );

        // Logic for dependent field:
        // - If parent is "Others" AND field is corrected → enable
        // - If parent is NOT "Others" → enable (so it can be cleared/viewed)
        // - If parent is "Others" BUT field is NOT corrected → disable
        if (!hasOthersSelected || isCompanyNamesFieldCorrected) {
          this.getValueControl(companyNamesControl).enable({ emitEvent: false });
        } else {
          this.getValueControl(companyNamesControl).disable({ emitEvent: false });
        }
      });
    });

    // Initialize and sync local agent control value to signal if control exists
    // Defer until planFormService is available
    effect(() => {
      if (!this.planFormService) {
        return;
      }
      const localAgentControl = this.doYouCurrentlyHaveLocalAgentInKSAControl;
      if (localAgentControl && !this._localAgentInitialized) {
        const control = this.getFormControl(localAgentControl);
        // Ensure signal is initialized (getter handles this)
        const signalRef = this.doYouHaveLocalAgentInKSASignal;
        // Set initial value
        signalRef.set(control.value ?? false);

        // Subscribe to value changes with automatic cleanup
        control.valueChanges
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe(value => {
            this.doYouHaveLocalAgentInKSASignal.set(value ?? false);
          });
        this._localAgentInitialized = true;
      }
    });

    // Local agent validation effect
    effect(() => {
      const doYouHaveLocalAgentInKSA = this.doYouHaveLocalAgentInKSASignal();
      if (doYouHaveLocalAgentInKSA !== null && this.planFormService) {
        this.planFormService.toggleLocalAgentInformValidation(doYouHaveLocalAgentInKSA === true);
      }
    });

    // Initialize opportunity value based on appliedOpportunity
    effect(() => {
      if (!this.planFormService) {
        return;
      }
      const planStore = this.planStore;
      if (this.basicInformationFormGroupControls && planStore) {
        const opportunityFormControl = this.basicInformationFormGroupControls[EMaterialsFormControls.opportunity];
        if (opportunityFormControl) {
          const opportunityControl = this.getFormControl(opportunityFormControl);
          const appliedOpportunity = planStore.appliedOpportunity();
          const availableOpportunities = planStore.availableOpportunities();
          if (appliedOpportunity && availableOpportunities.length > 0) {
            opportunityControl.setValue(availableOpportunities[0]);
          }
        }
      }
    });
  }

  private _servicesSynced = false;
  private _localAgentInitialized = false;


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

  getOriginalFieldValueFromPlanResponse(field: IFieldInformation): any {
    return getFieldValueFromServicePlanResponse(field, this.originalPlanResponse());
  }

  // Implement abstract method from base class to get form control for a field
  override getControlForField(field: IFieldInformation): FormControl<any> | null {
    const { section, inputKey, id: rowId } = field;

    // Helper to safely get value control - handles both FormGroup and FormControl
    const getValueControlSafe = (control: AbstractControl | null | undefined): FormControl<any> | null => {
      if (!control) return null;
      if (control instanceof FormControl) {
        return control;
      }
      if (control instanceof FormGroup) {
        return this.getValueControl(control);
      }
      return null;
    };

    // Handle FormArray items (service details)
    if (section === 'serviceDetails' && rowId) {
      {

      }
      const formArray = this.getDetailsFormArray();
      const rowIndex = formArray.controls.findIndex(
        control => control.get('rowId')?.value === rowId
      );
      if (rowIndex !== -1) {
        const rowControl = formArray.at(rowIndex);
        const fieldControl = rowControl.get(inputKey);
        if (fieldControl) {
          return getValueControlSafe(fieldControl);
        }
      }
      return null;
    }

    // Map section + inputKey to form control
    if (section === 'overviewCompanyInformation') {
      const controls = this.companyInformationFormGroupControls;
      if (controls && controls[inputKey]) {
        return getValueControlSafe(controls[inputKey]);
      }
    } else if (section === 'locationInformation') {
      const controls = this.locationInformationFormGroupControls;
      if (controls && controls[inputKey]) {
        return getValueControlSafe(controls[inputKey]);
      }
    } else if (section === 'localAgentInformation') {
      const controls = this.localAgentInformationFormGroupControls;
      if (controls && controls[inputKey]) {
        return getValueControlSafe(controls[inputKey]);
      }
    } else if (section === 'basicInformation') {
      const controls = this.basicInformationFormGroupControls;
      if (controls && controls[inputKey]) {
        return getValueControlSafe(controls[inputKey]);
      }
    }

    return null;
  }
}
