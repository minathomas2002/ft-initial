import { ChangeDetectionStrategy, Component, inject, input, model } from '@angular/core';
import { AbstractControl, FormArray, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { EMaterialsFormControls } from 'src/app/shared/enums';
import { BaseErrorMessages } from 'src/app/shared/components/base-components/base-error-messages/base-error-messages';
import { FormArrayInput } from '../../../utility-components/form-array-input/form-array-input';
import { GroupInputWithCheckbox } from '../../../form/group-input-with-checkbox/group-input-with-checkbox';
import { SelectModule } from 'primeng/select';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { TooltipModule } from 'primeng/tooltip';
import { ButtonModule } from 'primeng/button';
import { ValueChainSummaryComponent } from './value-chain-summary/value-chain-summary.component';
import { PlanStore } from 'src/app/shared/stores/plan/plan.store';
import { TrimOnBlurDirective, ConditionalColorClassDirective } from 'src/app/shared/directives';
import { IFieldInformation, IPageComment } from 'src/app/shared/interfaces/plans.interface';
import { TColors } from 'src/app/shared/interfaces';
import { TextareaModule } from 'primeng/textarea';
import { FormsModule } from '@angular/forms';
import { GeneralConfirmationDialogComponent } from 'src/app/shared/components/utility-components/general-confirmation-dialog/general-confirmation-dialog.component';
import { PlanStepBaseClass } from '../plan-step-base-class';
import { TCommentPhase } from '../product-localization-plan-wizard/product-localization-plan-wizard';
import { ProductPlanFormService } from 'src/app/shared/services/plan/product-plan-form-service/product-plan-form-service';
import { CommentStateComponent } from '../../comment-state-component/comment-state-component';
import { CommentInputComponent } from '../../comment-input/comment-input';

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
    TextareaModule,
    FormsModule,
    GeneralConfirmationDialogComponent,
    CommentStateComponent,
    CommentInputComponent
  ],
  templateUrl: './plan-localization-step-03-valueChainForm.html',
  styleUrl: './plan-localization-step-03-valueChainForm.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlanLocalizationStep03ValueChainForm extends PlanStepBaseClass {
  isViewMode = input<boolean>(false);
  private readonly planStore = inject(PlanStore);
  readonly planFormService = inject(ProductPlanFormService);

  pageTitle = input<string>('Value Chain');

  formGroup = this.planFormService.step3_valueChain;
  readonly EMaterialsFormControls = EMaterialsFormControls;

  // Dropdown options
  inHouseOrProcuredOptions = this.planStore.inHouseProcuredOptions;
  localizationStatusOptions = this.planStore.localizationStatusOptions;

  selectedInputColor = input<TColors>('orange');
  commentPhase = model<TCommentPhase>('none');
  selectedInputs = model<IFieldInformation[]>([]);
  pageComments = input<IPageComment[]>([]);
  commentTitle = input<string>('Comments');
  correctedFieldIds = input<string[]>([]);

  // Implement abstract method from base class
  getFormGroup(): FormGroup {
    return this.formGroup;
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

  override onSaveComment(): void {
    super.onSaveComment();
  }

  override onSaveEditedComment(): void {
    super.onSaveEditedComment();
  }

  override resetAllHasCommentControls(): void {
    super.resetAllHasCommentControls();
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

  // Helper method to check if a field should be highlighted in view mode
  isFieldCorrected(inputKey: string, section?: string, rowId?: string): boolean {
    if (!this.isViewMode()) return false;
    // Check if any comment field matches this inputKey (and section if provided)
    const matchingFields = this.pageComments()
      .flatMap(c => c.fields)
      .filter(f => {
        const keyMatch = f.inputKey === inputKey || f.inputKey === `${section}.${inputKey}`;
        const sectionMatch = !section || f.section === section;
        const rowMatch = !rowId || f.id === rowId;
        return keyMatch && sectionMatch && rowMatch;
      });
    // If any matching field has an ID in correctedFieldIds, highlight it
    return matchingFields.some(f => f.id && this.correctedFieldIds().includes(f.id));
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
}

