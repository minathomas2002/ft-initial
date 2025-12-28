import { FormBuilder, FormGroup, Validators } from '@angular/forms';

export class ServiceLocalizationStepDirectLocalizationFormBuilder {
  constructor(private readonly fb: FormBuilder) {}

  buildDirectLocalizationFormGroup(): FormGroup {
    return this.fb.group({
      // Add direct localization form fields here
      localizationStrategy: ['', [Validators.required]],
      implementationPlan: ['', [Validators.required, Validators.maxLength(1000)]],
    });
  }

  buildStepDirectLocalizationFormGroup(): FormGroup {
    return this.fb.group({
      directLocalization: this.buildDirectLocalizationFormGroup(),
    });
  }
}
