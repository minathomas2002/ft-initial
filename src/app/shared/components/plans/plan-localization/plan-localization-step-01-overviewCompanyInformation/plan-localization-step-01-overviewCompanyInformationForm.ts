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
import { TrimOnBlurDirective, ConditionalColorClassDirective, HidePlaceholderWhenDisabledEmptyDirective } from 'src/app/shared/directives';
import { GroupInputWithCheckbox } from 'src/app/shared/components/form/group-input-with-checkbox/group-input-with-checkbox';
import { RadioButtonModule } from 'primeng/radiobutton';
import { toSignal } from '@angular/core/rxjs-interop';
import { EMaterialsFormControls, EPlanPageTitle, ERoles } from 'src/app/shared/enums';
import { TooltipModule } from 'primeng/tooltip';
import { TranslatePipe } from 'src/app/shared/pipes/translate.pipe';
import { BaseErrorMessages } from 'src/app/shared/components/base-components/base-error-messages/base-error-messages';
import { PhoneInputComponent } from 'src/app/shared/components/form/phone-input/phone-input.component';
import { CommentStateComponent } from '../../comment-state-component/comment-state-component';
import { IFieldInformation, IPageComment, IProductPlanResponse } from 'src/app/shared/interfaces/plans.interface';
import { getFieldValueFromProductPlanResponse } from 'src/app/shared/utils/plan-original-value-from-response';
import { TextareaModule } from 'primeng/textarea';
import { ISelectItem, TColors } from 'src/app/shared/interfaces';
import { GeneralConfirmationDialogComponent } from 'src/app/shared/components/utility-components/general-confirmation-dialog/general-confirmation-dialog.component';
import { PlanStepBaseClass } from '../plan-step-base-class';
import { TCommentPhase } from 'src/app/shared/types/plan-comments.types';
import { CommentInputComponent } from '../../comment-input/comment-input';
import { OpportunitiesStore } from 'src/app/shared/stores/opportunities/opportunities.store';
import { RoleService } from 'src/app/shared/services/role/role-service';

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
    HidePlaceholderWhenDisabledEmptyDirective,
    GroupInputWithCheckbox,
    RadioButtonModule,
    TooltipModule,
    TranslatePipe,
    BaseErrorMessages,
    PhoneInputComponent,
    CommentStateComponent,
    FormsModule,
    TextareaModule,
    GeneralConfirmationDialogComponent,
    CommentInputComponent,
  ],
  templateUrl: './plan-localization-step-01-overviewCompanyInformationForm.html',
  styleUrl: './plan-localization-step-01-overviewCompanyInformationForm.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlanLocalizationStep01OverviewCompanyInformationForm extends PlanStepBaseClass {
  readonly opportunitiesStore = inject(OpportunitiesStore);
  private readonly adminOpportunitiesStore = inject(AdminOpportunitiesStore);
  override readonly planStore = inject(PlanStore);
  override readonly destroyRef = inject(DestroyRef);

  readonly planFormService = inject(ProductPlanFormService);

  pageTitle = input.required<EPlanPageTitle>();
  selectedInputColor = input.required<TColors>();
  commentPhase = model<TCommentPhase>('none');
  selectedInputs = model<IFieldInformation[]>([]);
  pageComments = input<IPageComment[]>([]);
  commentTitle = input<string>('Comments');
  isViewMode = input<boolean>(false);
  correctedFieldIds = input<string[]>([]);
  correctedFields = input<IFieldInformation[]>([]);
  showCommentState = input<boolean>(false);
  originalPlanResponse = input<IProductPlanResponse | null>(null);

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

  submissionDateLabel = computed(() => this.i18nService.translate('plans.form.submissionDate'));
  companyNameLabel = computed(() => this.i18nService.translate('plans.newPlan.companyName'));
  ceoNameLabel = computed(() => this.i18nService.translate('plans.form.ceoName'));
  ceoEmailLabel = computed(() => this.i18nService.translate('plans.summary.ceoEmail'));
  globalHQLocationLabel = computed(() => this.i18nService.translate('plans.form.globalHQLocation'));
  registeredVendorIDwithSECLabel = computed(() => this.i18nService.translate('plans.form.registeredVendorIDwithSEC'));
  hasLocalAgentInKSALabel = computed(() => this.i18nService.translate('plans.form.hasLocalAgentInKSA'));
  localAgentNameLabel = computed(() => this.i18nService.translate('plans.form.localAgentName'));
  contactPersonNameLabel = computed(() => this.i18nService.translate('plans.form.contactPersonName'));
  emailIDLabel = computed(() => this.i18nService.translate('plans.form.emailID'));
  contactNumberLabel = computed(() => this.i18nService.translate('plans.form.contactNumber'));
  companyHQLocationLabel = computed(() => this.i18nService.translate('plans.form.companyHQLocation'));

  companyNameHasCommentControl = computed(() => {
    const controls = this.companyInformationFormGroupControls;
    return controls ? this.getHasCommentControl(controls['companyName']) : null;
  });
  contactNumberHasCommentControl = computed(() => {
    const controls = this.localAgentInformationFormGroupControls;
    return controls ? this.getHasCommentControl(controls['contactNumber']) : null;
  });

  private doYouCurrentlyHaveLocalAgentInKSAControl = this.getFormControl(
    this.locationInformationFormGroupControls?.[EMaterialsFormControls.doYouCurrentlyHaveLocalAgentInKSA]
  );
  private doYouHaveLocalAgentInKSASignal = toSignal(
    this.doYouCurrentlyHaveLocalAgentInKSAControl.valueChanges,
    {
      initialValue: this.doYouCurrentlyHaveLocalAgentInKSAControl.value ?? false
    }
  );

  showLocalAgentInformation = computed(() => {
    return this.doYouHaveLocalAgentInKSASignal() === true;
  });

  // Registered in field initializer (injection context) so effect() is valid; runs after construction when dependencies are set
  // private readonly _localAgentValidationEffect = effect(() => {
  //   const doYouHaveLocalAgentInKSA = this.doYouHaveLocalAgentInKSASignal();
  //   if (doYouHaveLocalAgentInKSA !== null && this.planFormService) {
  //     this.planFormService.toggleLocalAgentInformValidation(doYouHaveLocalAgentInKSA === true);
  //   }
  // });

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

  // override onSaveComment(): void {
  //   super.onSaveComment();
  // }

  override onSaveEditedComment(): void {
    super.onSaveEditedComment();
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

  opportunityControlSignal = toSignal<ISelectItem | null>(this.getFormControl(this.basicInformationFormGroupControls[EMaterialsFormControls.opportunity]).valueChanges, {
    initialValue: this.getFormControl(this.basicInformationFormGroupControls[EMaterialsFormControls.opportunity]).value ?? null
  });

  // Override hook method for step-specific initialization
  protected override initializeStepSpecificLogic(): void {
    // Local agent validation effect - reactive to signal changes
    effect(() => {
      const doYouHaveLocalAgentInKSA = this.doYouHaveLocalAgentInKSASignal();
      if (doYouHaveLocalAgentInKSA !== null && this.planFormService) {
        this.planFormService.toggleLocalAgentInformValidation(doYouHaveLocalAgentInKSA === true);
      }
    });

    effect(() => {
      const opportunityControlSignal = this.opportunityControlSignal();
      if (opportunityControlSignal === null) this.opportunitiesStore.resetOpportunityLocalizationTablesValidation();
      if (this.roleService.hasAnyRoleSignal([ERoles.INVESTOR])()) {
        this.opportunitiesStore.getOpportunityLocalizationTablesValidation(opportunityControlSignal!.id)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe((response) => {
            this.planFormService.updateValueChainValidation(response);
          });
      }
    });

    // Initialize opportunity value based on appliedOpportunity
    // Check if form controls and store are available (may not be initialized in review mode or during construction)
    // Note: planStore is injected, but property initializers run after base constructor, so we need to check
    const planStore = this.planStore;
    const basicInfoControls = this.basicInformationFormGroupControls;
    if (!basicInfoControls || !planStore) return;
    const opportunityFormControl = basicInfoControls[EMaterialsFormControls.opportunity];
    if (!opportunityFormControl) return;
    const opportunityControl = this.getFormControl(opportunityFormControl);
    const appliedOpportunity = planStore.appliedOpportunity();
    const availableOpportunities = planStore.availableOpportunities();
    if (appliedOpportunity && availableOpportunities.length > 0) {
      opportunityControl.setValue(availableOpportunities[0]);
    }
  }


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
    return getFieldValueFromProductPlanResponse(field, this.originalPlanResponse());
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

  // Implement abstract method from base class to get form control for a field
  getControlForField(field: IFieldInformation): FormControl<any> | null {
    const { section, inputKey } = field;

    // Map section + inputKey to form control
    if (section === 'companyInformation') {
      const controls = this.companyInformationFormGroupControls;
      if (controls && controls[inputKey]) {
        return this.getValueControl(controls[inputKey]);
      }
    } else if (section === 'locationInformation') {
      const controls = this.locationInformationFormGroupControls;
      if (controls && controls[inputKey]) {
        return this.getValueControl(controls[inputKey]);
      }
    } else if (section === 'localAgentInformation') {
      const controls = this.localAgentInformationFormGroupControls;
      if (controls && controls[inputKey]) {
        return this.getValueControl(controls[inputKey]);
      }
    } else if (section === 'basicInformation') {
      const controls = this.basicInformationFormGroupControls;
      if (controls && controls[inputKey]) {
        return this.getValueControl(controls[inputKey]);
      }
    }

    return null;
  }
}
