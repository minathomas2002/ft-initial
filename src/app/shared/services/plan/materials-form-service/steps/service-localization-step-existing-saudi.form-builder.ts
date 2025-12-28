import { FormBuilder, FormGroup, Validators } from '@angular/forms';

export class ServiceLocalizationStepExistingSaudiFormBuilder {
  constructor(private readonly fb: FormBuilder) {}

  buildExistingSaudiFormGroup(): FormGroup {
    return this.fb.group({
      // Add existing Saudi form fields here
      hasExistingOperations: [false, [Validators.required]],
      existingOperationsDetails: [''],
    });
  }

  buildStepExistingSaudiFormGroup(): FormGroup {
    return this.fb.group({
      existingSaudi: this.buildExistingSaudiFormGroup(),
    });
  }
}
