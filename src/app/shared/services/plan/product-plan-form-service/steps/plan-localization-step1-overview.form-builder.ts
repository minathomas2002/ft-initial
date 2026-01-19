import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EOpportunityType, EMaterialsFormControls } from 'src/app/shared/enums';
import { phoneNumberPatternValidator } from 'src/app/shared/validators/phone-number.validator';
import { BasicPlanBuilder } from './basicPlanBuilder';

export class PlanLocalizationStep1OverviewFormBuilder extends BasicPlanBuilder {
  constructor(fb: FormBuilder, private readonly newPlanTitle: string) {
    super(fb);
  }

  buildBasicInformationFormGroup(): FormGroup {
    return this.fb.group({
      [EMaterialsFormControls.planTitle]: this.fb.group({
        [EMaterialsFormControls.hasComment]: this.fb.control(false),
        [EMaterialsFormControls.value]: this.fb.control(this.newPlanTitle, [Validators.required, Validators.maxLength(150)]),
      }),
      [EMaterialsFormControls.opportunityType]: this.fb.control({ value: EOpportunityType.PRODUCT.toString(), disabled: true }, [Validators.required]),
      [EMaterialsFormControls.opportunity]: [null, [Validators.required]],
      [EMaterialsFormControls.submissionDate]: this.fb.control({ value: new Date(), disabled: true }),
    });
  }

  buildCompanyInformationFormGroup(): FormGroup {
    return this.fb.group({
      [EMaterialsFormControls.companyName]: this.fb.group({
        [EMaterialsFormControls.hasComment]: this.fb.control(false),
        [EMaterialsFormControls.value]: this.fb.control('', [Validators.required, Validators.maxLength(100)]),
      }),
      [EMaterialsFormControls.ceoName]: this.fb.group({
        [EMaterialsFormControls.hasComment]: this.fb.control(false),
        [EMaterialsFormControls.value]: this.fb.control('', [Validators.required, Validators.maxLength(100)]),
      }),
      [EMaterialsFormControls.ceoEmailID]: this.fb.group({
        [EMaterialsFormControls.hasComment]: this.fb.control(false),
        [EMaterialsFormControls.value]: this.fb.control('', [Validators.required, Validators.email]),
      })
    });
  }

  buildLocationInformationFormGroup(): FormGroup {
    return this.fb.group({
      [EMaterialsFormControls.globalHQLocation]: this.fb.group({
        [EMaterialsFormControls.hasComment]: this.fb.control(false),
        [EMaterialsFormControls.value]: this.fb.control('', [Validators.required, Validators.maxLength(255)]),
      }),
      [EMaterialsFormControls.registeredVendorIDwithSEC]: this.fb.control({ value: '', disabled: true }),
      [EMaterialsFormControls.doYouCurrentlyHaveLocalAgentInKSA]: this.fb.control(null, [Validators.required])
    });
  }

  buildLocalAgentInformationFormGroup(): FormGroup {
    return this.fb.group({
      [EMaterialsFormControls.localAgentName]: this.fb.group({
        [EMaterialsFormControls.hasComment]: this.fb.control(false),
        [EMaterialsFormControls.value]: this.fb.control(''),
      }),
      [EMaterialsFormControls.contactPersonName]: this.fb.group({
        [EMaterialsFormControls.hasComment]: this.fb.control(false),
        [EMaterialsFormControls.value]: this.fb.control(''),
      }),
      [EMaterialsFormControls.emailID]: this.fb.group({
        [EMaterialsFormControls.hasComment]: this.fb.control(false),
        [EMaterialsFormControls.value]: this.fb.control(''),
      }),
      [EMaterialsFormControls.contactNumber]: this.fb.group({
        [EMaterialsFormControls.hasComment]: this.fb.control(false),
        [EMaterialsFormControls.value]: this.fb.control(''),
      }),
      [EMaterialsFormControls.companyHQLocation]: this.fb.group({
        [EMaterialsFormControls.hasComment]: this.fb.control(false),
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
      (localAgentFormGroup.controls[EMaterialsFormControls.localAgentName] as FormGroup).controls[EMaterialsFormControls.value].addValidators([Validators.required, Validators.maxLength(100)]);
      (localAgentFormGroup.controls[EMaterialsFormControls.contactPersonName] as FormGroup).controls[EMaterialsFormControls.value].addValidators([Validators.required, Validators.maxLength(100)]);
      (localAgentFormGroup.controls[EMaterialsFormControls.emailID] as FormGroup).controls[EMaterialsFormControls.value].addValidators([Validators.required, Validators.email]);
      (localAgentFormGroup.controls[EMaterialsFormControls.contactNumber] as FormGroup).controls[EMaterialsFormControls.value].addValidators([Validators.required, phoneNumberPatternValidator(), Validators.maxLength(15)]);
      (localAgentFormGroup.controls[EMaterialsFormControls.companyHQLocation] as FormGroup).controls[EMaterialsFormControls.value].addValidators([Validators.required, Validators.maxLength(255)]);
    } else {
      (localAgentFormGroup.controls[EMaterialsFormControls.localAgentName] as FormGroup).controls[EMaterialsFormControls.value].reset();
      (localAgentFormGroup.controls[EMaterialsFormControls.contactPersonName] as FormGroup).controls[EMaterialsFormControls.value].reset();
      (localAgentFormGroup.controls[EMaterialsFormControls.emailID] as FormGroup).controls[EMaterialsFormControls.value].reset();
      (localAgentFormGroup.controls[EMaterialsFormControls.contactNumber] as FormGroup).controls[EMaterialsFormControls.value].reset();
      (localAgentFormGroup.controls[EMaterialsFormControls.companyHQLocation] as FormGroup).controls[EMaterialsFormControls.value].reset();
      (localAgentFormGroup.controls[EMaterialsFormControls.localAgentName] as FormGroup).controls[EMaterialsFormControls.value].clearValidators();
      (localAgentFormGroup.controls[EMaterialsFormControls.contactPersonName] as FormGroup).controls[EMaterialsFormControls.value].clearValidators();
      (localAgentFormGroup.controls[EMaterialsFormControls.emailID] as FormGroup).controls[EMaterialsFormControls.value].clearValidators();
      (localAgentFormGroup.controls[EMaterialsFormControls.contactNumber] as FormGroup).controls[EMaterialsFormControls.value].clearValidators();
      (localAgentFormGroup.controls[EMaterialsFormControls.companyHQLocation] as FormGroup).controls[EMaterialsFormControls.value].clearValidators();
    }

    (localAgentFormGroup.controls[EMaterialsFormControls.localAgentName] as FormGroup).controls[EMaterialsFormControls.value].updateValueAndValidity();
    (localAgentFormGroup.controls[EMaterialsFormControls.contactPersonName] as FormGroup).controls[EMaterialsFormControls.value].updateValueAndValidity();
    (localAgentFormGroup.controls[EMaterialsFormControls.emailID] as FormGroup).controls[EMaterialsFormControls.value].updateValueAndValidity();
    (localAgentFormGroup.controls[EMaterialsFormControls.contactNumber] as FormGroup).controls[EMaterialsFormControls.value].updateValueAndValidity();
    (localAgentFormGroup.controls[EMaterialsFormControls.companyHQLocation] as FormGroup).controls[EMaterialsFormControls.value].updateValueAndValidity();
  }
}

