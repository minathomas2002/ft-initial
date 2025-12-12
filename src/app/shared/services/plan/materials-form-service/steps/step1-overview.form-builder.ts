import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EOpportunityType, EMaterialsFormControls } from 'src/app/shared/enums';
import { phoneNumberPatternValidator } from 'src/app/shared/validators/phone-number.validator';
import { PlanStore } from 'src/app/shared/stores/plan/plan.store';

export class Step1OverviewFormBuilder {
  constructor(
    private readonly fb: FormBuilder,
    private readonly newPlanTitle: string
  ) { }

  buildBasicInformationFormGroup(): FormGroup {
    return this.fb.group({
      [EMaterialsFormControls.planTitle]: [this.newPlanTitle, [Validators.required, Validators.maxLength(150)]],
      [EMaterialsFormControls.opportunityType]: this.fb.control({ value: EOpportunityType.MATERIAL.toString(), disabled: true }, [Validators.required]),
      [EMaterialsFormControls.opportunity]: [null, [Validators.required]],
      [EMaterialsFormControls.submissionDate]: this.fb.control({ value: new Date(), disabled: true }),
    });
  }

  buildCompanyInformationFormGroup(): FormGroup {
    return this.fb.group({
      [EMaterialsFormControls.companyName]: this.fb.group({
        [EMaterialsFormControls.hasComment]: [false],
        [EMaterialsFormControls.value]: this.fb.control('', [Validators.required, Validators.maxLength(100)]),
      }),
      [EMaterialsFormControls.ceoName]: this.fb.group({
        [EMaterialsFormControls.hasComment]: [false],
        [EMaterialsFormControls.value]: this.fb.control('', [Validators.required, Validators.maxLength(100)]),
      }),
      [EMaterialsFormControls.ceoEmailID]: this.fb.group({
        [EMaterialsFormControls.hasComment]: [false],
        [EMaterialsFormControls.value]: this.fb.control('', [Validators.required, Validators.email]),
      })
    });
  }

  buildLocationInformationFormGroup(): FormGroup {
    return this.fb.group({
      [EMaterialsFormControls.globalHQLocation]: this.fb.group({
        [EMaterialsFormControls.hasComment]: [false],
        [EMaterialsFormControls.value]: this.fb.control('', [Validators.required, Validators.maxLength(250)]),
      }),
      [EMaterialsFormControls.registeredVendorIDwithSEC]: this.fb.group({
        [EMaterialsFormControls.hasComment]: [false],
        [EMaterialsFormControls.value]: this.fb.control('', [Validators.maxLength(100)]),
      }),
      [EMaterialsFormControls.doYouCurrentlyHaveLocalAgentInKSA]: this.fb.control<boolean | null>(null, [Validators.required])
    });
  }

  buildLocalAgentInformationFormGroup(): FormGroup {
    return this.fb.group({
      [EMaterialsFormControls.localAgentName]: this.fb.group({
        [EMaterialsFormControls.hasComment]: [false],
        [EMaterialsFormControls.value]: this.fb.control(''),
      }),
      [EMaterialsFormControls.contactPersonName]: this.fb.group({
        [EMaterialsFormControls.hasComment]: [false],
        [EMaterialsFormControls.value]: this.fb.control(''),
      }),
      [EMaterialsFormControls.emailID]: this.fb.group({
        [EMaterialsFormControls.hasComment]: [false],
        [EMaterialsFormControls.value]: this.fb.control(''),
      }),
      [EMaterialsFormControls.contactNumber]: this.fb.group({
        [EMaterialsFormControls.hasComment]: [false],
        [EMaterialsFormControls.value]: this.fb.control(''),
      }),
      [EMaterialsFormControls.companyHQLocation]: this.fb.group({
        [EMaterialsFormControls.hasComment]: [false],
        [EMaterialsFormControls.value]: this.fb.control(''),
      }),
    });
  }

  buildStep1FormGroup(): FormGroup {
    return this.fb.group({
      [EMaterialsFormControls.basicInformationFormGroup]: this.buildBasicInformationFormGroup(),
      [EMaterialsFormControls.companyInformationFormGroup]: this.buildCompanyInformationFormGroup(),
      [EMaterialsFormControls.locationInformationFormGroup]: this.buildLocationInformationFormGroup(),
      [EMaterialsFormControls.localAgentInformationFormGroup]: this.buildLocalAgentInformationFormGroup(),
      [EMaterialsFormControls.comment]: this.fb.control(''),
    });
  }

  toggleLocalAgentInformValidation(formGroup: FormGroup, value: boolean): void {
    const localAgentFormGroup = formGroup.get(EMaterialsFormControls.localAgentInformationFormGroup) as FormGroup;

    if (!localAgentFormGroup) {
      return;
    }

    if (value) {
      localAgentFormGroup.controls[EMaterialsFormControls.localAgentName].setValidators([Validators.required, Validators.maxLength(100)]);
      localAgentFormGroup.controls[EMaterialsFormControls.contactPersonName].setValidators([Validators.required]);
      localAgentFormGroup.controls[EMaterialsFormControls.emailID].setValidators([Validators.required, Validators.email]);
      localAgentFormGroup.controls[EMaterialsFormControls.contactNumber].setValidators([Validators.required, phoneNumberPatternValidator()]);
      localAgentFormGroup.controls[EMaterialsFormControls.companyHQLocation].setValidators([Validators.required, Validators.maxLength(200)]);
    } else {
      localAgentFormGroup.controls[EMaterialsFormControls.localAgentName].clearValidators();
      localAgentFormGroup.controls[EMaterialsFormControls.contactPersonName].clearValidators();
      localAgentFormGroup.controls[EMaterialsFormControls.emailID].clearValidators();
      localAgentFormGroup.controls[EMaterialsFormControls.contactNumber].clearValidators();
      localAgentFormGroup.controls[EMaterialsFormControls.companyHQLocation].clearValidators();
    }

    localAgentFormGroup.controls[EMaterialsFormControls.localAgentName].updateValueAndValidity();
    localAgentFormGroup.controls[EMaterialsFormControls.contactPersonName].updateValueAndValidity();
    localAgentFormGroup.controls[EMaterialsFormControls.emailID].updateValueAndValidity();
    localAgentFormGroup.controls[EMaterialsFormControls.contactNumber].updateValueAndValidity();
    localAgentFormGroup.controls[EMaterialsFormControls.companyHQLocation].updateValueAndValidity();
  }
}

