import { ChangeDetectionStrategy, Component, computed, inject, signal, effect, input, model, DestroyRef, OnInit } from '@angular/core';
import { ServicePlanFormService } from 'src/app/shared/services/plan/service-plan-form-service/service-plan-form-service';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, AbstractControl, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormArrayInput } from 'src/app/shared/components/utility-components/form-array-input/form-array-input';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { MultiSelectModule } from 'primeng/multiselect';
import { BaseErrorMessages } from 'src/app/shared/components/base-components/base-error-messages/base-error-messages';
import { GroupInputWithCheckbox } from 'src/app/shared/components/form/group-input-with-checkbox/group-input-with-checkbox';
import { EMaterialsFormControls } from 'src/app/shared/enums';
import { PlanStore } from 'src/app/shared/stores/plan/plan.store';
import { AgreementType, EPlanPageTitle, EServiceCompanyType, EServiceProvidedTo, EServiceQualificationStatus, EYesNo } from 'src/app/shared/enums/plan.enum';
import { TextareaModule } from 'primeng/textarea';
import { InputNumberModule } from 'primeng/inputnumber';
import { TableModule } from 'primeng/table';
import { FileuploadComponent } from 'src/app/shared/components/utility-components/fileupload/fileupload.component';
import { CommentStateComponent } from '../../comment-state-component/comment-state-component';
import { GeneralConfirmationDialogComponent } from 'src/app/shared/components/utility-components/general-confirmation-dialog/general-confirmation-dialog.component';
import { PlanStepBaseClass } from '../../plan-localization/plan-step-base-class';
import { TCommentPhase } from 'src/app/shared/types/plan-comments.types';
import { IFieldInformation, IPageComment, IServiceLocalizationPlanResponse } from 'src/app/shared/interfaces/plans.interface';
import { TColors } from 'src/app/shared/interfaces';
import { getFieldValueFromServicePlanResponse } from 'src/app/shared/utils/plan-original-value-from-response';
import { FormsModule } from '@angular/forms';
import { ConditionalColorClassDirective, HidePlaceholderWhenDisabledEmptyDirective } from 'src/app/shared/directives';
import { CommentInputComponent } from '../../comment-input/comment-input';
import { TranslatePipe } from 'src/app/shared/pipes/translate.pipe';
import { I18nService } from 'src/app/shared/services/i18n';

@Component({
  selector: 'app-service-localization-step-existing-saudi',
  imports: [
    TranslatePipe,
    ReactiveFormsModule,
    FormArrayInput,
    InputTextModule,
    SelectModule,
    MultiSelectModule,
    BaseErrorMessages,
    GroupInputWithCheckbox,
    TextareaModule,
    InputNumberModule,
    TableModule,
    FileuploadComponent,
    CommentStateComponent,
    GeneralConfirmationDialogComponent,
    FormsModule,
    ConditionalColorClassDirective,
    HidePlaceholderWhenDisabledEmptyDirective,
    CommentInputComponent,
  ],
  templateUrl: './service-localization-step-existing-saudi.html',
  styleUrl: './service-localization-step-existing-saudi.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ServiceLocalizationStepExistingSaudi extends PlanStepBaseClass implements OnInit {
  isViewMode = input<boolean>(false);
  isReviewMode = input<boolean>(false);

  readonly planFormService = inject(ServicePlanFormService);
  override readonly planStore = inject(PlanStore);
  private readonly i18n = inject(I18nService);

  getTranslatedLabel(key: string, year: string | number): string {
    return this.i18n.translate(key, { year: String(year) });
  }

  pageTitle = input.required<EPlanPageTitle>();
  selectedInputColor = input.required<TColors>();
  commentPhase = model<TCommentPhase>('none');
  selectedInputs = model<IFieldInformation[]>([]);
  pageComments = input<IPageComment[]>([]);
  commentTitle = input<string>('Comments');
  correctedFieldIds = input<string[]>([]);
  correctedFields = input<IFieldInformation[]>([]);
  showCommentState = input<boolean>(false);
  originalPlanResponse = input<IServiceLocalizationPlanResponse | null>(null);
  files = signal<File[]>([]);
  private _servicesSynced = false;
  private _conditionalFieldsSetup = false;
  private _benaVendorIdLockSetup = false;
  private _attachmentsRequirementSetup = false;
  private _attachmentsUnlockedByProvideAgreementChange = signal(false);
  private _userChangedDropdowns = new Set<string>();

  // Check if investor comment exists for this step
  hasInvestorComment = computed((): boolean => {
    if (!this.isResubmitMode()) return false;
    const formGroup = this.getFormGroup();
    const investorCommentControl = formGroup.get('investorComment') as FormControl<string> | null;
    return !!(investorCommentControl?.value && investorCommentControl.value.trim().length > 0);
  });

  // Computed property to determine if file upload should be disabled
  // In resubmit mode, allow editing only if the attachments field is highlighted (selected for correction)
  isFileUploadDisabled = computed(() => {
    if (this.isReviewMode()) return true;
    if (this.isViewMode() && !this.isResubmitMode()) return true;
    if (this.isResubmitMode()) {
      // In resubmit mode, disable unless the attachments field is part of the corrected fields.
      // (Do not depend on orange highlight, which should disappear after the user updates the value.)
      const canEditAttachments = this.correctedFields().some(
        f => f.section === 'attachments' && f.inputKey === 'attachments'
      );
      const unlockedByProvideAgreementChange = this._attachmentsUnlockedByProvideAgreementChange();
      return !(canEditAttachments || unlockedByProvideAgreementChange);
    }
    return false;
  });

  collaborationPartnershipHeaderLabels = computed<Record<string, string>>(() => ({
    supervisionOversightEntity: this.i18n.translate('plans.form.supervisionOversightByGovernmentEntity'),
  }));

  saudiCompanyDetailsHeaderTooltips = computed<Partial<Record<EMaterialsFormControls, string>>>(() => {
    return {
      [EMaterialsFormControls.products]: 'If the Company Type is “Manufacturer” and Qualification Status is “Qualified / Under-Prequalification” Specify the products(s)',
      [EMaterialsFormControls.companyOverview]: 'If the Company Type is “Manufacturer” and Qualification Status is “Not Qualified” provide Company Overview',
      [EMaterialsFormControls.keyProjectsExecutedByContractorForSEC]: this.i18n.translate('plans.form.tooltipKeyProjectsContractor'),
      [EMaterialsFormControls.companyOverviewKeyProjectDetails]: this.i18n.translate('plans.form.tooltipCompanyOverviewKeyProject'),
      [EMaterialsFormControls.companyOverviewOther]: this.i18n.translate('plans.form.tooltipCompanyOverviewOther'),
      [EMaterialsFormControls.qualificationStatus]: 'If the Company Type is “Manufacturer” select “Qualification Status”',
      [EMaterialsFormControls.supervisionOversightEntity]: this.i18n.translate('plans.form.tooltipSupervisionOversight'),
    };
  });

  // Handle start editing for investor comment
  onStartEditing(): void {
    if (this.isResubmitMode()) {
      this.commentPhase.set('editing');
    }
  }
  EServiceProvidedTo = EServiceProvidedTo;
  EServiceQualificationStatus = EServiceQualificationStatus;
  EYesNo = EYesNo;

  companyTypeOptions = this.planStore.companyTypeOptionsTranslated;
  qualificationStatusOptions = this.planStore.qualificationStatusOptionsTranslated;
  yesNoOptions = this.planStore.yesNoOptionsTranslated;
  agreementTypeOptions = this.planStore.agreementTypeOptionsTranslated;

  isSaudiCompanyDetailsFieldSelectable(
    itemControl: AbstractControl,
    field: EMaterialsFormControls
  ): boolean {
    const target = itemControl.get(field);
    if (!target) return false;

    const targetValueControl = this.getValueControl(target);

    // In non-review modes, we can trust actual control enabled/disabled state.
    // In review mode, the wizard disables the whole form, so rely on the builder's
    // conditional logic (based on dropdown selections) to decide selectability.
    if (!this.isReviewMode() && !this.isViewMode()) {
      return !targetValueControl.disabled;
    }

    const companyTypeGroup = itemControl.get(EMaterialsFormControls.companyType);
    const qualificationStatusGroup = itemControl.get(EMaterialsFormControls.qualificationStatus);

    const companyTypes: string[] = companyTypeGroup
      ? (this.getValueControl(companyTypeGroup).value || [])
      : [];

    const qualificationStatus: string | null = qualificationStatusGroup
      ? (this.getValueControl(qualificationStatusGroup).value ?? null)
      : null;

    const isManufacturer = companyTypes.includes(EServiceCompanyType.Manufacturers.toString());
    const isContractor = companyTypes.includes(EServiceCompanyType.Contractors.toString());
    const isOther = companyTypes.includes(EServiceCompanyType.Others.toString());

    switch (field) {
      case EMaterialsFormControls.products:
        return isManufacturer && (
          qualificationStatus === EServiceQualificationStatus.Qualified.toString() ||
          qualificationStatus === EServiceQualificationStatus.UnderPreQualification.toString()
        );
      case EMaterialsFormControls.companyOverview:
        return isManufacturer && qualificationStatus === EServiceQualificationStatus.NotQualified.toString();
      case EMaterialsFormControls.keyProjectsExecutedByContractorForSEC:
        return isContractor;
      case EMaterialsFormControls.companyOverviewKeyProjectDetails:
        return isContractor;
      case EMaterialsFormControls.companyOverviewOther:
        return isOther;
      default:
        return !targetValueControl.disabled;
    }
  }

  get formGroup() {
    return this.planFormService?.step3_existingSaudi ?? new FormGroup({});
  }

  startYear = computed(() => (new Date(this.planStore.servicePlanData()?.createdDate ?? new Date())).getFullYear());
  startMonth = computed(() => (new Date(this.planStore.servicePlanData()?.createdDate ?? new Date())).getMonth());
  availableQuartersWithPast = computed(() => this.planFormService?.getAvailableQuartersWithPast(5, 5) ?? []);

  availableQuarters = computed(() => this.planFormService?.getAvailableQuarters(5) ?? []);

  yearColumns = computed(() => this.planFormService?.upcomingYears(6));

  // Custom header labels for Saudi Company Details table to ensure correct order
  saudiCompanyDetailsHeaderLabels = computed<Record<string, string>>(() => {
    this.i18n.currentLanguage();
    return {
      [EMaterialsFormControls.saudiCompanyName]: this.i18n.translate('plans.form.saudiCompanyName'),
      [EMaterialsFormControls.registeredVendorIDwithSEC]: this.i18n.translate('plans.form.vendorIdWithSEC'),
      [EMaterialsFormControls.benaRegisteredVendorID]: this.i18n.translate('plans.form.benaVendorId'),
      [EMaterialsFormControls.companyType]: this.i18n.translate('plans.form.companyType'),
      [EMaterialsFormControls.qualificationStatus]: this.i18n.translate('plans.form.qualificationStatusWithSEC'),
      [EMaterialsFormControls.products]: this.i18n.translate('plans.form.products'),
      [EMaterialsFormControls.companyOverview]: this.i18n.translate('plans.form.companyOverview'),
      [EMaterialsFormControls.keyProjectsExecutedByContractorForSEC]: this.i18n.translate('plans.form.keyProjectsExecutedByContractorForSEC'),
      [EMaterialsFormControls.companyOverviewKeyProjectDetails]: this.i18n.translate('plans.form.companyOverviewKeyProjectDetails'),
      [EMaterialsFormControls.companyOverviewOther]: this.i18n.translate('plans.form.companyOverviewOther'),
    };
  });

  yearControlKeys = [
    EMaterialsFormControls.firstYear,
    EMaterialsFormControls.secondYear,
    EMaterialsFormControls.thirdYear,
    EMaterialsFormControls.fourthYear,
    EMaterialsFormControls.fifthYear,
    EMaterialsFormControls.sixthYear,
  ];

  // Table rows data for PrimeNG table
  entityLevelTableRows = computed(() => {
    const years = this.yearColumns();
    return [
      {
        label: this.i18n.translate('plans.form.expectedAnnualHeadcount'),
        labelKey: 'plans.form.expectedAnnualHeadcount',
        controlKey: 'headcount',
        placeholder: this.i18n.translate('plans.form.enterHeadcount'),
        mode: undefined,
        minFractionDigits: 0,
        maxFractionDigits: 0,
      },
      {
        label: this.i18n.translate('plans.form.expectedSaudizationPercent'),
        labelKey: 'plans.form.expectedSaudizationPercent',
        controlKey: 'saudization',
        placeholder: this.i18n.translate('plans.form.enterPercent'),
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
      { label: this.i18n.translate('plans.form.serviceName'), rowspan: 2, dataGroup: false },
      { label: this.i18n.translate('plans.form.expectedLocalizationDate'), rowspan: 2, dataGroup: false },
      { label: this.i18n.translate('plans.form.expectedAnnualHeadcountKSA'), colspan: yearCols, dataGroup: true },
      { label: this.i18n.translate('plans.form.mentionYoySaudizationKSAUptoYear', { year: this.yearColumns()[5] }), colspan: yearCols, dataGroup: true },
      { label: this.i18n.translate('plans.form.keyMeasuresToUpskillSaudis'), rowspan: 2, dataGroup: false },
      { label: this.i18n.translate('plans.form.supportRequiredFromSEC') + ' (if any)', rowspan: 2, dataGroup: false },
    ];
  });

  protected override readonly destroyRef = inject(DestroyRef);

  override ngOnInit(): void {
    super.ngOnInit();
    // Setup dynamic attachments validation based on "Provide Agreement Copy".
    // Runs every time the step is shown (component is recreated on tab navigation),
    // ensuring the required attachment indicator persists after navigating between tabs.
    if (!this._attachmentsRequirementSetup) {
      this.setupAttachmentsRequiredByAgreementCopy();
      this._attachmentsRequirementSetup = true;
    }
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

  override onSaveEditedComment(): void {
    super.onSaveEditedComment();
  }

  constructor() {
    super();
    // Initialize files from form control value
    const attachmentsControl = this.getAttachmentsFormGroup()?.get(EMaterialsFormControls.attachments);
    if (attachmentsControl) {
      const control = this.getValueControl(attachmentsControl);
      const formValue = control.value;
      if (Array.isArray(formValue)) {
        this.files.set(formValue);
      }
    }

    // Sync files signal changes to form control
    effect(() => {
      const filesValue = this.files();
      const attachmentsControl = this.getAttachmentsFormGroup()?.get(EMaterialsFormControls.attachments);
      if (attachmentsControl) {
        const control = this.getValueControl(attachmentsControl);
        // Compare arrays by length and content to avoid infinite loops
        const currentValue = control.value;
        const currentEmpty = currentValue == null || (Array.isArray(currentValue) && currentValue.length === 0);
        const filesEmpty = filesValue == null || (Array.isArray(filesValue) && filesValue.length === 0);
        const isDifferent = (currentEmpty && filesEmpty)
          ? false
          : !Array.isArray(currentValue) ||
          currentValue.length !== filesValue.length ||
          currentValue.some((file: File, index: number) => file !== filesValue[index]);

        if (isDifferent) {
          control.setValue(filesValue);
          // Mark as dirty and trigger validation to show errors
          control.markAsDirty();
          control.updateValueAndValidity();
        }
      }
    });
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
        service.syncServicesFromCoverPageToExistingSaudi();
        this._servicesSynced = true;

        // Re-sync when services on cover page change
        const servicesArray = service.getServicesFormArray();
        servicesArray?.valueChanges?.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
          service.syncServicesFromCoverPageToExistingSaudi();
        });
      }

      // Setup conditional field enabling/disabling (only once)
      if (!this._conditionalFieldsSetup) {
        this.setupConditionalFields();
        this._conditionalFieldsSetup = true;
      }

      // Always keep BENA Registered Vendor ID disabled (all rows).
      if (!this._benaVendorIdLockSetup) {
        this.lockBenaRegisteredVendorIds();

        const saudiCompanyDetailsArray = service.saudiCompanyDetailsFormGroup;
        saudiCompanyDetailsArray?.valueChanges
          ?.pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe(() => this.lockBenaRegisteredVendorIds());

        this._benaVendorIdLockSetup = true;
      }
    });

    // Initialize files from form control value
    effect(() => {
      if (!this.planFormService) {
        return;
      }
      const attachmentsFormGroup = this.planFormService.attachmentsFormGroup;
      if (attachmentsFormGroup) {
        const attachmentsControl = attachmentsFormGroup.get(EMaterialsFormControls.attachments);
        if (attachmentsControl) {
          const control = this.getValueControl(attachmentsControl);
          const formValue = control.value;
          if (Array.isArray(formValue)) {
            this.files.set(formValue);
          }
        }
      }
    });

    // Sync files signal changes to form control
    effect(() => {
      const filesValue = this.files();
      if (!this.planFormService) {
        return;
      }
      const attachmentsFormGroup = this.planFormService.attachmentsFormGroup;
      if (!attachmentsFormGroup) {
        return;
      }
      const attachmentsControl = attachmentsFormGroup.get(EMaterialsFormControls.attachments);
      if (attachmentsControl) {
        const control = this.getValueControl(attachmentsControl);
        // Compare arrays by length and content to avoid infinite loops
        const currentValue = control.value;
        const isDifferent = !Array.isArray(currentValue) ||
          currentValue.length !== filesValue.length ||
          currentValue.some((file: File, index: number) => file !== filesValue[index]);

        if (isDifferent) {
          control.setValue(filesValue, { emitEvent: true });
          // Mark as dirty and trigger validation to show errors
          control.markAsDirty();
          control.updateValueAndValidity();
        }
      }
    });

    // In resubmit mode, ensure dependent "Other" fields are properly enabled/disabled
    // Logic: If field is in correctedFields OR user has changed the dropdown => enable
    //        Otherwise => disable initially
    effect(() => {
      if (!this.isResubmitMode()) return;

      const collaborationArray = this.getCollaborationPartnershipFormArray();
      if (!collaborationArray) return;

      collaborationArray.controls.forEach((control, index) => {
        if (!(control instanceof FormGroup)) return;

        const rowId = control.get('rowId')?.value || control.get('id')?.value;

        // Helper to check if field is corrected
        const isFieldShouldbeCorrected = (inputKey: string): boolean => {
          return this.correctedFields().some(field =>
            field.section === 'collaborationPartnership' &&
            field.inputKey === inputKey &&
            (field.id === rowId || !field.id)
          );
        };

        // agreementOtherDetails
        const otherDetailsControl = control.get(EMaterialsFormControls.agreementOtherDetails);
        if (otherDetailsControl && this.isAgreementTypeOther(control)) {
          const canEdit = isFieldShouldbeCorrected(`agreementOtherDetails`) ||
            this._userChangedDropdowns.has(`agreementType`);
          canEdit ? this.getValueControl(otherDetailsControl).enable({ emitEvent: false })
            : this.getValueControl(otherDetailsControl).disable({ emitEvent: false });
        }
      });
    });

    // Setup watcher to enable conditional field when user changes dropdown in resubmit mode
    this.setupAgreementTypeWatcher();

    // Disable all conditional fields when in view mode (except resubmit mode)
    effect(() => {
      if (this.isViewMode() && !this.isResubmitMode()) {
        this.disableAllConditionalFields();
      }
    });
  }

  /**
   * Disable all conditional fields in Saudi Company Details for view mode
   */
  private disableAllConditionalFields(): void {
    const formArray = this.getSaudiCompanyDetailsFormArray();
    formArray.controls.forEach((control) => {
      const rowControl = control as FormGroup;
      const qualificationStatusCtrl = rowControl.get(EMaterialsFormControls.qualificationStatus);
      const productsCtrl = rowControl.get(EMaterialsFormControls.products);
      const companyOverviewCtrl = rowControl.get(EMaterialsFormControls.companyOverview);
      const keyProjectsCtrl = rowControl.get(EMaterialsFormControls.keyProjectsExecutedByContractorForSEC);
      const companyOverviewKeyProjectCtrl = rowControl.get(EMaterialsFormControls.companyOverviewKeyProjectDetails);
      const companyOverviewOtherCtrl = rowControl.get(EMaterialsFormControls.companyOverviewOther);

      const qualificationStatusControl = qualificationStatusCtrl ? this.getValueControl(qualificationStatusCtrl) : null;
      const productsControl = productsCtrl ? this.getValueControl(productsCtrl) : null;
      const companyOverviewControl = companyOverviewCtrl ? this.getValueControl(companyOverviewCtrl) : null;
      const keyProjectsControl = keyProjectsCtrl ? this.getValueControl(keyProjectsCtrl) : null;
      const companyOverviewKeyProjectControl = companyOverviewKeyProjectCtrl ? this.getValueControl(companyOverviewKeyProjectCtrl) : null;
      const companyOverviewOtherControl = companyOverviewOtherCtrl ? this.getValueControl(companyOverviewOtherCtrl) : null;

      qualificationStatusControl?.disable({ emitEvent: false });
      productsControl?.disable({ emitEvent: false });
      companyOverviewControl?.disable({ emitEvent: false });
      keyProjectsControl?.disable({ emitEvent: false });
      companyOverviewKeyProjectControl?.disable({ emitEvent: false });
      companyOverviewOtherControl?.disable({ emitEvent: false });
    });
  }

  private setupConditionalFields(): void {
    if (!this.planFormService) {
      return;
    }
    const formArray = this.getSaudiCompanyDetailsFormArray();
    if (!formArray || formArray.length === 0) {
      return;
    }

    // Subscribe to each row's company type and qualification status changes
    formArray.controls.forEach((control) => {
      this.setupRowConditionalFields(control as FormGroup);
    });

    // Watch for new rows being added
    formArray.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      formArray.controls.forEach((control) => {
        this.setupRowConditionalFields(control as FormGroup);
      });
    });
  }

  private setupRowConditionalFields(rowControl: FormGroup): void {
    const companyTypeCtrl = rowControl.get(EMaterialsFormControls.companyType);
    const qualificationStatusCtrl = rowControl.get(EMaterialsFormControls.qualificationStatus);
    const productsCtrl = rowControl.get(EMaterialsFormControls.products);
    const companyOverviewCtrl = rowControl.get(EMaterialsFormControls.companyOverview);
    const keyProjectsCtrl = rowControl.get(EMaterialsFormControls.keyProjectsExecutedByContractorForSEC);
    const companyOverviewKeyProjectCtrl = rowControl.get(EMaterialsFormControls.companyOverviewKeyProjectDetails);
    const companyOverviewOtherCtrl = rowControl.get(EMaterialsFormControls.companyOverviewOther);

    const companyTypeControl = companyTypeCtrl ? this.getValueControl(companyTypeCtrl) : null;
    const qualificationStatusControl = qualificationStatusCtrl ? this.getValueControl(qualificationStatusCtrl) : null;
    const productsControl = productsCtrl ? this.getValueControl(productsCtrl) : null;
    const companyOverviewControl = companyOverviewCtrl ? this.getValueControl(companyOverviewCtrl) : null;
    const keyProjectsControl = keyProjectsCtrl ? this.getValueControl(keyProjectsCtrl) : null;
    const companyOverviewKeyProjectControl = companyOverviewKeyProjectCtrl ? this.getValueControl(companyOverviewKeyProjectCtrl) : null;
    const companyOverviewOtherControl = companyOverviewOtherCtrl ? this.getValueControl(companyOverviewOtherCtrl) : null;

    const rowId = rowControl.get('rowId')?.value || rowControl.get('id')?.value;
    const formArray = this.getSaudiCompanyDetailsFormArray();
    const index = formArray.controls.indexOf(rowControl);

    // Keys for tracking user interactions
    const companyTypeChangedKey = `saudiCompanyDetails_companyType_changed_${rowId || index}`;
    const qualificationStatusChangedKey = `saudiCompanyDetails_qualificationStatus_changed_${rowId || index}`;

    // Helper: Check if field is in correctedFields
    const isFieldShouldbeCorrected = (inputKey: string): boolean => {
      return this.correctedFields().some(field =>
        field.section === 'saudiCompanyDetails' &&
        field.inputKey === inputKey &&
        (field.id === rowId || !field.id)
      );
    };

    // Helper: Determine if a conditional field should be enabled in resubmit mode
    const shouldEnableInResubmit = (inputKey: string, parentChangedKey: string, secondaryChangedKey?: string): boolean => {
      if (!this.isResubmitMode()) return true;
      // Enable if: field is corrected OR user has changed the parent dropdown
      return isFieldShouldbeCorrected(inputKey) ||
        this._userChangedDropdowns.has(parentChangedKey) ||
        (secondaryChangedKey ? this._userChangedDropdowns.has(secondaryChangedKey) : false);
    };

    // Function to update fields based on current selections
    const updateFields = () => {
      if (this.isViewMode() && !this.isResubmitMode()) return;

      const companyTypes: string[] = companyTypeControl?.value || [];
      const qualificationStatus = qualificationStatusControl?.value;

      const isManufacturer = companyTypes.includes(EServiceCompanyType.Manufacturers.toString());
      const isContractor = companyTypes.includes(EServiceCompanyType.Contractors.toString());
      const isOther = companyTypes.includes(EServiceCompanyType.Others.toString());

      // Qualification Status - Manufacturer only
      this.updateConditionalField(
        qualificationStatusControl,
        isManufacturer,
        shouldEnableInResubmit(`qualificationStatus`, companyTypeChangedKey)
      );

      // Products - Manufacturer + (Qualified or Under Pre-Qualification)
      const showProducts = isManufacturer && (
        qualificationStatus === EServiceQualificationStatus.Qualified.toString() ||
        qualificationStatus === EServiceQualificationStatus.UnderPreQualification.toString()
      );
      this.updateConditionalField(
        productsControl,
        showProducts,
        shouldEnableInResubmit(`products`, companyTypeChangedKey, qualificationStatusChangedKey)
      );

      // Company Overview - Manufacturer + Not Qualified
      const showCompanyOverview = isManufacturer && qualificationStatus === EServiceQualificationStatus.NotQualified.toString();
      this.updateConditionalField(
        companyOverviewControl,
        showCompanyOverview,
        shouldEnableInResubmit(`companyOverview`, companyTypeChangedKey, qualificationStatusChangedKey)
      );

      // Key Projects Executed - Contractor
      this.updateConditionalField(
        keyProjectsControl,
        isContractor,
        shouldEnableInResubmit(`keyProjectsExecutedByContractorForSEC`, companyTypeChangedKey)
      );

      // Company Overview, Key Project Details - Contractor
      this.updateConditionalField(
        companyOverviewKeyProjectControl,
        isContractor,
        shouldEnableInResubmit(`companyOverviewKeyProjectDetails`, companyTypeChangedKey)
      );

      // Company Overview - Other
      this.updateConditionalField(
        companyOverviewOtherControl,
        isOther,
        shouldEnableInResubmit(`companyOverviewOther`, companyTypeChangedKey)
      );
    };

    // Initial update
    updateFields();

    // Subscribe to changes and track user interactions
    if (companyTypeControl) {
      companyTypeControl.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
        this._userChangedDropdowns.add(companyTypeChangedKey);
        updateFields();
      });
    }
    if (qualificationStatusControl) {
      qualificationStatusControl.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
        this._userChangedDropdowns.add(qualificationStatusChangedKey);
        updateFields();
      });
    }
  }

  /**
   * Helper to update a conditional field's enabled/disabled state
   * @param control The form control to update
   * @param shouldShow Whether the field should be visible based on parent selection
   * @param canEdit Whether the field should be editable (true in normal mode, conditional in resubmit)
   */
  private updateConditionalField(control: FormControl | null, shouldShow: boolean, canEdit: boolean): void {
    if (!control) return;

    if (shouldShow && canEdit) {
      control.enable({ emitEvent: false });
      control.addValidators([Validators.required]);
    } else {
      control.disable({ emitEvent: false });
      control.clearValidators();
      if (!shouldShow) {
        control.setValue(null, { emitEvent: false });
      }
    }
  }

  getSaudiCompanyDetailsFormArray(): FormArray {
    return this.planFormService?.saudiCompanyDetailsFormGroup ?? new FormArray<any>([]);
  }

  // Create new Saudi company detail item for FormArrayInput
  createSaudiCompanyDetailItem = (): FormGroup => {
    if (!this.planFormService) {
      return new FormGroup({});
    }
    return this.planFormService.createSaudiCompanyDetailItem();
  };

  getCollaborationPartnershipFormArray(): FormArray {
    return this.planFormService?.collaborationPartnershipFormGroup ?? new FormArray<any>([]);
  }

  // Create new collaboration/partnership item for FormArrayInput
  createCollaborationPartnershipItem = (): FormGroup => {
    if (!this.planFormService) {
      return new FormGroup({});
    }
    return this.planFormService.createCollaborationPartnershipItem();
  };

  isAgreementTypeOther(itemControl: AbstractControl): boolean {
    const control = itemControl.get(EMaterialsFormControls.agreementType);
    if (!control) return false;
    const agreementTypeValue = this.getValueControl(control)?.value;
    return agreementTypeValue === AgreementType.Other.toString();
  }

  /**
   * Sets up watchers for agreementType dropdown changes.
   * In resubmit mode, tracks user interaction and enables the conditional "Other" details field.
   */
  private setupAgreementTypeWatcher(): void {
    effect(() => {
      const formArray = this.getCollaborationPartnershipFormArray();
      if (!formArray || formArray.length === 0) return;

      formArray.controls.forEach((itemControl, index) => {
        if (!(itemControl instanceof FormGroup)) return;

        const control = itemControl.get(`${EMaterialsFormControls.agreementType}.${EMaterialsFormControls.value}`);
        if (!control) return;

        const initialValue = control.value as string | null;
        this.planFormService?.toggleAgreementOtherDetailsValidation(initialValue ?? null, index);

        control.valueChanges
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe((value) => {
            const isOther = value === AgreementType.Other.toString();
            // When user changes away from "Other", remove the Other details field from selectedInputs
            // so the wizard indicator updates correctly.
            if (!isOther) {
              const inputKey = `agreementOtherDetails`;
              const current = this.selectedInputs();
              const updated = current.filter(
                input => !(input.section === 'collaborationPartnership' && input.inputKey === inputKey)
              );
              if (updated.length !== current.length) this.selectedInputs.set(updated);
            }
            // Track that user changed this dropdown
            if (this.isResubmitMode()) {
              this._userChangedDropdowns.add(`agreementType`);
              const otherDetailsControl = itemControl.get(EMaterialsFormControls.agreementOtherDetails);
              if (otherDetailsControl && isOther) {
                this.getValueControl(otherDetailsControl).enable({ emitEvent: false });
              }
            }
            this.planFormService?.toggleAgreementOtherDetailsValidation(value ?? null, index);
          });
      });
    });
  }

  /**
   * Make attachments required if any collaboration row has "Provide Agreement Copy" = Yes.
   * Otherwise keep attachments optional.
   */
  private setupAttachmentsRequiredByAgreementCopy(): void {
    const collaborationArray = this.getCollaborationPartnershipFormArray();
    const attachmentsGroupControl = this.getAttachmentsFormGroup().get(EMaterialsFormControls.attachments);

    if (!collaborationArray || !attachmentsGroupControl) return;

    const attachmentsControl = this.getValueControl(attachmentsGroupControl);

    if (!attachmentsControl) return;

    const updateAttachmentsRequiredState = (): void => {
      const shouldRequire = collaborationArray.controls.some((itemControl) => {
        if (!(itemControl instanceof FormGroup)) return false;

        const provideAgreementCopyControl = itemControl.get(
          `${EMaterialsFormControls.provideAgreementCopy}.${EMaterialsFormControls.value}`
        );
        const provideAgreementCopyValue = provideAgreementCopyControl?.value;

        const normalized = String(provideAgreementCopyValue ?? '').trim().toLowerCase();
        return Number(provideAgreementCopyValue) === EYesNo.Yes ||
          normalized === 'yes' ||
          normalized === 'true';
      });

      if (shouldRequire) {
        this._attachmentsUnlockedByProvideAgreementChange.set(true);
        this.enableAttachmentsSectionForResubmit();
        attachmentsControl.addValidators(Validators.required);
      } else {
        attachmentsControl.removeValidators(Validators.required);
      }

      const attachmentsValue = attachmentsControl.value;
      const isEmpty = attachmentsValue == null ||
        (Array.isArray(attachmentsValue) && attachmentsValue.length === 0);

      if (shouldRequire && isEmpty) {
        attachmentsControl.markAsDirty();
        attachmentsControl.markAsTouched();
      }

      attachmentsControl.updateValueAndValidity({ emitEvent: false });
    };

    // Initial state
    updateAttachmentsRequiredState();

    // Keep state in sync with collaboration/partnership changes
    collaborationArray.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        if (this.isResubmitMode() && !this._attachmentsUnlockedByProvideAgreementChange()) {
          const hasUserChangedProvideAgreementCopy = collaborationArray.controls.some((itemControl) => {
            if (!(itemControl instanceof FormGroup)) return false;

            const provideAgreementCopyControl = itemControl.get(
              `${EMaterialsFormControls.provideAgreementCopy}.${EMaterialsFormControls.value}`
            );

            return !!provideAgreementCopyControl?.dirty;
          });

          if (hasUserChangedProvideAgreementCopy) {
            this._attachmentsUnlockedByProvideAgreementChange.set(true);
            this.enableAttachmentsSectionForResubmit();
          }
        }

        updateAttachmentsRequiredState();
      });
  }

  /**
   * In resubmit mode, when Provide Agreement Copy is changed by user,
   * unlock attachments section even if it was not part of corrected fields.
   */
  private enableAttachmentsSectionForResubmit(): void {
    const attachmentsFormGroup = this.getAttachmentsFormGroup();
    const attachmentsGroupControl = attachmentsFormGroup.get(EMaterialsFormControls.attachments);

    attachmentsFormGroup.enable({ emitEvent: false });

    if (attachmentsGroupControl) {
      attachmentsGroupControl.enable({ emitEvent: false });
      const attachmentsValueControl = this.getValueControl(attachmentsGroupControl);
      attachmentsValueControl.enable({ emitEvent: false });
    }
  }

  getEntityLevelFormArray(): FormArray {
    return this.planFormService?.entityLevelFormGroup ?? new FormArray<any>([]);
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
    return this.planFormService?.serviceLevelFormGroup ?? new FormArray<any>([]);
  }

  // Create new service level item for FormArrayInput
  createServiceLevelItem = (): FormGroup => {
    if (!this.planFormService) {
      return new FormGroup({});
    }
    return this.planFormService.createServiceLevelItem();
  };

  getAttachmentsFormGroup(): FormGroup {
    return this.planFormService?.attachmentsFormGroup ?? new FormGroup({});
  }

  private lockBenaRegisteredVendorIds(): void {
    const formArray = this.getSaudiCompanyDetailsFormArray();
    if (!formArray) return;

    formArray.controls.forEach((control) => {
      if (!(control instanceof FormGroup)) return;

      const benaGroup = control.get(EMaterialsFormControls.benaRegisteredVendorID);
      if (!(benaGroup instanceof FormGroup)) return;

      this.getValueControl(benaGroup).disable({ emitEvent: false });
    });
  }

  // Helper method to check if a field should be highlighted in view mode
  override isFieldShouldbeCorrected(inputKey: string, section?: string): boolean {
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

  // Helper to map UI input keys to actual form control keys
  private mapInputKeyToControlKey(section: string, inputKey: string): string {
    const keyMap: Record<string, string> = {
      agreementType: EMaterialsFormControls.agreementType,
      whyChoseThisCompany: EMaterialsFormControls.whyChoseThisCompany,
      [EMaterialsFormControls.whyChoseThisCompany]: EMaterialsFormControls.whyChoseThisCompany, // enum value alias
    };

    return keyMap[inputKey] ?? inputKey;
  }

  getOriginalFieldValueFromPlanResponse(field: IFieldInformation): any {
    return getFieldValueFromServicePlanResponse(field, this.originalPlanResponse());
  }

  // Implement abstract method from base class to get form control for a field
  override getControlForField(field: IFieldInformation): FormControl<any> | null {
    const { section, inputKey, id: rowId } = field;

    // Handle FormArray items with rowId
    if (rowId) {
      // Saudi Company Details
      if (section === 'saudiCompanyDetails') {
        const formArray = this.getSaudiCompanyDetailsFormArray();
        const rowIndex = formArray.controls.findIndex(
          control => control.get('id')?.value === rowId || control.get('rowId')?.value === rowId
        );
        if (rowIndex !== -1) {
          const rowControl = formArray.at(rowIndex);
          // Strip index suffix from inputKey (e.g., 'saudiCompanyName_0' -> 'saudiCompanyName')
          const actualInputKey = this.mapInputKeyToControlKey(section, inputKey);
          const fieldControl = rowControl.get(actualInputKey);
          if (fieldControl) {
            return this.getValueControl(fieldControl);
          }
        }
        return null;
      }

      // Collaboration/Partnership
      if (section === 'collaborationPartnership') {
        const formArray = this.getCollaborationPartnershipFormArray();
        const rowIndex = formArray.controls.findIndex(
          control => control.get('id')?.value === rowId || control.get('rowId')?.value === rowId
        );
        if (rowIndex !== -1) {
          const rowControl = formArray.at(rowIndex);
          // Strip index suffix from inputKey and map to actual control keys
          const actualInputKey = this.mapInputKeyToControlKey(section, inputKey);
          const fieldControl = rowControl.get(actualInputKey);
          if (fieldControl) {
            return this.getValueControl(fieldControl);
          }
        }
        return null;
      }

      // Service Level
      if (section === 'serviceLevel') {
        const formArray = this.getServiceLevelFormArray();
        const rowIndex = formArray.controls.findIndex(
          control => control.get('id')?.value === rowId || control.get('rowId')?.value === rowId
        );
        if (rowIndex !== -1) {
          const rowControl = formArray.at(rowIndex);
          // Strip index suffix from inputKey (e.g., 'expectedLocalizationDate_0' -> 'expectedLocalizationDate')
          // Also handle year-based keys like 'firstYear_headcount_0' -> 'firstYear_headcount'
          const actualInputKey = this.mapInputKeyToControlKey(section, inputKey);
          const fieldControl = rowControl.get(actualInputKey);
          if (fieldControl) {
            return this.getValueControl(fieldControl);
          }
        }
        return null;
      }
    }

    // Handle Entity Level (single item FormArray)
    if (section === 'entityLevel') {
      const entityLevelItem = this.getEntityLevelItem();
      // Strip 'entityLevel_' prefix from inputKey (e.g., 'entityLevel_firstYear_headcount' -> 'firstYear_headcount')
      const actualInputKey = inputKey.startsWith('entityLevel_') ? inputKey.substring('entityLevel_'.length) : inputKey;
      const fieldControl = entityLevelItem.get(actualInputKey);
      if (fieldControl) {
        return this.getValueControl(fieldControl);
      }
      return null;
    }

    // Handle Attachments (FormGroup)
    if (section === 'attachments') {
      const attachmentsFormGroup = this.getAttachmentsFormGroup();
      const fieldControl = attachmentsFormGroup.get(inputKey);
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
