import { ChangeDetectionStrategy, Component, computed, inject, signal, effect, input, model, DestroyRef } from '@angular/core';
import { ServicePlanFormService } from 'src/app/shared/services/plan/service-plan-form-service/service-plan-form-service';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormArrayInput } from 'src/app/shared/components/utility-components/form-array-input/form-array-input';
import { BaseLabelComponent } from 'src/app/shared/components/base-components/base-label/base-label.component';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { MultiSelectModule } from 'primeng/multiselect';
import { BaseErrorMessages } from 'src/app/shared/components/base-components/base-error-messages/base-error-messages';
import { GroupInputWithCheckbox } from 'src/app/shared/components/form/group-input-with-checkbox/group-input-with-checkbox';
import { EMaterialsFormControls } from 'src/app/shared/enums';
import { PlanStore } from 'src/app/shared/stores/plan/plan.store';
import { AgreementType, EServiceProvidedTo, EServiceQualificationStatus, EYesNo } from 'src/app/shared/enums/plan.enum';
import { TextareaModule } from 'primeng/textarea';
import { InputNumberModule } from 'primeng/inputnumber';
import { FileuploadComponent } from 'src/app/shared/components/utility-components/fileupload/fileupload.component';
import { CommentStateComponent } from '../../comment-state-component/comment-state-component';
import { GeneralConfirmationDialogComponent } from 'src/app/shared/components/utility-components/general-confirmation-dialog/general-confirmation-dialog.component';
import { PlanStepBaseClass } from '../../plan-localization/plan-step-base-class';
import { TCommentPhase } from '../../plan-localization/product-localization-plan-wizard/product-localization-plan-wizard';
import { IFieldInformation } from 'src/app/shared/interfaces/plans.interface';
import { TColors } from 'src/app/shared/interfaces';
import { FormsModule } from '@angular/forms';
import { ConditionalColorClassDirective } from 'src/app/shared/directives';

@Component({
  selector: 'app-service-localization-step-existing-saudi',
  imports: [
    ReactiveFormsModule,
    FormArrayInput,
    InputTextModule,
    SelectModule,
    MultiSelectModule,
    BaseErrorMessages,
    GroupInputWithCheckbox,
    TextareaModule,
    InputNumberModule,
    FileuploadComponent,
    FormsModule,
  ],
  templateUrl: './service-localization-step-existing-saudi.html',
  styleUrl: './service-localization-step-existing-saudi.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ServiceLocalizationStepExistingSaudi extends PlanStepBaseClass {
  isViewMode = input<boolean>(false);

  readonly planFormService = inject(ServicePlanFormService);
  planStore = inject(PlanStore);

  pageTitle = input.required<string>();
  selectedInputColor = input.required<TColors>();
  commentPhase = model<TCommentPhase>('none');
  selectedInputs = model<IFieldInformation[]>([]);
  files = signal<File[]>([]);
  EMaterialsFormControls = EMaterialsFormControls;
  EServiceProvidedTo = EServiceProvidedTo;
  EServiceQualificationStatus = EServiceQualificationStatus;
  EYesNo = EYesNo;

  companyTypeOptions = this.planStore.companyTypeOptions;
  qualificationStatusOptions = this.planStore.qualificationStatusOptions;
  yesNoOptions = this.planStore.yesNoOptions;
  agreementTypeOptions = this.planStore.agreementTypeOptions;

  get formGroup() {
    return this.planFormService?.step3_existingSaudi ?? new FormGroup({});
  }

  availableQuartersWithPast = computed(() => this.planFormService?.getAvailableQuartersWithPast(5, 5) ?? []);

  yearColumns = computed(() => this.planFormService?.upcomingYears(5) ?? []);

  // Custom header labels for Saudi Company Details table to ensure correct order
  saudiCompanyDetailsHeaderLabels: Record<string, string> = {
    [EMaterialsFormControls.saudiCompanyName]: 'Saudi Company Name',
    [EMaterialsFormControls.registeredVendorIDwithSEC]: 'Vendor ID With SEC',
    [EMaterialsFormControls.benaRegisteredVendorID]: 'Bena Register Vendor ID',
    [EMaterialsFormControls.companyType]: 'Company Type',
    [EMaterialsFormControls.qualificationStatus]: 'Qualification Status With SEC',
    [EMaterialsFormControls.products]: 'Products',
    [EMaterialsFormControls.companyOverview]: 'Company Overview',
    [EMaterialsFormControls.keyProjectsExecutedByContractorForSEC]: 'Key Projects Executed By Contractor For SEC',
    [EMaterialsFormControls.companyOverviewKeyProjectDetails]: 'Company Overview Key Project Details',
    [EMaterialsFormControls.companyOverviewOther]: 'Company Overview Other',
  };

  yearControlKeys = [
    EMaterialsFormControls.firstYear,
    EMaterialsFormControls.secondYear,
    EMaterialsFormControls.thirdYear,
    EMaterialsFormControls.fourthYear,
    EMaterialsFormControls.fifthYear,
  ];

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
    // Structure: first two columns (Service name + Expected Localization Date), then yearCols headcount, then yearCols saudization, then two columns (Key Measures, Support)
    return [
      { label: 'Service Name', rowspan: 2, dataGroup: false },
      { label: 'Expected Localization Date', rowspan: 2, dataGroup: false },
      { label: 'Expected Annual Headcount (To be filled for the KSA based facility only)', colspan: yearCols, dataGroup: true },
      { label: 'Mention Y-o-Y expected Saudization % (upto 2030) (To be filled for the KSA based facility only)', colspan: yearCols, dataGroup: true },
      { label: 'Key Measures to Upskill Saudis', rowspan: 2, dataGroup: false },
      { label: 'Support Required from SEC (if any)', rowspan: 2, dataGroup: false },
    ];
  });

  destroyRef = inject(DestroyRef);

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

    // Disable all conditional fields when in view mode
    effect(() => {
      if (this.isViewMode()) {
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

    // Function to update fields based on current selections
    const updateFields = () => {
      // In view mode, don't enable any fields - keep them all disabled
      if (this.isViewMode()) {
        return;
      }

      const companyTypes: string[] = companyTypeControl?.value || [];
      const qualificationStatus = qualificationStatusControl?.value;

      const isManufacturer = companyTypes.includes(EServiceProvidedTo.Manufacturers.toString());
      const isContractor = companyTypes.includes(EServiceProvidedTo.Contractors.toString());
      const isOther = companyTypes.includes(EServiceProvidedTo.Others.toString());

      // Qualification Status - only for Manufacturer
      if (isManufacturer) {
        qualificationStatusControl?.enable({ emitEvent: false });
      } else {
        qualificationStatusControl?.disable({ emitEvent: false });
        qualificationStatusControl?.setValue(null, { emitEvent: false });
      }

      // Products - Manufacturer + (Qualified or Under Pre-Qualification)
      if (isManufacturer && (
        qualificationStatus === EServiceQualificationStatus.Qualified.toString() ||
        qualificationStatus === EServiceQualificationStatus.UnderPreQualification.toString()
      )) {
        productsControl?.enable({ emitEvent: false });
      } else {
        productsControl?.disable({ emitEvent: false });
        productsControl?.setValue(null, { emitEvent: false });
      }

      // Company Overview - Manufacturer + Not Qualified
      if (isManufacturer && qualificationStatus === EServiceQualificationStatus.NotQualified.toString()) {
        companyOverviewControl?.enable({ emitEvent: false });
      } else {
        companyOverviewControl?.disable({ emitEvent: false });
        companyOverviewControl?.setValue(null, { emitEvent: false });
      }

      // Key Projects Executed - Contractor
      if (isContractor) {
        keyProjectsControl?.enable({ emitEvent: false });
      } else {
        keyProjectsControl?.disable({ emitEvent: false });
        keyProjectsControl?.setValue(null, { emitEvent: false });
      }

      // Company Overview, Key Project Details - Contractor
      if (isContractor) {
        companyOverviewKeyProjectControl?.enable({ emitEvent: false });
      } else {
        companyOverviewKeyProjectControl?.disable({ emitEvent: false });
        companyOverviewKeyProjectControl?.setValue(null, { emitEvent: false });
      }

      // Company Overview - Other
      if (isOther) {
        companyOverviewOtherControl?.enable({ emitEvent: false });
      } else {
        companyOverviewOtherControl?.disable({ emitEvent: false });
        companyOverviewOtherControl?.setValue(null, { emitEvent: false });
      }
    };

    // Initial update
    updateFields();

    // Subscribe to changes
    if (companyTypeControl) {
      companyTypeControl.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => updateFields());
    }
    if (qualificationStatusControl) {
      qualificationStatusControl.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => updateFields());
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

  private _servicesSynced = false;
  private _conditionalFieldsSetup = false;
}
