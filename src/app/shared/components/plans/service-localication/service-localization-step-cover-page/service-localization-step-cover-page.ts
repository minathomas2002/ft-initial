import { ChangeDetectionStrategy, Component, computed, inject, input, model } from '@angular/core';
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
import { IFieldInformation, IPageComment } from 'src/app/shared/interfaces/plans.interface';
import { TColors } from 'src/app/shared/interfaces';
import { CommentStateComponent } from '../../comment-state-component/comment-state-component';
import { GeneralConfirmationDialogComponent } from 'src/app/shared/components/utility-components/general-confirmation-dialog/general-confirmation-dialog.component';
import { TextareaModule } from 'primeng/textarea';
import { FormsModule } from '@angular/forms';
import { PageCommentBox } from '../../page-comment-box/page-comment-box';
import { CommentInputComponent } from '../../comment-input/comment-input';

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
    CommentInputComponent,
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
  pageComments = input<IPageComment[]>([]);
  commentTitle = input<string>('Comments');
  correctedFieldIds = input<string[]>([]);
  correctedFields = input<IFieldInformation[]>([]);
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
      const formGroup = this.getFormGroup();
      const investorCommentControl = formGroup.get('investorComment') as FormControl<string> | null;
      if (investorCommentControl) {
        investorCommentControl.enable();
      }
    }
  }

  // Get form group for base class
  get formGroup() {
    return this.planFormService?.step1_coverPage ?? new FormGroup({});
  }

  // Implement abstract method from base class
  override getFormGroup(): FormGroup {
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

  // Helper method to check if a field should be highlighted in view mode
  override isFieldCorrected(inputKey: string, section?: string): boolean {
    if (!this.isViewMode()) return false;
    // Check if any comment field matches this inputKey (and section if provided)
    const matchingFields = this.pageComments()
      .flatMap(c => c.fields)
      .filter(f => {
        const keyMatch = f.inputKey === inputKey || f.inputKey === `${section}.${inputKey}`;
        const sectionMatch = !section || f.section === section;
        return keyMatch && sectionMatch;
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

  // Helper method to strip index suffix from inputKey (e.g., 'serviceName_0' -> 'serviceName')
  private stripIndexSuffix(inputKey: string): string {
    // Match pattern: _ followed by one or more digits at the end
    const match = inputKey.match(/^(.+)_(\d+)$/);
    return match ? match[1] : inputKey;
  }

  // Implement abstract method from base class to get form control for a field
  getControlForField(field: IFieldInformation): FormControl<any> | null {
    const { section, inputKey, id: rowId } = field;

    // Handle FormArray items (services)
    if (section === 'services' && rowId) {
      const formArray = this.getServicesFormArray();
      const rowIndex = formArray.controls.findIndex(
        control => control.get('id')?.value === rowId || control.get('rowId')?.value === rowId
      );
      if (rowIndex !== -1) {
        const rowControl = formArray.at(rowIndex);
        // Strip index suffix from inputKey (e.g., 'serviceName_0' -> 'serviceName')
        const actualInputKey = this.stripIndexSuffix(inputKey);
        const fieldControl = rowControl.get(actualInputKey);
        if (fieldControl) {
          return this.getValueControl(fieldControl);
        }
      }
      return null;
    }


    // Handle companyInformation section
    if (section === 'companyInformation' || section === 'coverPageCompanyInformation') {
      const companyInfoFormGroup = this.coverPageCompanyInformationFormGroup;
      const fieldControl = companyInfoFormGroup.get(inputKey);
      if (fieldControl) {
        return this.getValueControl(fieldControl);
      }
      return null;
    }

    // Try to find in main form group
    const formGroup = this.getFormGroup();
    const fieldControl = formGroup.get(inputKey);
    if (fieldControl) {
      return this.getValueControl(fieldControl);
    }

    return null;
  }
}
