import { FormBuilder, FormGroup, Validators } from '@angular/forms';

export class ServiceLocalizationStepCoverPageFormBuilder {
  constructor(private readonly fb: FormBuilder) {}

  buildCompanyInformationFormGroup(): FormGroup {
    return this.fb.group({
      companyName: ['', [Validators.required, Validators.maxLength(100)]],
    });
  }

  buildServicesFormGroup(): FormGroup {
    return this.fb.group({
      services: this.fb.array(
        [this.createServiceItem()],
        [Validators.required, Validators.minLength(1)]
      ),
    });
  }

  buildCoverPageFormGroup(): FormGroup {
    return this.fb.group({
      companyInformation: this.buildCompanyInformationFormGroup(),
      services: this.buildServicesFormGroup(),
    });
  }

  createServiceItem(): FormGroup {
    return this.fb.group({
      serviceName: ['', [Validators.required, Validators.maxLength(100)]],
    });
  }
}
