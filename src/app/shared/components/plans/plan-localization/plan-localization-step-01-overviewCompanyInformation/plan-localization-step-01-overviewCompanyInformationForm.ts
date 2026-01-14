import { ChangeDetectionStrategy, Component, computed, DestroyRef, effect, inject, input, model, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ProductPlanFormService } from 'src/app/shared/services/plan/product-plan-form-service/product-plan-form-service';
import { BaseLabelComponent } from 'src/app/shared/components/base-components/base-label/base-label.component';
import { InputTextModule } from 'primeng/inputtext';
import { AdminOpportunitiesStore } from 'src/app/shared/stores/admin-opportunities/admin-opportunities.store';
import { DatePickerModule } from 'primeng/datepicker';
import { SelectModule } from 'primeng/select';
import { PlanStore } from 'src/app/shared/stores/plan/plan.store';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TrimOnBlurDirective, ConditionalColorClassDirective } from 'src/app/shared/directives';
import { GroupInputWithCheckbox } from 'src/app/shared/components/form/group-input-with-checkbox/group-input-with-checkbox';
import { RadioButtonModule } from 'primeng/radiobutton';
import { toSignal } from '@angular/core/rxjs-interop';
import { EMaterialsFormControls } from 'src/app/shared/enums';
import { TooltipModule } from 'primeng/tooltip';
import { TranslatePipe } from 'src/app/shared/pipes/translate.pipe';
import { BaseErrorMessages } from 'src/app/shared/components/base-components/base-error-messages/base-error-messages';
import { PhoneInputComponent } from 'src/app/shared/components/form/phone-input/phone-input.component';
import { CommentStateComponent } from '../../comment-state-component/comment-state-component';
import { IFieldInformation } from 'src/app/shared/interfaces/plans.interface';
import { TextareaModule } from 'primeng/textarea';
import { TColors } from 'src/app/shared/interfaces';
import { GeneralConfirmationDialogComponent } from 'src/app/shared/components/utility-components/general-confirmation-dialog/general-confirmation-dialog.component';
import { PlanStepBaseClass } from '../plan-step-base-class';
import { TCommentPhase } from '../product-localization-plan-wizard/product-localization-plan-wizard';

@Component({
  selector: 'app-plan-localization-step-01-overview-company-information-form',
  imports: [
    BaseLabelComponent,
    InputTextModule,
    DatePickerModule,
    SelectModule,
    ReactiveFormsModule,
    TrimOnBlurDirective,
    ConditionalColorClassDirective,
    GroupInputWithCheckbox,
    RadioButtonModule,
    TooltipModule,
    TranslatePipe,
    BaseErrorMessages,
    PhoneInputComponent,
    CommentStateComponent,
    FormsModule,
    TextareaModule,
    GeneralConfirmationDialogComponent
  ],
  templateUrl: './plan-localization-step-01-overviewCompanyInformationForm.html',
  styleUrl: './plan-localization-step-01-overviewCompanyInformationForm.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlanLocalizationStep01OverviewCompanyInformationForm extends PlanStepBaseClass {
  private readonly adminOpportunitiesStore = inject(AdminOpportunitiesStore);
  private readonly planStore = inject(PlanStore);
  private readonly destroyRef = inject(DestroyRef);

  readonly planFormService = inject(ProductPlanFormService);

  pageTitle = input.required<string>();
  selectedInputColor = input.required<TColors>();
  commentPhase = model<TCommentPhase>('none');
  selectedInputs = model<IFieldInformation[]>([]);

  formGroup = this.planFormService.overviewCompanyInformation;
  opportunityTypes = this.adminOpportunitiesStore.opportunityTypes();
  availableOpportunities = this.planStore.availableOpportunities;
  isLoadingAvailableOpportunities = this.planStore.isLoadingAvailableOpportunities;

  get basicInformationFormGroupControls() {
    return this.planFormService?.basicInformationFormGroup?.controls;
  }
  get companyInformationFormGroupControls() {
    return this.planFormService?.companyInformationFormGroup?.controls;
  }
  get locationInformationFormGroupControls() {
    return this.planFormService?.locationInformationFormGroup?.controls;
  }
  get localAgentInformationFormGroupControls() {
    return this.planFormService?.localAgentInformationFormGroup?.controls;
  }

  companyNameHasCommentControl = computed(() => {
    const controls = this.companyInformationFormGroupControls;
    return controls ? this.getHasCommentControl(controls['companyName']) : null;
  });
  contactNumberHasCommentControl = computed(() => {
    const controls = this.localAgentInformationFormGroupControls;
    return controls ? this.getHasCommentControl(controls['contactNumber']) : null;
  });

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

  // Computed signal for opportunity disabled state
  isOpportunityDisabled = computed(() => {
    return this.planStore?.appliedOpportunity() !== null;
  });

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

  // Override hook method for step-specific initialization
  protected override initializeStepSpecificLogic(): void {
    // Ensure form service is available before accessing form groups
    if (!this.planFormService) {
      return;
    }

    // Initialize and sync local agent control value to signal if control exists
    const localAgentControl = this.doYouCurrentlyHaveLocalAgentInKSAControl;
    if (localAgentControl) {
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
    }

    // Local agent validation effect
    effect(() => {
      const doYouHaveLocalAgentInKSA = this.doYouHaveLocalAgentInKSASignal();
      if (doYouHaveLocalAgentInKSA !== null && this.planFormService) {
        this.planFormService.toggleLocalAgentInformValidation(doYouHaveLocalAgentInKSA === true);
      }
    });

    // Initialize opportunity value based on appliedOpportunity
    // Check if form controls and store are available (may not be initialized in review mode or during construction)
    // Note: planStore is injected, but property initializers run after base constructor, so we need to check
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
  }
}
