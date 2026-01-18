import { ChangeDetectionStrategy, Component, computed, inject, input, model, DestroyRef, effect } from '@angular/core';
import { ServicePlanFormService } from 'src/app/shared/services/plan/service-plan-form-service/service-plan-form-service';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { FormArrayInput } from 'src/app/shared/components/utility-components/form-array-input/form-array-input';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { BaseErrorMessages } from 'src/app/shared/components/base-components/base-error-messages/base-error-messages';
import { GroupInputWithCheckbox } from 'src/app/shared/components/form/group-input-with-checkbox/group-input-with-checkbox';
import { EMaterialsFormControls } from 'src/app/shared/enums';
import { PlanStore } from 'src/app/shared/stores/plan/plan.store';
import { ELocalizationApproach, ELocation, EYesNo } from 'src/app/shared/enums/plan.enum';
import { TextareaModule } from 'primeng/textarea';
import { InputNumberModule } from 'primeng/inputnumber';
import { TableModule } from 'primeng/table';
import { PlanStepBaseClass } from '../../plan-localization/plan-step-base-class';
import { TCommentPhase } from '../../plan-localization/product-localization-plan-wizard/product-localization-plan-wizard';
import { IFieldInformation, IPageComment } from 'src/app/shared/interfaces/plans.interface';
import { TColors } from 'src/app/shared/interfaces';
import { FormsModule } from '@angular/forms';
import { CommentStateComponent } from '../../comment-state-component/comment-state-component';
import { GeneralConfirmationDialogComponent } from 'src/app/shared/components/utility-components/general-confirmation-dialog/general-confirmation-dialog.component';
import { ConditionalColorClassDirective } from 'src/app/shared/directives';
import { PageCommentBox } from '../../page-comment-box/page-comment-box';
import { CommentInputComponent } from '../../comment-input/comment-input';

@Component({
  selector: 'app-service-localization-step-direct-localization',
  imports: [
    ReactiveFormsModule,
    FormArrayInput,
    InputTextModule,
    SelectModule,
    BaseErrorMessages,
    GroupInputWithCheckbox,
    TextareaModule,
    InputNumberModule,
    TableModule,
    CommentStateComponent,
    GeneralConfirmationDialogComponent,
    FormsModule,
    ConditionalColorClassDirective,
    PageCommentBox,
    CommentInputComponent
  ],
  templateUrl: './service-localization-step-direct-localization.html',
  styleUrl: './service-localization-step-direct-localization.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ServiceLocalizationStepDirectLocalization extends PlanStepBaseClass {
  isViewMode = input<boolean>(false);
  isReviewMode = input<boolean>(false);

  readonly planFormService = inject(ServicePlanFormService);
  planStore = inject(PlanStore);
  private readonly destroyRef = inject(DestroyRef);

  pageTitle = input.required<string>();
  selectedInputColor = input.required<TColors>();
  commentPhase = model<TCommentPhase>('none');
  selectedInputs = model<IFieldInformation[]>([]);
  pageComments = input<IPageComment[]>([]);
  commentTitle = input<string>('Comments');
  correctedFieldIds = input<string[]>([]);

  get formGroup() {
    return this.planFormService?.step4_directLocalization ?? new FormGroup({});
  }
  EMaterialsFormControls = EMaterialsFormControls;
  yesNoOptions = this.planStore.yesNoOptions;
  localizationApproachOptions = this.planStore.localizationApproachOptions;
  locationOptions = this.planStore.locationOptions;

  yearColumns = computed(() => this.planFormService?.upcomingYears(5) ?? []);

  yearControlKeys = [
    EMaterialsFormControls.firstYear,
    EMaterialsFormControls.secondYear,
    EMaterialsFormControls.thirdYear,
    EMaterialsFormControls.fourthYear,
    EMaterialsFormControls.fifthYear,
  ];

  entityLevelTableRows = computed(() => {
    const years = this.yearColumns();
    return [
      {
        label: 'Expected Annual Headcount',
        controlKey: 'headcount',
        placeholder: 'Enter headcount',
        mode: undefined,
        minFractionDigits: 0,
        maxFractionDigits: 0,
      },
      {
        label: 'Expected Saudization (%)',
        controlKey: 'saudization',
        placeholder: 'Enter %',
        mode: 'decimal' as const,
        minFractionDigits: 0,
        maxFractionDigits: 2,
      },
    ];
  });

  // Generate header labels for service level year columns (show as numbers)
  customHeadersLabels = computed(() => {
    const labels: Record<string, string> = {};
    const years = this.yearColumns();
    this.yearControlKeys.forEach((key, idx) => {
      if (years[idx]) {
        labels[`${key}_headcount`] = String(years[idx]);
        labels[`${key}_saudization`] = String(years[idx]);
      }
    });
    return labels;
  });

  // Grouped header cell for Service Level years
  serviceLevelGroupHeader = computed(() => {
    const yearCols = this.yearControlKeys.length;
    return [
      { label: 'Service Name', rowspan: 2, dataGroup: false },
      { label: 'Expected Localization Date', rowspan: 2, dataGroup: false },
      { label: 'Expected Annual Headcount (To be filled for the KSA based facility only)', colspan: yearCols, dataGroup: true },
      { label: 'Mention Y-o-Y expected Saudization % (upto 2030) (To be filled for the KSA based facility only)', colspan: yearCols, dataGroup: true },
      { label: 'Key Measures to Upskill Saudis', rowspan: 2, dataGroup: false },
      { label: 'Support Required from SEC (if any)', rowspan: 2, dataGroup: false },
    ];
  });

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

  // Override hook method for step-specific initialization
  protected override initializeStepSpecificLogic(): void {
    // Defer service-dependent initialization until after component is fully constructed
    // This ensures planFormService is available (inject() runs during property initialization)
    effect(() => {
      const service = this.planFormService;
      if (!service) {
        return;
      }

      // Sync services from cover page to service level on component initialization
      // Use a flag to ensure this only runs once
      if (!this._servicesSynced) {
        service.syncServicesFromCoverPageToDirectLocalization();
        this._servicesSynced = true;
      }
    });
  }

  private _servicesSynced = false;

  getLocalizationStrategyFormArray(): FormArray {
    return this.planFormService?.directLocalizationServiceLevelFormGroup ?? new FormArray<any>([]);
  }

  createLocalizationStrategyItem = (): FormGroup => {
    if (!this.planFormService) {
      return new FormGroup({});
    }
    return this.planFormService.createDirectLocalizationServiceLevelItem();
  };

  isLocalizationApproachOther(itemControl: AbstractControl): boolean {
    const control = itemControl.get(EMaterialsFormControls.localizationApproach);
    if (!control) return false;
    const value = this.getValueControl(control)?.value;
    return value === ELocalizationApproach.Other.toString();
  }

  isLocationOther(itemControl: AbstractControl): boolean {
    const control = itemControl.get(EMaterialsFormControls.location);
    if (!control) return false;
    const value = this.getValueControl(control)?.value;
    return value === ELocation.Other.toString();
  }

  isProprietaryToolsYes(itemControl: AbstractControl): boolean {
    const control = itemControl.get(EMaterialsFormControls.willBeAnyProprietaryToolsSystems);
    if (!control) return false;
    const value = this.getValueControl(control)?.value;
    return value === EYesNo.Yes.toString();
  }

  getEntityLevelFormArray(): FormArray {
    return this.planFormService?.directLocalizationEntityLevelFormGroup ?? new FormArray<any>([]);
  }

  getEntityLevelItem(): FormGroup {
    const formArray = this.getEntityLevelFormArray();
    if (formArray.length === 0) {
      return new FormGroup({});
    }
    return formArray.at(0) as FormGroup;
  }

  // Helper method to safely get value control from entity level item
  getEntityLevelValueControl(key: string): FormControl<any> {
    const control = this.getEntityLevelItem().get(key);
    if (!control) {
      // Return a dummy control if not found (shouldn't happen in normal usage)
      return new FormControl<any>('');
    }
    return this.getValueControl(control);
  }

  getServiceLevelFormArray(): FormArray {
    return this.planFormService?.directLocalizationServiceLevelFormGroup ?? new FormArray<any>([]);
  }

  createServiceLevelItem = (): FormGroup => {
    if (!this.planFormService) {
      return new FormGroup({});
    }
    return this.planFormService.createDirectLocalizationServiceLevelItem();
  };

  // Helper method to check if a field should be highlighted in view mode
  isFieldCorrected(inputKey: string, section?: string): boolean {
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
}
