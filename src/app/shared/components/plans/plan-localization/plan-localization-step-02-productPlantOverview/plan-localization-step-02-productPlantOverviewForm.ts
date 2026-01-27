import { ChangeDetectionStrategy, Component, computed, effect, inject, input, model } from '@angular/core';
import { ProductPlanFormService } from 'src/app/shared/services/plan/product-plan-form-service/product-plan-form-service';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { RadioButtonModule } from 'primeng/radiobutton';
import { GroupInputWithCheckbox } from 'src/app/shared/components/form/group-input-with-checkbox/group-input-with-checkbox';
import { EMaterialsFormControls, ETargetedCustomer } from 'src/app/shared/enums';
import { toSignal } from '@angular/core/rxjs-interop';
import { MultiSelectModule } from 'primeng/multiselect';
import { TextareaModule } from 'primeng/textarea';
import { TooltipModule } from 'primeng/tooltip';
import { PlanStore } from 'src/app/shared/stores/plan/plan.store';
import { InputNumberModule } from 'primeng/inputnumber';
import { BaseErrorMessages } from 'src/app/shared/components/base-components/base-error-messages/base-error-messages';
import { BaseLabelComponent } from 'src/app/shared/components/base-components/base-label/base-label.component';
import { TrimOnBlurDirective, ConditionalColorClassDirective } from 'src/app/shared/directives';
import { IFieldInformation, IPageComment } from 'src/app/shared/interfaces/plans.interface';
import { TColors } from 'src/app/shared/interfaces';
import { CommentStateComponent } from '../../comment-state-component/comment-state-component';
import { FormsModule } from '@angular/forms';
import { GeneralConfirmationDialogComponent } from 'src/app/shared/components/utility-components/general-confirmation-dialog/general-confirmation-dialog.component';
import { PlanStepBaseClass } from '../plan-step-base-class';
import { TCommentPhase } from '../product-localization-plan-wizard/product-localization-plan-wizard';
import { CommentInputComponent } from '../../comment-input/comment-input';

@Component({
  selector: 'app-plan-localization-step-02-product-plant-overview-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    InputTextModule,
    SelectModule,
    MultiSelectModule,
    RadioButtonModule,
    GroupInputWithCheckbox,
    BaseErrorMessages,
    TextareaModule,
    TooltipModule,
    InputNumberModule,
    BaseErrorMessages,
    BaseLabelComponent,
    TrimOnBlurDirective,
    ConditionalColorClassDirective,
    CommentStateComponent,
    FormsModule,
    GeneralConfirmationDialogComponent,
    CommentInputComponent
  ],
  templateUrl: './plan-localization-step-02-productPlantOverviewForm.html',
  styleUrl: './plan-localization-step-02-productPlantOverviewForm.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlanLocalizationStep02ProductPlantOverviewForm extends PlanStepBaseClass {
  override readonly planStore = inject(PlanStore);
  readonly planFormService = inject(ProductPlanFormService);

  pageTitle = input<string>('Product & Plant Overview');

  // Track user interactions with dropdowns for resubmit mode
  private _userChangedDropdowns = new Set<string>();

  // Expose enum to template
  readonly EMaterialsFormControls = EMaterialsFormControls;

  formGroup = this.planFormService.step2_productPlantOverview;
  selectedInputColor = input<TColors>('orange');
  commentPhase = model<TCommentPhase>('none');
  selectedInputs = model<IFieldInformation[]>([]);
  pageComments = input<IPageComment[]>([]);
  commentTitle = input<string>('Comments');
  correctedFieldIds = input<string[]>([]);
  correctedFields = input<IFieldInformation[]>([]);
  isViewMode = input<boolean>(false);
  showCommentState = input<boolean>(false);

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

  // Form group accessors
  get overviewFormGroupControls() {
    return this.planFormService.overviewFormGroup.controls;
  }

  get expectedCAPEXInvestmentFormGroupControls() {
    return this.planFormService.expectedCAPEXInvestmentFormGroup.controls;
  }

  get targetCustomersFormGroupControls() {
    return this.planFormService.targetCustomersFormGroup.controls;
  }

  get productManufacturingExperienceFormGroupControls() {
    return this.planFormService.productManufacturingExperienceFormGroup.controls;
  }

  // Form control signals
  private provideToSECControl = this.getFormControl(
    this.productManufacturingExperienceFormGroupControls[EMaterialsFormControls.provideToSEC]
  );
  private provideToSECSignal = toSignal(
    this.provideToSECControl.valueChanges,
    {
      initialValue: this.provideToSECControl.value
    }
  );

  private provideToLocalSuppliersControl = this.getFormControl(
    this.productManufacturingExperienceFormGroupControls[EMaterialsFormControls.provideToLocalSuppliers]
  );
  private provideToLocalSuppliersSignal = toSignal(
    this.provideToLocalSuppliersControl.valueChanges,
    {
      initialValue: this.provideToLocalSuppliersControl.value
    }
  );

  private targetedCustomerControl = this.getValueControl(
    this.targetCustomersFormGroupControls[EMaterialsFormControls.targetedCustomer]
  );
  private targetedCustomerSignal = toSignal(
    this.targetedCustomerControl.valueChanges,
    {
      initialValue: this.targetedCustomerControl.value
    }
  );

  private othersPercentageControl = this.getValueControl(
    this.expectedCAPEXInvestmentFormGroupControls[EMaterialsFormControls.othersPercentage]
  );
  private othersPercentageSignal = toSignal(
    this.othersPercentageControl.valueChanges,
    {
      initialValue: this.othersPercentageControl.value
    }
  );

  // Conditional visibility computed signals
  showSECFields = computed(() => {
    // Show SEC fields if radio button is Yes OR if any SEC field is selected for comment
    const radioValue = this.provideToSECSignal() === true;
    if (radioValue) return true;

    // Check if any SEC field is in correctedFields (selected by employee)
    if (this.isResubmitMode()) {
      const correctedFields = this.correctedFields();
      const secFieldKeys = [
        'qualifiedPlantLocationSEC',
        'approvedVendorIDSEC',
        'yearsOfExperienceSEC',
        'totalQuantitiesSEC'
      ];
      return correctedFields.some(field =>
        field.section === 'productManufacturingExperience' &&
        secFieldKeys.includes(field.inputKey)
      );
    }

    return false;
  });

  showLocalSuppliersFields = computed(() => {
    // Show Local Suppliers fields if radio button is Yes OR if any Local Suppliers field is selected for comment
    const radioValue = this.provideToLocalSuppliersSignal() === true;
    if (radioValue) return true;

    // Check if any Local Suppliers field is in correctedFields (selected by employee)
    if (this.isResubmitMode()) {
      const correctedFields = this.correctedFields();
      const localSuppliersFieldKeys = [
        'namesOfSECApprovedSuppliers',
        'qualifiedPlantLocation',
        'yearsOfExperience',
        'totalQuantities'
      ];
      return correctedFields.some(field =>
        field.section === 'productManufacturingExperience' &&
        localSuppliersFieldKeys.includes(field.inputKey)
      );
    }

    return false;
  });

  showTargetedSuppliersFields = computed(() => {
    const value = this.targetedCustomerSignal();
    return value?.includes(ETargetedCustomer.SEC_APPROVED_LOCAL_SUPPLIERS.toString()) || false;
  });

  showOthersDescription = computed(() => {
    const value = this.othersPercentageSignal();
    return value !== null && value > 0;
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
    // Setup resubmit mode watchers for conditional fields
    this.setupResubmitModeWatchers();

    // Effect to handle validation toggles
    effect(() => {
      // Check if SEC fields should be shown (radio Yes OR fields selected for comment)
      const shouldShowSECFields = this.showSECFields();
      // Toggle validation to enable/disable fields based on visibility
      this.planFormService.toggleSECFieldsValidation(shouldShowSECFields);
    });

    effect(() => {
      // Check if Local Suppliers fields should be shown (radio Yes OR fields selected for comment)
      const shouldShowLocalSuppliersFields = this.showLocalSuppliersFields();
      // Toggle validation to enable/disable fields based on visibility
      this.planFormService.toggleLocalSuppliersFieldsValidation(shouldShowLocalSuppliersFields);
    });

    effect(() => {
      const targetedCustomerValue = this.targetedCustomerSignal();
      this.planFormService.toggleTargetedSuppliersFieldsValidation(targetedCustomerValue || []);
    });

    effect(() => {
      const othersPercentageValue = this.othersPercentageSignal();
      this.planFormService.toggleOthersDescriptionValidation(othersPercentageValue);
    });
  }

  /**
   * Setup watchers to track dropdown changes for resubmit mode
   * Also handles enable/disable logic for conditional fields
   */
  private setupResubmitModeWatchers(): void {
    // Watch othersPercentage changes for othersDescription
    effect(() => {
      const value = this.othersPercentageSignal();
      // Mark dropdown as changed if user interacts with it
      if (value !== null) {
        this._userChangedDropdowns.add('othersPercentage');
      }

      // Handle resubmit mode enable/disable
      if (this.isResubmitMode() && this.showOthersDescription()) {
        const othersDescriptionControl = this.getValueControl(
          this.expectedCAPEXInvestmentFormGroupControls[EMaterialsFormControls.othersDescription]
        );
        this.updateConditionalField(
          othersDescriptionControl,
          true,
          this.isFieldCorrected('othersDescription') || this._userChangedDropdowns.has('othersPercentage')
        );
      }
    });

    // Watch targetedCustomer changes for namesOfTargetedSuppliers and productsUtilizeTargetedProduct
    effect(() => {
      const value = this.targetedCustomerSignal();
      // Mark dropdown as changed if user interacts with it
      if (value !== null && value.length > 0) {
        this._userChangedDropdowns.add('targetedCustomer');
      }

      // Handle resubmit mode enable/disable
      if (this.isResubmitMode() && this.showTargetedSuppliersFields()) {
        const namesOfTargetedSuppliersControl = this.getValueControl(
          this.targetCustomersFormGroupControls[EMaterialsFormControls.namesOfTargetedSuppliers]
        );
        const productsUtilizeTargetedProductControl = this.getValueControl(
          this.targetCustomersFormGroupControls[EMaterialsFormControls.productsUtilizeTargetedProduct]
        );
        const canEdit = this._userChangedDropdowns.has('targetedCustomer');

        this.updateConditionalField(
          namesOfTargetedSuppliersControl,
          true,
          this.isFieldCorrected('namesOfTargetedSuppliers') || canEdit
        );
        this.updateConditionalField(
          productsUtilizeTargetedProductControl,
          true,
          this.isFieldCorrected('productsUtilizeTargetedProduct') || canEdit
        );
      }
    });
  }

  /**
   * Helper method to update conditional field state
   * @param control - The form control to update
   * @param shouldShow - Whether the field should be visible
   * @param canEdit - Whether the field should be editable (for resubmit mode)
   */
  private updateConditionalField(control: FormControl | null, shouldShow: boolean, canEdit: boolean): void {
    if (!control) return;

    if (!shouldShow) {
      control.disable();
    } else if (canEdit) {
      control.enable();
    } else {
      control.disable();
    }
  }

  /**
   * Check if a specific field is in the correctedFields list
   */
  private isFieldCorrected(inputKey: string): boolean {
    return this.correctedFields().some(field => field.inputKey === inputKey);
  }

  // Dropdown options
  targetedCustomerOptions = this.planStore.targetedCustomerOptions;
  productManufacturingExperienceOptions = this.planStore.productManufacturingExperienceOptions;

  // Implement abstract method from base class to get form control for a field
  getControlForField(field: IFieldInformation): FormControl<any> | null {
    const { section, inputKey } = field;

    // Map section + inputKey to form control
    if (section === 'overview') {
      const controls = this.overviewFormGroupControls;
      if (controls && controls[inputKey]) {
        return this.getValueControl(controls[inputKey]);
      }
    } else if (section === 'expectedCAPEXInvestment') {
      const controls = this.expectedCAPEXInvestmentFormGroupControls;
      if (controls && controls[inputKey]) {
        return this.getValueControl(controls[inputKey]);
      }
    } else if (section === 'targetCustomers') {
      const controls = this.targetCustomersFormGroupControls;
      if (controls && controls[inputKey]) {
        return this.getValueControl(controls[inputKey]);
      }
    } else if (section === 'productManufacturingExperience') {
      const controls = this.productManufacturingExperienceFormGroupControls;
      if (controls && controls[inputKey]) {
        return this.getValueControl(controls[inputKey]);
      }
    }

    return null;
  }
}

