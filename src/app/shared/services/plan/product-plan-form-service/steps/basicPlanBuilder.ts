import { FormBuilder, FormGroup } from "@angular/forms";
import { EMaterialsFormControls } from "src/app/shared/enums";

export class BasicPlanBuilder {
  private readonly commentsFormGroup: FormGroup;
  constructor(protected readonly fb: FormBuilder) {
    this.commentsFormGroup = this.buildStepCommentsFormGroup();
  }

  buildStepCommentsFormGroup(): FormGroup {
    return this.fb.group({
      [EMaterialsFormControls.comment]: this.fb.control(''),
      [EMaterialsFormControls.selectedInputs]: this.fb.control([]),
      [EMaterialsFormControls.commentsCount]: this.fb.control(0),
    });
  }

  inCrementCommentsCount(): void {
    const commentsCount = this.commentsFormGroup.get(EMaterialsFormControls.commentsCount);
    if (commentsCount) {
      commentsCount.setValue(commentsCount.value + 1);
    }
  }

  decrementCommentsCount(): void {
    const commentsCount = this.commentsFormGroup.get(EMaterialsFormControls.commentsCount);
    if (commentsCount) {
      commentsCount.setValue(commentsCount.value - 1);
    }
  }

  getCommentsFormGroup(): FormGroup {
    return this.commentsFormGroup;
  }

  setCommentsFormGroup(formGroup: FormGroup): void {
    this.commentsFormGroup.patchValue(formGroup.value);
  }

  resetCommentsFormGroup(): void {
    this.commentsFormGroup.reset();
  }
}