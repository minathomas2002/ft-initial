import { ChangeDetectionStrategy, Component, computed, inject, signal, effect, input, DestroyRef } from '@angular/core';
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
    FileuploadComponent
  ],
  templateUrl: './service-localization-step-existing-saudi.html',
  styleUrl: './service-localization-step-existing-saudi.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ServiceLocalizationStepExistingSaudi {
  isViewMode = input<boolean>(false);

  serviceForm = inject(ServicePlanFormService);
  planStore = inject(PlanStore);

  showCheckbox = signal(false);
  files = signal<File[]>([]);
  EMaterialsFormControls = EMaterialsFormControls;
  EServiceProvidedTo = EServiceProvidedTo;
  EServiceQualificationStatus = EServiceQualificationStatus;
  EYesNo = EYesNo;

  companyTypeOptions = this.planStore.companyTypeOptions;
  qualificationStatusOptions = this.planStore.qualificationStatusOptions;
  yesNoOptions = this.planStore.yesNoOptions;
  agreementTypeOptions = this.planStore.agreementTypeOptions;

  availableQuartersWithPast = computed(() => this.serviceForm.getAvailableQuartersWithPast(5, 5));

  yearColumns = computed(() => this.serviceForm.upcomingYears(5));

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

  constructor() {
    // Sync services from cover page to service level on component initialization
    this.serviceForm.syncServicesFromCoverPageToExistingSaudi();

    // Re-sync when services on cover page change
    const servicesArray = this.serviceForm.getServicesFormArray();
    servicesArray?.valueChanges?.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.serviceForm.syncServicesFromCoverPageToExistingSaudi();
    });

    // Setup conditional field enabling/disabling
    this.setupConditionalFields();

    // Initialize files from form control value
    const attachmentsControl = this.getAttachmentsFormGroup().get(EMaterialsFormControls.attachments);
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
      const attachmentsControl = this.getAttachmentsFormGroup().get(EMaterialsFormControls.attachments);
      if (attachmentsControl) {
        const control = this.getValueControl(attachmentsControl);
        // Only update if different to avoid infinite loops
        if (control.value !== filesValue) {
          control.setValue(filesValue, { emitEvent: false });
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
      const qualificationStatusControl = this.getValueControl(rowControl.get(EMaterialsFormControls.qualificationStatus));
      const productsControl = this.getValueControl(rowControl.get(EMaterialsFormControls.products));
      const companyOverviewControl = this.getValueControl(rowControl.get(EMaterialsFormControls.companyOverview));
      const keyProjectsControl = this.getValueControl(rowControl.get(EMaterialsFormControls.keyProjectsExecutedByContractorForSEC));
      const companyOverviewKeyProjectControl = this.getValueControl(rowControl.get(EMaterialsFormControls.companyOverviewKeyProjectDetails));
      const companyOverviewOtherControl = this.getValueControl(rowControl.get(EMaterialsFormControls.companyOverviewOther));

      qualificationStatusControl?.disable({ emitEvent: false });
      productsControl?.disable({ emitEvent: false });
      companyOverviewControl?.disable({ emitEvent: false });
      keyProjectsControl?.disable({ emitEvent: false });
      companyOverviewKeyProjectControl?.disable({ emitEvent: false });
      companyOverviewOtherControl?.disable({ emitEvent: false });
    });
  }

  private setupConditionalFields(): void {
    const formArray = this.getSaudiCompanyDetailsFormArray();

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
    const companyTypeControl = this.getValueControl(rowControl.get(EMaterialsFormControls.companyType));
    const qualificationStatusControl = this.getValueControl(rowControl.get(EMaterialsFormControls.qualificationStatus));
    const productsControl = this.getValueControl(rowControl.get(EMaterialsFormControls.products));
    const companyOverviewControl = this.getValueControl(rowControl.get(EMaterialsFormControls.companyOverview));
    const keyProjectsControl = this.getValueControl(rowControl.get(EMaterialsFormControls.keyProjectsExecutedByContractorForSEC));
    const companyOverviewKeyProjectControl = this.getValueControl(rowControl.get(EMaterialsFormControls.companyOverviewKeyProjectDetails));
    const companyOverviewOtherControl = this.getValueControl(rowControl.get(EMaterialsFormControls.companyOverviewOther));

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
    return this.serviceForm.saudiCompanyDetailsFormGroup!;
  }

  // Create new Saudi company detail item for FormArrayInput
  createSaudiCompanyDetailItem = (): FormGroup => {
    return this.serviceForm.createSaudiCompanyDetailItem();
  };

  getCollaborationPartnershipFormArray(): FormArray {
    return this.serviceForm.collaborationPartnershipFormGroup!;
  }

  // Create new collaboration/partnership item for FormArrayInput
  createCollaborationPartnershipItem = (): FormGroup => {
    return this.serviceForm.createCollaborationPartnershipItem();
  };

  isAgreementTypeOther(itemControl: AbstractControl): boolean {
    const agreementTypeValue = this.getValueControl(itemControl.get(EMaterialsFormControls.agreementType))?.value;
    return agreementTypeValue === AgreementType.Other.toString();
  }

  getEntityLevelFormArray(): FormArray {
    return this.serviceForm.entityLevelFormGroup!;
  }

  getEntityLevelItem(): FormGroup {
    const formArray = this.getEntityLevelFormArray();
    return formArray.at(0) as FormGroup;
  }

  getServiceLevelFormArray(): FormArray {
    return this.serviceForm.serviceLevelFormGroup!;
  }

  // Create new service level item for FormArrayInput
  createServiceLevelItem = (): FormGroup => {
    return this.serviceForm.createServiceLevelItem();
  };

  getAttachmentsFormGroup(): FormGroup {
    return this.serviceForm.attachmentsFormGroup;
  }

  getHasCommentControl(control: any): FormControl<boolean> {
    if (!control) return new FormControl<boolean>(false, { nonNullable: true });
    const formGroup = control;
    return (
      (formGroup.get(EMaterialsFormControls.hasComment)) ??
      new FormControl<boolean>(false, { nonNullable: true })
    );
  }

  getValueControl(control: any): FormControl<any> {
    if (!control) return new FormControl('');
    const formGroup = control as any;
    return (formGroup.get(EMaterialsFormControls.value)) ?? new FormControl('');
  }

  getFormControl(control: AbstractControl) {
    return control as unknown as FormControl;
  }

  onAddComment(): void {
    this.showCheckbox.set(true);
  }
}
