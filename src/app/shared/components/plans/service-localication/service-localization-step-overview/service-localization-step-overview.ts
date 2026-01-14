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
import { TrimOnBlurDirective, ConditionalColorClassDirective } from 'src/app/shared/directives';
import { AdminOpportunitiesStore } from 'src/app/shared/stores/admin-opportunities/admin-opportunities.store';
import { PlanStore } from 'src/app/shared/stores/plan/plan.store';
import { toSignal, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { EMaterialsFormControls } from 'src/app/shared/enums';
import { EServiceProvidedTo } from 'src/app/shared/enums';
import { PhoneInputComponent } from 'src/app/shared/components/form/phone-input/phone-input.component';
import { ServicePlanFormService } from 'src/app/shared/services/plan/service-plan-form-service/service-plan-form-service';
import { TextareaModule } from 'primeng/textarea';
import { CommentStateComponent } from '../../comment-state-component/comment-state-component';
import { GeneralConfirmationDialogComponent } from 'src/app/shared/components/utility-components/general-confirmation-dialog/general-confirmation-dialog.component';
import { PlanStepBaseClass } from '../../plan-localization/plan-step-base-class';
import { TCommentPhase } from '../../plan-localization/product-localization-plan-wizard/product-localization-plan-wizard';
import { IFieldInformation } from 'src/app/shared/interfaces/plans.interface';
import { TColors } from 'src/app/shared/interfaces';
import { FormsModule } from '@angular/forms';

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
    PhoneInputComponent,
    TextareaModule,
    CommentStateComponent,
    GeneralConfirmationDialogComponent,
    FormsModule
  ],
  templateUrl: './service-localization-step-overview.html',
  styleUrl: './service-localization-step-overview.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ServiceLocalizationStepOverview extends PlanStepBaseClass {
  isViewMode = input<boolean>(false);

  readonly planFormService = inject(ServicePlanFormService);
  private readonly planStore = inject(PlanStore);
  private readonly destroyRef = inject(DestroyRef);

  pageTitle = input.required<string>();
  selectedInputColor = input.required<TColors>();
  commentPhase = model<TCommentPhase>('none');
  selectedInputs = model<IFieldInformation[]>([]);

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

  // id for 'Others' in serviceProvidedTo options (string)
  serviceProvidedToOthersId = EServiceProvidedTo.Others.toString();

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

  // Expose base class methods as public for template access
  override upDateSelectedInputs(value: boolean, fieldInformation: IFieldInformation): void {
    super.upDateSelectedInputs(value, fieldInformation);
  }

  override highlightInput(inputKey: string): boolean {
    return super.highlightInput(inputKey);
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

  override onSaveComment(): void {
    super.onSaveComment();
  }

  override onSaveEditedComment(): void {
    super.onSaveEditedComment();
  }

  override resetAllHasCommentControls(): void {
    super.resetAllHasCommentControls();
  }

  onServiceProvidedToChange(value: string | null, index: number): void {
    this.planFormService.toggleServiceProvidedToCompanyNamesValidation(value, index);
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
        });
      }
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
}
