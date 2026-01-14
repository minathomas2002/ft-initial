import { ChangeDetectionStrategy, Component, inject, input, model } from '@angular/core';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { BaseLabelComponent } from 'src/app/shared/components/base-components/base-label/base-label.component';
import { BaseErrorMessages } from 'src/app/shared/components/base-components/base-error-messages/base-error-messages';
import { FormArrayInput } from '../../../utility-components/form-array-input/form-array-input';
import { TrimOnBlurDirective, ConditionalColorClassDirective } from 'src/app/shared/directives';
import { GroupInputWithCheckbox } from '../../../form/group-input-with-checkbox/group-input-with-checkbox';
import { ServicePlanFormService } from 'src/app/shared/services/plan/service-plan-form-service/service-plan-form-service';
import { PlanStepBaseClass } from '../../plan-localization/plan-step-base-class';
import { TCommentPhase } from '../../plan-localization/product-localization-plan-wizard/product-localization-plan-wizard';
import { IFieldInformation } from 'src/app/shared/interfaces/plans.interface';
import { TColors } from 'src/app/shared/interfaces';
import { CommentStateComponent } from '../../comment-state-component/comment-state-component';
import { GeneralConfirmationDialogComponent } from 'src/app/shared/components/utility-components/general-confirmation-dialog/general-confirmation-dialog.component';
import { TextareaModule } from 'primeng/textarea';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-service-localization-step-cover-page',
  imports: [
    ReactiveFormsModule,
    InputTextModule,
    ButtonModule,
    BaseLabelComponent,
    BaseErrorMessages,
    FormArrayInput,
    TrimOnBlurDirective,
    GroupInputWithCheckbox,
    CommentStateComponent,
    GeneralConfirmationDialogComponent,
    TextareaModule,
    FormsModule,
    ConditionalColorClassDirective,
  ],
  templateUrl: './service-localization-step-cover-page.html',
  styleUrl: './service-localization-step-cover-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ServiceLocalizationStepCoverPage extends PlanStepBaseClass {
  isViewMode = input<boolean>(false);

  readonly planFormService = inject(ServicePlanFormService);

  pageTitle = input.required<string>();
  selectedInputColor = input.required<TColors>();
  commentPhase = model<TCommentPhase>('none');
  selectedInputs = model<IFieldInformation[]>([]);

  // Get form group for base class
  get formGroup() {
    return this.planFormService?.step1_coverPage ?? new FormGroup({});
  }

  // Implement abstract method from base class
  getFormGroup(): FormGroup {
    return this.formGroup;
  }

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

  override onSaveComment(): void {
    super.onSaveComment();
  }

  override onSaveEditedComment(): void {
    super.onSaveEditedComment();
  }

  override resetAllHasCommentControls(): void {
    super.resetAllHasCommentControls();
  }

  // Get services form array
  getServicesFormArray(): FormArray {
    return this.planFormService?.getServicesFormArray() ?? new FormArray<any>([]);
  }

  // Get cover page nested company information group
  get coverPageCompanyInformationFormGroup(): FormGroup {
    return this.planFormService?.coverPageCompanyInformationFormGroup ?? new FormGroup({});
  }

  // Create service item (for form-array-input component)
  createServiceItem = (): FormGroup => {
    if (!this.planFormService) {
      return new FormGroup({});
    }
    return this.planFormService.createServiceItem();
  };

  // Helper method to safely get value control from cover page company information form group
  getCoverPageValueControl(key: string): FormControl<any> {
    const control = this.coverPageCompanyInformationFormGroup.get(key);
    if (!control) {
      return new FormControl<any>('');
    }
    return this.getValueControl(control);
  }
}
