import { ChangeDetectionStrategy, Component, computed, effect, inject, input, model } from '@angular/core';
import { AbstractControl, FormArray, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { EInHouseProcuredType, ELocalizationStatusType, EMaterialsFormControls, EOpportunityLocalizationTablesValidation, EPlanPageTitle } from 'src/app/shared/enums';
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
import { TrimOnBlurDirective, ConditionalColorClassDirective, HidePlaceholderWhenDisabledEmptyDirective } from 'src/app/shared/directives';
import { IFieldInformation, IPageComment, IProductPlanResponse } from 'src/app/shared/interfaces/plans.interface';
import { getFieldValueFromProductPlanResponse } from 'src/app/shared/utils/plan-original-value-from-response';
import { TColors } from 'src/app/shared/interfaces';
import { TextareaModule } from 'primeng/textarea';
import { FormsModule } from '@angular/forms';
import { GeneralConfirmationDialogComponent } from 'src/app/shared/components/utility-components/general-confirmation-dialog/general-confirmation-dialog.component';
import { PlanStepBaseClass } from '../plan-step-base-class';
import { TCommentPhase } from 'src/app/shared/types/plan-comments.types';
import { ProductPlanFormService } from 'src/app/shared/services/plan/product-plan-form-service/product-plan-form-service';
import { CommentStateComponent } from '../../comment-state-component/comment-state-component';
import { CommentInputComponent } from '../../comment-input/comment-input';
import { OpportunitiesStore } from 'src/app/shared/stores/opportunities/opportunities.store';

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
    HidePlaceholderWhenDisabledEmptyDirective,
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
  readonly opportunitiesStore = inject(OpportunitiesStore);
  isViewMode = input<boolean>(false);
  override readonly planStore = inject(PlanStore);
  readonly planFormService = inject(ProductPlanFormService);

  pageTitle = input<EPlanPageTitle>(EPlanPageTitle.ValueChain);

  formGroup = this.planFormService.step3_valueChain;

  // Dropdown options
  inHouseOrProcuredOptions = this.planStore.inHouseProcuredOptions;
  localizationStatusOptions = this.planStore.localizationStatusOptions;

  selectedInputColor = input<TColors>('orange');
  commentPhase = model<TCommentPhase>('none');
  selectedInputs = model<IFieldInformation[]>([]);
  pageComments = input<IPageComment[]>([]);
  commentTitle = input<string>('Comments');
  correctedFieldIds = input<string[]>([]);
  correctedFields = input<IFieldInformation[]>([]);
  showCommentState = input<boolean>(false);
  originalPlanResponse = input<IProductPlanResponse | null>(null);

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

  /** Returns true when in-house/procured selection is In-house */
  isInHouse(itemControl: AbstractControl): boolean {
    const val = itemControl.get(EMaterialsFormControls.inHouseOrProcured)?.get(EMaterialsFormControls.value)?.value;
    return val === '1' || val === EInHouseProcuredType.InHouse;
  }

  /** When in-house/procured changes: set years to No if in-house, null if procured */
  onInHouseOrProcuredChange(itemControl: AbstractControl): void {
    const val = itemControl.get(EMaterialsFormControls.inHouseOrProcured)?.get(EMaterialsFormControls.value)?.value;
    const yearKeys = [
      EMaterialsFormControls.year1,
      EMaterialsFormControls.year2,
      EMaterialsFormControls.year3,
      EMaterialsFormControls.year4,
      EMaterialsFormControls.year5,
      EMaterialsFormControls.year6,
      EMaterialsFormControls.year7,
    ];
    const targetValue = val === '1' || val === EInHouseProcuredType.InHouse
      ? ELocalizationStatusType.No.toString()
      : null;
    for (const yearKey of yearKeys) {
      const yearGroup = itemControl.get(yearKey);
      const valueCtrl = yearGroup instanceof FormGroup ? yearGroup.get(EMaterialsFormControls.value) : null;
      if (valueCtrl) {
        valueCtrl.setValue(targetValue);
        if (targetValue === null) {
          valueCtrl.markAsPristine();
        }
      }
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

  // Override hook method for step-specific initialization
  protected override initializeStepSpecificLogic(): void {
    // effect(() => {
    //   const validation = this.opportunitiesStore.opportunityLocalizationTablesValidation();
    //   if (validation) {
    //     this.planFormService.updateValueChainValidation(validation);
    //   }
    // })
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

    if (!formArray || !rowId) return null;

    // Find the row with matching rowId
    const rowIndex = formArray.controls.findIndex(
      control => control.get('rowId')?.value === rowId
    );

    if (rowIndex === -1) return null;

    const rowControl = formArray.at(rowIndex);
    const fieldControl = rowControl.get(inputKey);
    if (fieldControl) {
      return this.getValueControl(fieldControl);
    }

    return null;
  }

}

