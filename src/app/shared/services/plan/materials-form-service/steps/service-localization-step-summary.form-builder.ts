import { FormBuilder, FormGroup } from '@angular/forms';

export class ServiceLocalizationStepSummaryFormBuilder {
  constructor(private readonly fb: FormBuilder) {}

  buildSummaryFormGroup(): FormGroup {
    return this.fb.group({
      // Summary form is typically read-only, just for display
      // Add any additional summary fields if needed
      comments: [''],
    });
  }

  buildStepSummaryFormGroup(): FormGroup {
    return this.fb.group({
      summary: this.buildSummaryFormGroup(),
    });
  }
}
