import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { AbstractControl, FormArray, FormControl, FormGroup } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { BaseLabelComponent } from 'src/app/shared/components/base-components/base-label/base-label.component';
import { BaseErrorMessages } from 'src/app/shared/components/base-components/base-error-messages/base-error-messages';
import { FormArrayInput } from '../../../utility-components/form-array-input/form-array-input';
import { TrimOnBlurDirective } from 'src/app/shared/directives';
import { ServiceLocalizationFormService } from 'src/app/shared/services/plan/materials-form-service/service-localization-form-service';
import { GroupInputWithCheckbox } from '../../../form/group-input-with-checkbox/group-input-with-checkbox';

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
  private readonly serviceLocalizationFormService = inject(ServiceLocalizationFormService);
  // Form groups from service
  formGroup = this.serviceLocalizationFormService.coverPageFormGroup;
  companyInformationFormGroup = this.serviceLocalizationFormService.companyInformationFormGroup;
  servicesFormGroup = this.serviceLocalizationFormService.servicesFormGroup;
  showCheckbox = signal(false);
  // Get services form array
  getServicesFormArray(): FormArray {
    return this.serviceLocalizationFormService.getServicesFormArray();
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
  getHasCommentControl(control: AbstractControl): FormControl<boolean> {
    const formGroup = control as FormGroup;
    const hasCommentControl = formGroup.get('hasComment');
    return hasCommentControl as unknown as FormControl<boolean>;
  }
}
