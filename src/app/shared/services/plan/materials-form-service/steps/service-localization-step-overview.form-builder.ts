import { FormBuilder, FormGroup, Validators } from '@angular/forms';

export class ServiceLocalizationStepOverviewFormBuilder {
  constructor(private readonly fb: FormBuilder) {}

  buildOverviewFormGroup(): FormGroup {
    return this.fb.group({
      // Add overview form fields here
      description: ['', [Validators.required, Validators.maxLength(500)]],
    });
  }

  buildStepOverviewFormGroup(): FormGroup {
    return this.fb.group({
      overview: this.buildOverviewFormGroup(),
    });
  }
}
