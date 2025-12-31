import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { FormArray, FormGroup } from '@angular/forms';
import { EMaterialsFormControls } from 'src/app/shared/enums';
import { SummarySectionHeader } from '../../../../summary-section-header/summary-section-header';
import { SummaryField } from '../../../../summary-field/summary-field';
import { SummaryTableCell } from '../../../../summary-table-cell/summary-table-cell';

@Component({
  selector: 'app-summary-section-direct-localization',
  imports: [SummarySectionHeader, SummaryTableCell],
  templateUrl: './summary-section-direct-localization.html',
  styleUrl: './summary-section-direct-localization.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SummarySectionDirectLocalization {
  isViewMode = input<boolean>(false);
  formGroup = input.required<FormGroup>();
  onEdit = output<void>();

  EMaterialsFormControls = EMaterialsFormControls;
  currentYear = new Date().getFullYear();

  // Year columns for Entity Level and Service Level (5 years)
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

  // Form group accessors
  directLocalizationServiceLevelFormArray = computed(() => {
    return this.formGroup().get(EMaterialsFormControls.serviceLevelFormGroup) as FormArray;
  });

  entityLevelFormArray = computed(() => {
    return this.formGroup().get(EMaterialsFormControls.entityLevelFormGroup) as FormArray;
  });

  serviceLevelFormArray = computed(() => {
    return this.formGroup().get(EMaterialsFormControls.serviceLevelFormGroup) as FormArray;
  });

  // Helper method to get values
  getValue(controlPath: string): any {
    const parts = controlPath.split('.');
    let control: any = this.formGroup();

    for (const part of parts) {
      if (control instanceof FormGroup || control instanceof FormArray) {
        control = control.get(part);
      } else {
        return null;
      }
    }

    if (control && 'value' in control) {
      const valueControl = control.get(EMaterialsFormControls.value);
      return valueControl ? valueControl.value : control.value;
    }

    return control?.value ?? null;
  }

  hasFieldError(fieldPath: string): boolean {
    const parts = fieldPath.split('.');
    let control: any = this.formGroup();

    for (const part of parts) {
      if (control instanceof FormGroup || control instanceof FormArray) {
        control = control.get(part);
      } else {
        return false;
      }
    }

    if (control && control.invalid && control.dirty) {
      return true;
    }

    return false;
  }

  onEditClick(): void {
    this.onEdit.emit();
  }

  // Localization Strategy array (same as service level)
  localizationStrategy = computed(() => {
    const strategyArray = this.directLocalizationServiceLevelFormArray();
    if (!strategyArray) return [];

    return Array.from({ length: strategyArray.length }, (_, i) => {
      const group = strategyArray.at(i) as FormGroup;
      const getValueFromControl = (controlName: string) => {
        const ctrl = group.get(controlName);
        if (ctrl instanceof FormGroup) {
          return ctrl.get(EMaterialsFormControls.value)?.value;
        }
        return ctrl?.value;
      };

      return {
        index: i,
        serviceName: getValueFromControl(EMaterialsFormControls.serviceName),
        expectedLocalizationDate: getValueFromControl(EMaterialsFormControls.expectedLocalizationDate),
        localizationApproach: getValueFromControl(EMaterialsFormControls.localizationApproach),
        localizationApproachOther: getValueFromControl(EMaterialsFormControls.localizationApproachOtherDetails),
        location: getValueFromControl(EMaterialsFormControls.location),
        locationOther: getValueFromControl(EMaterialsFormControls.locationOtherDetails),
        capexRequired: getValueFromControl(EMaterialsFormControls.capexRequired),
        supervisionOversight: getValueFromControl(EMaterialsFormControls.supervisionOversightEntity),
        proprietaryTools: getValueFromControl(EMaterialsFormControls.willBeAnyProprietaryToolsSystems),
        proprietaryToolsExplanation: getValueFromControl(EMaterialsFormControls.proprietaryToolsSystemsDetails),
      };
    });
  });

  hasLocalizationStrategyFieldError(index: number, controlName: string): boolean {
    return this.hasFieldError(`localizationStrategyFormGroup.${index}.${controlName}.value`);
  }

  // Entity Level data
  entityLevel = computed(() => {
    const entityArray = this.entityLevelFormArray();
    if (!entityArray || entityArray.length === 0) return null;

    const group = entityArray.at(0) as FormGroup;
    const getValueFromControl = (controlName: string) => {
      const ctrl = group.get(controlName);
      if (ctrl instanceof FormGroup) {
        return ctrl.get(EMaterialsFormControls.value)?.value;
      }
      return ctrl?.value;
    };

    return {
      headcount: this.yearControlKeys.map(key => ({ value: getValueFromControl(`${key}_headcount`), controlName: `${key}_headcount` })),
      saudization: this.yearControlKeys.map(key => ({ value: getValueFromControl(`${key}_saudization`), controlName: `${key}_saudization` })),
    };
  });

  hasEntityFieldError(controlName: string): boolean {
    // entity array only has one item at index 0
    return this.hasFieldError(`entityLevelFormGroup.0.${controlName}.value`);
  }

  // Service Level data
  serviceLevel = computed(() => {
    const serviceArray = this.serviceLevelFormArray();
    if (!serviceArray) return [];

    return Array.from({ length: serviceArray.length }, (_, i) => {
      const group = serviceArray.at(i) as FormGroup;
      const getValueFromControl = (controlName: string) => {
        const ctrl = group.get(controlName);
        if (ctrl instanceof FormGroup) {
          return ctrl.get(EMaterialsFormControls.value)?.value;
        }
        return ctrl?.value;
      };

      return {
        index: i,
        serviceName: getValueFromControl(EMaterialsFormControls.serviceName),
        years: this.yearControlKeys.map(key => ({ value: getValueFromControl(`${key}_saudization`), controlName: `${key}_saudization` })),
      };
    });
  });

  hasServiceLevelFieldError(index: number, controlName: string): boolean {
    return this.hasFieldError(`serviceLevelFormGroup.${index}.${controlName}.value`);
  }
}
