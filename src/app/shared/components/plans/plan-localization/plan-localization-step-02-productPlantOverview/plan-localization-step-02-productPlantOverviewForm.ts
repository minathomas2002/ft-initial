import { ChangeDetectionStrategy, Component, computed, effect, inject, input, model, signal } from '@angular/core';
import { ProductPlanFormService } from 'src/app/shared/services/plan/product-plan-form-service/product-plan-form-service';
import { AbstractControl, FormControl, ReactiveFormsModule } from '@angular/forms';
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
import { TCommentPhase } from '../product-localization-plan-wizard/product-localization-plan-wizard';
import { TColors } from 'src/app/shared/interfaces';
import { ToasterService } from 'src/app/shared/services/toaster/toaster.service';
import { FormUtilityService } from 'src/app/shared/services/form-utility/form-utility.service';
import { CommentStateComponent } from '../../comment-state-component/comment-state-component';
import { FormsModule } from '@angular/forms';
import { GeneralConfirmationDialogComponent } from 'src/app/shared/components/utility-components/general-confirmation-dialog/general-confirmation-dialog.component';

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
    GeneralConfirmationDialogComponent
  ],
  templateUrl: './plan-localization-step-02-productPlantOverviewForm.html',
  styleUrl: './plan-localization-step-02-productPlantOverviewForm.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlanLocalizationStep02ProductPlantOverviewForm {
  private readonly productPlanFormService = inject(ProductPlanFormService);
  private readonly planStore = inject(PlanStore);
  private readonly toasterService = inject(ToasterService);
  private readonly formUtilityService = inject(FormUtilityService);
  pageTitle = input<string>('Product & Plant Overview');

  // Expose enum to template
  readonly EMaterialsFormControls = EMaterialsFormControls;

  formGroup = this.productPlanFormService.step2_productPlantOverview;
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

  // Form group accessors
  get overviewFormGroupControls() {
    return this.productPlanFormService.overviewFormGroup.controls;
  }

  get expectedCAPEXInvestmentFormGroupControls() {
    return this.productPlanFormService.expectedCAPEXInvestmentFormGroup.controls;
  }

  get targetCustomersFormGroupControls() {
    return this.productPlanFormService.targetCustomersFormGroup.controls;
  }

  get productManufacturingExperienceFormGroupControls() {
    return this.productPlanFormService.productManufacturingExperienceFormGroup.controls;
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
    return this.provideToSECSignal() === true;
  });

  showLocalSuppliersFields = computed(() => {
    return this.provideToLocalSuppliersSignal() === true;
  });

  showTargetedSuppliersFields = computed(() => {
    const value = this.targetedCustomerSignal();
    return value?.includes(ETargetedCustomer.SEC_APPROVED_LOCAL_SUPPLIERS.toString()) || false;
  });

  showOthersDescription = computed(() => {
    const value = this.othersPercentageSignal();
    return value !== null && value > 0;
  });

  constructor() {
    // Effect to handle validation toggles
    effect(() => {
      const provideToSECValue = this.provideToSECSignal();
      this.productPlanFormService.toggleSECFieldsValidation(provideToSECValue === true);
    });

    effect(() => {
      const provideToLocalSuppliersValue = this.provideToLocalSuppliersSignal();
      this.productPlanFormService.toggleLocalSuppliersFieldsValidation(provideToLocalSuppliersValue === true);
    });

    effect(() => {
      const targetedCustomerValue = this.targetedCustomerSignal();
      this.productPlanFormService.toggleTargetedSuppliersFieldsValidation(targetedCustomerValue || []);
    });

    effect(() => {
      const othersPercentageValue = this.othersPercentageSignal();
      this.productPlanFormService.toggleOthersDescriptionValidation(othersPercentageValue);
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

  // Helper methods - delegate to service
  getHasCommentControl(formGroup: AbstractControl): FormControl<boolean> {
    return this.productPlanFormService.getHasCommentControl(formGroup);
  }

  getValueControl(formGroup: AbstractControl): FormControl<any> {
    return this.productPlanFormService.getValueControl(formGroup);
  }

  getFormControl(formControl: AbstractControl): FormControl<any> {
    return this.productPlanFormService.getFormControl(formControl);
  }

  // Dropdown options
  targetedCustomerOptions = this.planStore.targetedCustomerOptions;
  productManufacturingExperienceOptions = this.planStore.productManufacturingExperienceOptions;

  upDateSelectedInputs(value: boolean, fieldInformation: IFieldInformation): void {
    const currentInputs = this.selectedInputs();
    const existingIndex = currentInputs.findIndex(
      input => input.section === fieldInformation.section && input.inputKey === fieldInformation.inputKey
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

  highlightInput(inputKey: string): boolean {
    const isSelected = this.selectedInputs().some(input => input.inputKey === inputKey);
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

