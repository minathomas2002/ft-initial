import { ChangeDetectionStrategy, Component, inject, input, signal } from '@angular/core';
import { AbstractControl, FormArray, FormControl, FormGroup } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { BaseLabelComponent } from 'src/app/shared/components/base-components/base-label/base-label.component';
import { BaseErrorMessages } from 'src/app/shared/components/base-components/base-error-messages/base-error-messages';
import { FormArrayInput } from '../../../utility-components/form-array-input/form-array-input';
import { TrimOnBlurDirective } from 'src/app/shared/directives';
import { GroupInputWithCheckbox } from '../../../form/group-input-with-checkbox/group-input-with-checkbox';
import { ServicePlanFormService } from 'src/app/shared/services/plan/service-plan-form-service/service-plan-form-service';

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
  ],
  templateUrl: './service-localization-step-cover-page.html',
  styleUrl: './service-localization-step-cover-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ServiceLocalizationStepCoverPage {
  isViewMode = input<boolean>(false);

  serviceLocalizationFormService = inject(ServicePlanFormService);
  showCheckbox = signal(false);

  // Get services form array
  getServicesFormArray(): FormArray {
    return this.serviceLocalizationFormService.getServicesFormArray()!;
  }

  // Get cover page nested company information group
  get coverPageCompanyInformationFormGroup(): FormGroup {
    return this.serviceLocalizationFormService.coverPageCompanyInformationFormGroup;
  }

  // Create service item (for form-array-input component)
  createServiceItem = (): FormGroup => {
    return this.serviceLocalizationFormService.createServiceItem();
  };

  // Remove service item
  removeServiceItem(index: number): void {
    this.serviceLocalizationFormService.removeServiceItem(index);
  }

  getFormControl(control: AbstractControl): FormControl<any> {
    return control as unknown as FormControl<any>;
  }

  getValueControl(control: AbstractControl | null): FormControl<any> {
    if (!control) return new FormControl<any>('');
    return this.serviceLocalizationFormService.getValueControl(control);
  }

  getHasCommentControl(control: AbstractControl | null): FormControl<boolean> {
    if (!control) return new FormControl<boolean>(false, { nonNullable: true });
    if (control instanceof FormGroup) {
      try {
        return this.serviceLocalizationFormService.getHasCommentControl(control);
      } catch {
        return new FormControl<boolean>(false, { nonNullable: true });
      }
    }
    return new FormControl<boolean>(false, { nonNullable: true });
  }
}
