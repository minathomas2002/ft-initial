import { ChangeDetectionStrategy, Component, computed, effect, inject, input, model, signal } from '@angular/core';
import { AbstractControl, FormArray, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ProductPlanFormService } from 'src/app/shared/services/plan/product-plan-form-service/product-plan-form-service';
import { EMaterialsFormControls } from 'src/app/shared/enums';
import { BaseErrorMessages } from 'src/app/shared/components/base-components/base-error-messages/base-error-messages';
import { BaseLabelComponent } from 'src/app/shared/components/base-components/base-label/base-label.component';
import { FormArrayInput } from '../../../utility-components/form-array-input/form-array-input';
import { GroupInputWithCheckbox } from '../../../form/group-input-with-checkbox/group-input-with-checkbox';
import { SelectModule } from 'primeng/select';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { TooltipModule } from 'primeng/tooltip';
import { ButtonModule } from 'primeng/button';
import { ValueChainSummaryComponent } from './value-chain-summary/value-chain-summary.component';
import { PlanStore } from 'src/app/shared/stores/plan/plan.store';
import { JsonPipe } from '@angular/common';
import { TrimOnBlurDirective, ConditionalColorClassDirective } from 'src/app/shared/directives';
import { IFieldInformation, IPageComment } from 'src/app/shared/interfaces/plans.interface';
import { TCommentPhase } from '../product-localization-plan-wizard/product-localization-plan-wizard';
import { TColors } from 'src/app/shared/interfaces';
import { ToasterService } from 'src/app/shared/services/toaster/toaster.service';
import { FormUtilityService } from 'src/app/shared/services/form-utility/form-utility.service';
import { CommentStateComponent } from '../../comment-state-component/comment-state-component';
import { TextareaModule } from 'primeng/textarea';
import { FormsModule } from '@angular/forms';
import { GeneralConfirmationDialogComponent } from 'src/app/shared/components/utility-components/general-confirmation-dialog/general-confirmation-dialog.component';

@Component({
  selector: 'app-plan-localization-step-03-valueChain-form',
  imports: [
    ReactiveFormsModule,
    BaseErrorMessages,
    FormArrayInput,
    GroupInputWithCheckbox,
    SelectModule,
    InputNumberModule,
    InputTextModule,
    TooltipModule,
    ButtonModule,
    ValueChainSummaryComponent,
    BaseErrorMessages,
    TrimOnBlurDirective,
    ConditionalColorClassDirective,
    CommentStateComponent,
    TextareaModule,
    FormsModule,
    GeneralConfirmationDialogComponent,
    BaseLabelComponent
  ],
  templateUrl: './plan-localization-step-03-valueChainForm.html',
  styleUrl: './plan-localization-step-03-valueChainForm.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlanLocalizationStep03ValueChainForm {

  isViewMode = input<boolean>(false);
  private readonly productPlanFormService = inject(ProductPlanFormService);
  private readonly planStore = inject(PlanStore);
  private readonly toasterService = inject(ToasterService);
  private readonly formUtilityService = inject(FormUtilityService);
  pageTitle = input<string>('Value Chain');

  formGroup = this.productPlanFormService.step3_valueChain;
  readonly EMaterialsFormControls = EMaterialsFormControls;

  // Dropdown options
  inHouseOrProcuredOptions = this.planStore.inHouseProcuredOptions;
  localizationStatusOptions = this.planStore.localizationStatusOptions;

  // Show checkbox signal (controls visibility of comment checkboxes)
  showCheckbox = computed(() => this.commentPhase() !== 'none');
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

  // Helper methods - delegate to ProductPlanFormService
  getValueControl(formGroup: AbstractControl): FormControl<any> {
    return this.productPlanFormService.getValueControl(formGroup);
  }

  getHasCommentControl(formGroup: AbstractControl): FormControl<boolean> {
    return this.productPlanFormService.getHasCommentControl(formGroup);
  }

  // Get section FormArrays
  getDesignEngineeringFormArray(): FormArray | null {
    return this.productPlanFormService.getValueChainSectionFormArray(EMaterialsFormControls.designEngineeringFormGroup);
  }

  getSourcingFormArray(): FormArray | null {
    return this.productPlanFormService.getValueChainSectionFormArray(EMaterialsFormControls.sourcingFormGroup);
  }

  getManufacturingFormArray(): FormArray | null {
    return this.productPlanFormService.getValueChainSectionFormArray(EMaterialsFormControls.manufacturingFormGroup);
  }

  getAssemblyTestingFormArray(): FormArray | null {
    return this.productPlanFormService.getValueChainSectionFormArray(EMaterialsFormControls.assemblyTestingFormGroup);
  }

  getAfterSalesFormArray(): FormArray | null {
    return this.productPlanFormService.getValueChainSectionFormArray(EMaterialsFormControls.afterSalesFormGroup);
  }

  // Factory functions for creating new items (used by form-array-input component)
  createDesignEngineeringItem = (): FormGroup => {
    return this.productPlanFormService.createValueChainItem();
  };

  createSourcingItem = (): FormGroup => {
    return this.productPlanFormService.createValueChainItem();
  };

  createManufacturingItem = (): FormGroup => {
    return this.productPlanFormService.createValueChainItem();
  };

  createAssemblyTestingItem = (): FormGroup => {
    return this.productPlanFormService.createValueChainItem();
  };

  createAfterSalesItem = (): FormGroup => {
    return this.productPlanFormService.createValueChainItem();
  };

  constructor() {
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

  upDateSelectedInputs(value: boolean, fieldInformation: IFieldInformation, itemControl?: AbstractControl): void {
    const currentInputs = this.selectedInputs();

    // Extract row ID if itemControl is provided (for both selecting and unselecting)
    if (itemControl) {
      const rowId = itemControl.get('rowId')?.value;
      if (rowId) {
        fieldInformation.id = rowId;
      }
    }

    const existingIndex = currentInputs.findIndex(
      input => input.section === fieldInformation.section &&
        input.inputKey === fieldInformation.inputKey &&
        input.id === fieldInformation.id
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

  highlightInput(inputKey: string, rowId?: string): boolean {
    const isSelected = this.selectedInputs().some(input =>
      input.inputKey === inputKey &&
      (rowId === undefined || input.id === rowId)
    );
    const phase = this.commentPhase();
    return isSelected && (phase === 'adding' || phase === 'editing');
  }

  onDeleteComments(): void {
    this.showDeleteConfirmationDialog.set(true);
  }

  onConfirmDeleteComment(): void {
    this.formUtilityService.resetHasCommentControls(this.formGroup);
    this.selectedInputs.set([]);
    this.comment.set('');
    this.commentFormControl.reset();
    this.commentPhase.set('none');
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

    // Save comment to form control and signal
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

    // Update comment in form control and signal
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

