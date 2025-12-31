import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { FormArray, ReactiveFormsModule, FormControl, AbstractControl } from '@angular/forms';
import { BaseLabelComponent } from 'src/app/shared/components/base-components/base-label/base-label.component';
import { InputTextModule } from 'primeng/inputtext';
import { DatePickerModule } from 'primeng/datepicker';
import { SelectModule } from 'primeng/select';
import { GroupInputWithCheckbox } from 'src/app/shared/components/form/group-input-with-checkbox/group-input-with-checkbox';
import { FormArrayInput } from 'src/app/shared/components/utility-components/form-array-input/form-array-input';
import { BaseErrorMessages } from 'src/app/shared/components/base-components/base-error-messages/base-error-messages';
import { RadioButtonModule } from 'primeng/radiobutton';
import { TrimOnBlurDirective } from 'src/app/shared/directives';
import { AdminOpportunitiesStore } from 'src/app/shared/stores/admin-opportunities/admin-opportunities.store';
import { PlanStore } from 'src/app/shared/stores/plan/plan.store';
import { toSignal } from '@angular/core/rxjs-interop';
import { EMaterialsFormControls } from 'src/app/shared/enums';
import { EServiceProvidedTo } from 'src/app/shared/enums';
import { PhoneInputComponent } from 'src/app/shared/components/form/phone-input/phone-input.component';
import { ServicePlanFormService } from 'src/app/shared/services/plan/service-plan-form-service/service-plan-form-service';
import { TextareaModule } from 'primeng/textarea';

@Component({
  selector: 'app-service-localization-step-overview',
  imports: [
    ReactiveFormsModule,
    BaseLabelComponent,
    InputTextModule,
    DatePickerModule,
    SelectModule,
    GroupInputWithCheckbox,
    FormArrayInput,
    BaseErrorMessages,
    RadioButtonModule,
    TrimOnBlurDirective,
    PhoneInputComponent,
    TextareaModule
  ],
  templateUrl: './service-localization-step-overview.html',
  styleUrl: './service-localization-step-overview.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ServiceLocalizationStepOverview {
  private readonly serviceForm = inject(ServicePlanFormService);
  private readonly planStore = inject(PlanStore);

  showCheckbox = signal(false);

  formGroup = this.serviceForm.step2_overview;

  basicInformationFormGroup = this.serviceForm.basicInformationFormGroup;
  basicInformationFormGroupControls = this.serviceForm.basicInformationFormGroup.controls;
  companyInformationFormGroup = this.serviceForm.overviewCompanyInformationFormGroup;
  companyInformationFormGroupControls = this.serviceForm.overviewCompanyInformationFormGroup.controls;
  locationInformationFormGroup = this.serviceForm.locationInformationFormGroup;
  locationInformationFormGroupControls = this.serviceForm.locationInformationFormGroup.controls;
  localAgentInformationFormGroup = this.serviceForm.localAgentInformationFormGroup;
  localAgentInformationFormGroupControls = this.serviceForm.localAgentInformationFormGroup.controls;

  getDetailsFormArray(): FormArray {
    return this.serviceForm.getServiceDetailsFormArray()!;
  }

  // Dropdown options
  serviceTypeOptions = this.planStore.serviceTypeOptions;
  serviceCategoryOptions = this.planStore.serviceCategoryOptions;
  serviceProvidedToOptions = this.planStore.serviceProvidedToOptions;
  yesNoOptions = this.planStore.yesNoOptions;
  localizationMethodologyOptions = this.planStore.localizationMethodologyOptions;

  // id for 'Others' in serviceProvidedTo options (string)
  serviceProvidedToOthersId = EServiceProvidedTo.Others.toString();

  availableOpportunities = this.planStore.availableOpportunities;
  isLoadingAvailableOpportunities = this.planStore.isLoadingAvailableOpportunities;

  private doYouCurrentlyHaveLocalAgentInKSAControl = this.locationInformationFormGroupControls[
    EMaterialsFormControls.doYouCurrentlyHaveLocalAgentInKSA
  ];

  private doYouHaveLocalAgentInKSASignal = toSignal(
    this.doYouCurrentlyHaveLocalAgentInKSAControl.valueChanges,
    {
      initialValue: this.doYouCurrentlyHaveLocalAgentInKSAControl.value,
    }
  );

  showLocalAgentInformation = computed(() => {
    return this.doYouHaveLocalAgentInKSASignal() === true;
  });

  isOpportunityDisabled = computed(() => {
    return this.planStore.appliedOpportunity() !== null;
  });

  availableQuarters = computed(() => this.serviceForm.getAvailableQuarters(5));

  constructor() {
    // Sync services from cover page to overview details on component initialization
    this.serviceForm.syncServicesFromCoverPageToOverview();

    effect(() => {
      const doYouHaveLocalAgentInKSA = this.doYouHaveLocalAgentInKSASignal();
      this.serviceForm.toggleLocalAgentInformValidation(doYouHaveLocalAgentInKSA === true);
    });

    // Initialize validation for existing details rows (use current values)
    const detailsArray = this.getDetailsFormArray();
    detailsArray.controls.forEach((ctrl, idx) => {
      const val = this.getValueControl(ctrl.get(EMaterialsFormControls.serviceProvidedTo))?.value ?? null;
      this.serviceForm.toggleServiceProvidedToCompanyNamesValidation(val, idx);
    });

    const opportunityControl = this.getFormControl(
      this.basicInformationFormGroupControls[EMaterialsFormControls.opportunity]
    );
    const appliedOpportunity = this.planStore.appliedOpportunity();
    if (appliedOpportunity) {
      opportunityControl.setValue(this.planStore.availableOpportunities()[0]);
    }
  }

  onServiceProvidedToChange(value: string | null, index: number): void {
    this.serviceForm.toggleServiceProvidedToCompanyNamesValidation(value, index);
  }

  getHasCommentControl(control: any) {
    if (!control) return new FormControl<boolean>(false, { nonNullable: true });
    const formGroup = control as any;
    return (
      (formGroup.get(EMaterialsFormControls.hasComment) as any) ??
      new FormControl<boolean>(false, { nonNullable: true })
    );
  }

  getValueControl(control: any) {
    if (!control) return new FormControl<any>('');
    const formGroup = control as any;
    return (formGroup.get(EMaterialsFormControls.value) as any) ?? new FormControl<any>('');
  }

  getFormControl(control: AbstractControl): FormControl<any> {
    return control as unknown as FormControl<any>;
  }

  onAddComment(): void {
    this.showCheckbox.set(true);
  }
}
