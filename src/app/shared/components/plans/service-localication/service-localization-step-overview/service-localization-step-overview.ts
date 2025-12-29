import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { ServiceLocalizationFormService } from 'src/app/shared/services/plan/materials-form-service/service-localization-form-service';
import { ReactiveFormsModule } from '@angular/forms';
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
import { PhoneInputComponent } from 'src/app/shared/components/form/phone-input/phone-input.component';

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
  ],
  templateUrl: './service-localization-step-overview.html',
  styleUrl: './service-localization-step-overview.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ServiceLocalizationStepOverview {
  private readonly serviceForm = inject(ServiceLocalizationFormService);
  private readonly adminOpportunitiesStore = inject(AdminOpportunitiesStore);
  private readonly planStore = inject(PlanStore);

  showCheckbox = signal(false);

  formGroup = this.serviceForm.overviewFormGroup;

  basicInformationFormGroup = this.serviceForm.basicInformationFormGroup;
  companyInformationFormGroup = this.serviceForm.overviewCompanyInformationFormGroup;
  locationInformationFormGroup = this.serviceForm.locationInformationFormGroup;
  localAgentInformationFormGroup = this.serviceForm.localAgentInformationFormGroup;
  // Details of Services FormArray
  getDetailsFormArray() {
    return this.serviceForm.getDetailsOfServicesFormArray();
  }

  // Dropdown options
  serviceTypeOptions = this.planStore.serviceTypeOptions;
  serviceCategoryOptions = this.planStore.serviceCategoryOptions;
  serviceProvidedToOptions = this.planStore.serviceProvidedToOptions;
  yesNoOptions = this.planStore.yesNoOptions;
  localizationMethodologyOptions = this.planStore.localizationMethodologyOptions;

  availableOpportunities = this.planStore.availableOpportunities;
  isLoadingAvailableOpportunities = this.planStore.isLoadingAvailableOpportunities;

  private doYouCurrentlyHaveLocalAgentInKSAControl = this.locationInformationFormGroup.get(
    EMaterialsFormControls.doYouCurrentlyHaveLocalAgentInKSA
  )!;

  private doYouHaveLocalAgentInKSASignal = toSignal(
    this.doYouCurrentlyHaveLocalAgentInKSAControl.valueChanges,
    {
      initialValue: this.doYouCurrentlyHaveLocalAgentInKSAControl.value,
    }
  );

  showLocalAgentInformation = computed(() => {
    return this.doYouHaveLocalAgentInKSASignal() === true;
  });

  constructor() {
    effect(() => {
      const doYouHaveLocalAgentInKSA = this.doYouHaveLocalAgentInKSASignal();
      this.serviceForm.toggleLocalAgentInformValidation(doYouHaveLocalAgentInKSA === true);
    });

    // Initialize details rows based on services and resync on services changes
    this.serviceForm.syncDetailsWithServices();
    const servicesArray = this.serviceForm.getServicesFormArray();
    servicesArray.valueChanges.subscribe(() => {
      this.serviceForm.syncDetailsWithServices();
    });
  }

  getHasCommentControl(control: any) {
    const formGroup = control as any;
    return formGroup.get(EMaterialsFormControls.hasComment);
  }

  getValueControl(control: any) {
    const formGroup = control as any;
    return formGroup.get(EMaterialsFormControls.value);
  }

  getFormControl(control: any) {
    return control;
  }

  onAddComment(): void {
    this.showCheckbox.set(true);
  }
}
