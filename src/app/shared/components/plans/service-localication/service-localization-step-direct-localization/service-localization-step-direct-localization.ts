import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal } from '@angular/core';
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
  ],
  templateUrl: './service-localization-step-direct-localization.html',
  styleUrl: './service-localization-step-direct-localization.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ServiceLocalizationStepDirectLocalization {
  serviceForm = inject(ServicePlanFormService);
  planStore = inject(PlanStore);

  showCheckbox = signal(false);
  EMaterialsFormControls = EMaterialsFormControls;
  yesNoOptions = this.planStore.yesNoOptions;
  localizationApproachOptions = this.planStore.localizationApproachOptions;
  locationOptions = this.planStore.locationOptions;

  currentYear = new Date().getFullYear();
  yearColumns = computed(() => {
    const years: number[] = [];
    for (let i = 0; i < 5; i++) {
      years.push(this.currentYear + i);
    }
    return years;
  });

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
        labels[`${key}_saudization`] = String(years[idx]);
      }
    });
    return labels;
  });

  // Grouped header cell for Service Level years
  serviceLevelGroupHeader = computed(() => {
    const yearCols = this.yearControlKeys.length;
    return [
      { label: '', colspan: 2 },
      { label: 'Mention Y-o-Y expected Saudization % (upto 2030) (To be filled for the KSA based facility only)', colspan: yearCols },
      { label: '', colspan: 2 },
      { label: '', colspan: 1 },
    ];
  });

  constructor() {
    // Sync services from cover page to service level on component initialization
    this.serviceForm.syncServicesFromCoverPageToDirectLocalization();
  }

  getLocalizationStrategyFormArray(): FormArray {
    return this.serviceForm.directLocalizationServiceLevelFormGroup!;
  }

  createLocalizationStrategyItem = (): FormGroup => {
    return this.serviceForm.createDirectLocalizationServiceLevelItem();
  };

  isLocalizationApproachOther(itemControl: AbstractControl): boolean {
    const value = this.getValueControl(itemControl.get(EMaterialsFormControls.localizationApproach))?.value;
    return value === ELocalizationApproach.Other.toString();
  }

  isLocationOther(itemControl: AbstractControl): boolean {
    const value = this.getValueControl(itemControl.get(EMaterialsFormControls.location))?.value;
    return value === ELocation.Other.toString();
  }

  isProprietaryToolsYes(itemControl: AbstractControl): boolean {
    const value = this.getValueControl(itemControl.get(EMaterialsFormControls.willBeAnyProprietaryToolsSystems))?.value;
    return value === EYesNo.Yes.toString();
  }

  getEntityLevelFormArray(): FormArray {
    return this.serviceForm.directLocalizationEntityLevelFormGroup!;
  }

  getEntityLevelItem(): FormGroup {
    const formArray = this.getEntityLevelFormArray();
    return formArray.at(0) as FormGroup;
  }

  getServiceLevelFormArray(): FormArray {
    return this.serviceForm.directLocalizationServiceLevelFormGroup!;
  }

  createServiceLevelItem = (): FormGroup => {
    return this.serviceForm.createDirectLocalizationServiceLevelItem();
  };

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

  onAddComment(): void {
    this.showCheckbox.set(true);
  }
}
