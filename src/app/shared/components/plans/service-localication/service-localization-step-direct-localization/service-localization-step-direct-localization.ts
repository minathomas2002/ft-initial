import { ChangeDetectionStrategy, Component, computed, inject, input, model, effect } from '@angular/core';
import { ServicePlanFormService } from 'src/app/shared/services/plan/service-plan-form-service/service-plan-form-service';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { FormArrayInput } from 'src/app/shared/components/utility-components/form-array-input/form-array-input';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { BaseErrorMessages } from 'src/app/shared/components/base-components/base-error-messages/base-error-messages';
import { GroupInputWithCheckbox } from 'src/app/shared/components/form/group-input-with-checkbox/group-input-with-checkbox';
import { EMaterialsFormControls } from 'src/app/shared/enums';
import { ELocalizationApproach, ELocation, EYesNo } from 'src/app/shared/enums/plan.enum';
import { PlanStore } from 'src/app/shared/stores/plan/plan.store';
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
import { CommentInputComponent } from '../../comment-input/comment-input';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

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
  override readonly planStore = inject(PlanStore);

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

  localizationStrategyHeaderTooltips = computed<Partial<Record<EMaterialsFormControls, string>>>(() => {
    return {
      [EMaterialsFormControls.willBeAnyProprietaryToolsSystems]: 'mention if any proprietary tools / platforms / systems etc. will be transferred locally as part of localizing the service? If yes, provide details',
      [EMaterialsFormControls.supervisionOversightByGovernmentEntity]: 'mention whether the localization of the service is being supervised / overseen by any government entity (e.g., MoEn, PIF etc.) ',
      [EMaterialsFormControls.capexRequired]: "Provide details of the CAPEX required (in SAR) to establish local operations. Avoid duplicating CAPEX entries across services; if the same CAPEX applies to multiple services, please indicate it by stating 'included above'"
    }
  });

  excludeKeysFromServiceLevelFormArray = computed<string[]>(() => {
    return [
      EMaterialsFormControls.serviceId,
      EMaterialsFormControls.serviceHeadcountRowId,
      EMaterialsFormControls.expectedLocalizationDate,
      EMaterialsFormControls.localizationApproach,
      EMaterialsFormControls.localizationApproachOtherDetails,
      EMaterialsFormControls.location,
      EMaterialsFormControls.locationOtherDetails,
      EMaterialsFormControls.capexRequired,
      EMaterialsFormControls.supervisionOversightByGovernmentEntity,
      EMaterialsFormControls.willBeAnyProprietaryToolsSystems,
      EMaterialsFormControls.proprietaryToolsSystemsDetails,
    ];
  });

  // Handle start editing for investor comment
  onStartEditing(): void {
    if (this.isResubmitMode()) {
      this.commentPhase.set('editing');
    }
  }

  get formGroup() {
    return this.planFormService?.step4_directLocalization ?? new FormGroup({});
  }
  EMaterialsFormControls = EMaterialsFormControls;
  yesNoOptions = this.planStore.yesNoOptions;
  localizationApproachOptions = this.planStore.localizationApproachOptions;
  locationOptions = this.planStore.locationOptions;

  yearColumns = computed(() => this.planFormService?.upcomingYears(6) ?? []);

  yearControlKeys = [
    EMaterialsFormControls.firstYear,
    EMaterialsFormControls.secondYear,
    EMaterialsFormControls.thirdYear,
    EMaterialsFormControls.fourthYear,
    EMaterialsFormControls.fifthYear,
    EMaterialsFormControls.sixthYear,
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
      { label: `Mention Y-o-Y expected Saudization % (upto ${this.yearColumns()[5]}) (To be filled for the KSA based facility only)`, colspan: yearCols, dataGroup: true },
      { label: 'Key Measures to Upskill Saudis', rowspan: 2, dataGroup: false },
      { label: 'Support Required from SEC (if any)', rowspan: 2, dataGroup: false },
    ];
  });

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

    // Watch for changes to willBeAnyProprietaryToolsSystems dropdown in localization strategy FormArray
    this.setupProprietaryToolsSystemsWatcher();

    // In resubmit mode, ensure dependent "Other" fields are enabled when relevant
    effect(() => {
      if (!this.isResubmitMode()) {
        return;
      }

      const formArray = this.getLocalizationStrategyFormArray();
      if (!formArray) {
        return;
      }

      const correctedFieldsList = this.correctedFields();

      formArray.controls.forEach((itemControl, index) => {
        if (!(itemControl instanceof FormGroup)) return;

        const rowId = itemControl.get('rowId')?.value || itemControl.get('id')?.value;

        // Handle localizationApproach and its dependent field
        const localizationApproachControl = itemControl.get(EMaterialsFormControls.localizationApproach);
        const isApproachCorrected = correctedFieldsList.some(field =>
          field.section === 'localizationStrategy' &&
          field.inputKey === `localizationApproach_${index}` &&
          (field.id === rowId || !field.id)
        );
        if (localizationApproachControl && isApproachCorrected) {
          this.getValueControl(localizationApproachControl).enable({ emitEvent: false });
        }

        const isApproachOther = this.isLocalizationApproachOther(itemControl);
        const isApproachOtherCorrected = correctedFieldsList.some(field =>
          field.section === 'localizationStrategy' &&
          field.inputKey === `localizationApproachOtherDetails_${index}` &&
          (field.id === rowId || !field.id)
        );
        const approachOtherControl = itemControl.get(EMaterialsFormControls.localizationApproachOtherDetails);
        if (approachOtherControl) {
          if (!isApproachOther || isApproachOtherCorrected) {
            this.getValueControl(approachOtherControl).enable({ emitEvent: false });
          } else {
            this.getValueControl(approachOtherControl).disable({ emitEvent: false });
          }
        }

        // Handle location and its dependent field
        const locationControl = itemControl.get(EMaterialsFormControls.location);
        const isLocationCorrected = correctedFieldsList.some(field =>
          field.section === 'localizationStrategy' &&
          field.inputKey === `location_${index}` &&
          (field.id === rowId || !field.id)
        );
        if (locationControl && isLocationCorrected) {
          this.getValueControl(locationControl).enable({ emitEvent: false });
        }

        const isLocationOther = this.isLocationOther(itemControl);
        const isLocationOtherCorrected = correctedFieldsList.some(field =>
          field.section === 'localizationStrategy' &&
          field.inputKey === `locationOtherDetails_${index}` &&
          (field.id === rowId || !field.id)
        );
        const locationOtherControl = itemControl.get(EMaterialsFormControls.locationOtherDetails);
        if (locationOtherControl) {
          if (!isLocationOther || isLocationOtherCorrected) {
            this.getValueControl(locationOtherControl).enable({ emitEvent: false });
          } else {
            this.getValueControl(locationOtherControl).disable({ emitEvent: false });
          }
        }

        // Handle willBeAnyProprietaryToolsSystems and its dependent field
        const willBeAnyControl = itemControl.get(EMaterialsFormControls.willBeAnyProprietaryToolsSystems);
        const isWillBeAnyCorrected = correctedFieldsList.some(field =>
          field.section === 'localizationStrategy' &&
          field.inputKey === `willBeAnyProprietaryToolsSystems_${index}` &&
          (field.id === rowId || !field.id)
        );
        if (willBeAnyControl && isWillBeAnyCorrected) {
          this.getValueControl(willBeAnyControl).enable({ emitEvent: false });
        }

        const isProprietaryToolsYes = this.isProprietaryToolsYes(itemControl);
        const isProprietaryToolsDetailsCorrected = correctedFieldsList.some(field =>
          field.section === 'localizationStrategy' &&
          field.inputKey === `proprietaryToolsSystemsDetails_${index}` &&
          (field.id === rowId || !field.id)
        );
        const proprietaryToolsDetailsControl = itemControl.get(EMaterialsFormControls.proprietaryToolsSystemsDetails);
        if (proprietaryToolsDetailsControl) {
          if (!isProprietaryToolsYes || isProprietaryToolsDetailsCorrected) {
            this.getValueControl(proprietaryToolsDetailsControl).enable({ emitEvent: false });
          } else {
            this.getValueControl(proprietaryToolsDetailsControl).disable({ emitEvent: false });
          }
        }
      });
    });
  }

  private _servicesSynced = false;

  /**
   * Sets up watchers for willBeAnyProprietaryToolsSystems dropdown changes
   * When value changes to "No", clears proprietaryToolsSystemsDetails field and removes it from selected inputs
   */
  private setupProprietaryToolsSystemsWatcher(): void {
    effect(() => {
      const formArray = this.getLocalizationStrategyFormArray();
      if (!formArray || formArray.length === 0) {
        return;
      }

      // Watch each item in the FormArray
      formArray.controls.forEach((itemControl, index) => {
        if (!(itemControl instanceof FormGroup)) return;

        const willBeAnyControl = itemControl.get(`${EMaterialsFormControls.willBeAnyProprietaryToolsSystems}.${EMaterialsFormControls.value}`);
        if (!willBeAnyControl) return;

        // Subscribe to value changes
        willBeAnyControl.valueChanges
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe((value) => {
            this.handleProprietaryToolsSystemsChange(itemControl, value, index);
          });
      });
    });
  }

  /**
   * Handles changes to willBeAnyProprietaryToolsSystems dropdown
   * @param itemControl The FormGroup item from the FormArray
   * @param value The new value of the dropdown
   * @param index The index of the item in the FormArray
   */
  private handleProprietaryToolsSystemsChange(itemControl: FormGroup, value: any, index: number): void {
    // Ensure the willBeAnyProprietaryToolsSystems control value is properly set
    const willBeAnyControl = itemControl.get(`${EMaterialsFormControls.willBeAnyProprietaryToolsSystems}.${EMaterialsFormControls.value}`);
    if (willBeAnyControl && willBeAnyControl.value !== value) {
      willBeAnyControl.setValue(value, { emitEvent: false });
    }

    // Check if value is "No"
    const isNo = value === EYesNo.No ||
      value === EYesNo.No.toString() ||
      value === 'No' ||
      value === 'no' ||
      value === false ||
      value === 'false' ||
      value === 2; // EYesNo.No = 2

    if (isNo) {
      // Get the proprietaryToolsSystemsDetails control
      const detailsControl = itemControl.get(`${EMaterialsFormControls.proprietaryToolsSystemsDetails}.${EMaterialsFormControls.value}`);
      if (detailsControl) {
        // Clear the value
        detailsControl.reset();
        // Clear validation errors
        detailsControl.clearValidators();
        detailsControl.updateValueAndValidity({ emitEvent: false });
      }

      // Remove proprietaryToolsSystemsDetails from selected inputs if it was selected
      const inputKey = `proprietaryToolsSystemsDetails_${index}`;
      const currentSelectedInputs = this.selectedInputs();
      const updatedSelectedInputs = currentSelectedInputs.filter(
        input => !(input.section === 'localizationStrategy' && input.inputKey === inputKey)
      );

      if (updatedSelectedInputs.length !== currentSelectedInputs.length) {
        this.selectedInputs.set(updatedSelectedInputs);
      }

      // Reset hasComment control for proprietaryToolsSystemsDetails
      const detailsHasCommentControl = itemControl.get(`${EMaterialsFormControls.proprietaryToolsSystemsDetails}.${EMaterialsFormControls.hasComment}`);
      if (detailsHasCommentControl instanceof FormControl) {
        detailsHasCommentControl.setValue(false, { emitEvent: false });
      }

      // Toggle validation using the form service
      this.planFormService.toggleProprietaryToolsSystemsDetailsValidation(value, index);
    } else {
      // If value is "Yes", ensure validation is set correctly
      this.planFormService.toggleProprietaryToolsSystemsDetailsValidation(value, index);
    }

    // Mark the form control as dirty to ensure change detection
    if (willBeAnyControl) {
      willBeAnyControl.markAsDirty();
    }
  }

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

  // Helper method to strip index suffix from inputKey (e.g., 'expectedLocalizationDate_0' -> 'expectedLocalizationDate')
  private stripIndexSuffix(inputKey: string): string {
    // Match pattern: _ followed by one or more digits at the end
    const match = inputKey.match(/^(.+)_(\d+)$/);
    return match ? match[1] : inputKey;
  }

  // Helper to map UI input keys to actual form control keys
  private mapInputKeyToControlKey(inputKey: string): string {
    let baseKey = this.stripIndexSuffix(inputKey);

    const keyMap: Record<string, string> = {
      location: EMaterialsFormControls.location,
      capexRequired: EMaterialsFormControls.capexRequired,
      supervisionOversightByGovernmentEntity: EMaterialsFormControls.supervisionOversightByGovernmentEntity,
    };

    // Handle legacy keys that may have index appended without underscore
    Object.keys(keyMap).forEach((key) => {
      if (baseKey.startsWith(key) && /\d+$/.test(baseKey.substring(key.length))) {
        baseKey = key;
      }
    });

    return keyMap[baseKey] ?? baseKey;
  }

  // Implement abstract method from base class to get form control for a field
  getControlForField(field: IFieldInformation): FormControl<any> | null {
    const { section, inputKey, id: rowId } = field;

    // Handle FormArray items (localization strategy rows)
    if (section === 'localizationStrategy' && rowId) {
      const formArray = this.getLocalizationStrategyFormArray();
      const rowIndex = formArray.controls.findIndex(
        control => control.get('id')?.value === rowId || control.get('rowId')?.value === rowId
      );
      if (rowIndex !== -1) {
        const rowControl = formArray.at(rowIndex);
        // Strip index suffix from inputKey (e.g., 'expectedLocalizationDate_0' -> 'expectedLocalizationDate')
        const actualInputKey = this.mapInputKeyToControlKey(inputKey);
        const fieldControl = rowControl.get(actualInputKey);
        return fieldControl ? this.getValueControl(fieldControl) : null;
      }
      return null;
    }

    // Entity level (single-item FormArray)
    if (section === 'entityLevel') {
      const entityLevelItem = this.getEntityLevelItem();
      // Strip 'entityLevel_' prefix from inputKey (e.g., 'entityLevel_firstYear_headcount' -> 'firstYear_headcount')
      const actualInputKey = inputKey.startsWith('entityLevel_') ? inputKey.substring('entityLevel_'.length) : inputKey;
      const fieldControl = entityLevelItem.get(actualInputKey);
      return fieldControl ? this.getValueControl(fieldControl) : null;
    }

    // Service level (FormArray)
    if (section === 'serviceLevel' && rowId) {
      const formArray = this.getServiceLevelFormArray();
      const rowIndex = formArray.controls.findIndex(
        control => control.get('id')?.value === rowId || control.get('rowId')?.value === rowId
      );
      if (rowIndex !== -1) {
        const rowControl = formArray.at(rowIndex);
        // Strip index suffix from inputKey (e.g., 'serviceLevelLocalizationDate_0' -> 'serviceLevelLocalizationDate')
        // Also handle year-based keys like 'firstYear_headcount_0' -> 'firstYear_headcount'
        const actualInputKey = this.mapInputKeyToControlKey(inputKey);
        const fieldControl = rowControl.get(actualInputKey);
        return fieldControl ? this.getValueControl(fieldControl) : null;
      }
      return null;
    }

    // Fallback: try to find in main form group
    const formGroup = this.getFormGroup();
    const fieldControl = formGroup.get(inputKey);
    return fieldControl ? this.getValueControl(fieldControl) : null;
  }
}
