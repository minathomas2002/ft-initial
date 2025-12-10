import { inject, Injectable } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { EOpportunityType } from 'src/app/shared/enums';
import { PlanStore } from 'src/app/shared/stores/plan/plan.store';
import { phoneNumberPatternValidator } from 'src/app/shared/validators/phone-number.validator';

@Injectable({
  providedIn: 'root'
})
export class MaterialsFormService {
  private readonly _fb = inject(FormBuilder);
  private readonly _planStore = inject(PlanStore);

  /* overview company information */
  basicInformationFormGroup = this._fb.group({
    planTitle: [this._planStore.newPlanTitle(), [Validators.required, Validators.maxLength(150)]],
    opportunityType: this._fb.control({ value: EOpportunityType.MATERIAL.toString(), disabled: true }, [Validators.required]),
    opportunity: [null, [Validators.required]],
    submissionDate: this._fb.control({ value: new Date(), disabled: true }),
  });

  companyInformationFormGroup = this._fb.group({
    companyName: this._fb.group({
      hasComment: [false],
      value: this._fb.control('', [Validators.required, Validators.maxLength(100)]),
    }),
    ceoName: this._fb.group({
      hasComment: [false],
      value: this._fb.control('', [Validators.required, Validators.maxLength(100)]),
    }),
    ceoEmailID: this._fb.group({
      hasComment: [false],
      value: this._fb.control('', [Validators.required, Validators.email]),
    })
  });

  locationInformationFormGroup = this._fb.group({
    globalHQLocation: this._fb.group({
      hasComment: [false],
      value: this._fb.control('', [Validators.required, Validators.maxLength(250)]),
    }),
    registeredVendorIDwithSEC: this._fb.group({
      hasComment: [false],
      value: this._fb.control('', [Validators.maxLength(100)]),
    }),
    doYouCurrentlyHaveLocalAgentInKSA: this._fb.group({
      hasComment: [false],
      value: this._fb.control(false, [Validators.required]),
    }),

  });

  localAgentInformationFormGroup = this._fb.group({
    localAgentName: this._fb.group({
      hasComment: [false],
      value: this._fb.control(''),
    }),
    contactPersonName: this._fb.group({
      hasComment: [false],
      value: this._fb.control(''),
    }),
    emailID: this._fb.group({
      hasComment: [false],
      value: this._fb.control(''),
    }),
    contactNumber: this._fb.group({
      hasComment: [false],
      value: this._fb.control(''),
    }),
    companyHQLocation: this._fb.group({
      hasComment: [false],
      value: this._fb.control(''),
    }),
  });

  toggleLocalAgentInformValidation(value: boolean): void {
    if (value) {
      this.localAgentInformationFormGroup.controls.localAgentName.setValidators([Validators.required, Validators.maxLength(100)]);
      this.localAgentInformationFormGroup.controls.contactPersonName.setValidators([Validators.required]);
      this.localAgentInformationFormGroup.controls.emailID.setValidators([Validators.required, Validators.email]);
      this.localAgentInformationFormGroup.controls.contactNumber.setValidators([Validators.required, phoneNumberPatternValidator()]);
      this.localAgentInformationFormGroup.controls.companyHQLocation.setValidators([Validators.required, Validators.maxLength(200)]);
    } else {
      this.localAgentInformationFormGroup.controls.localAgentName.clearValidators();
      this.localAgentInformationFormGroup.controls.contactPersonName.clearValidators();
      this.localAgentInformationFormGroup.controls.emailID.clearValidators();
      this.localAgentInformationFormGroup.controls.contactNumber.clearValidators();
      this.localAgentInformationFormGroup.controls.companyHQLocation.clearValidators();
    }
    this.localAgentInformationFormGroup.controls.localAgentName.updateValueAndValidity();
    this.localAgentInformationFormGroup.controls.contactPersonName.updateValueAndValidity();
    this.localAgentInformationFormGroup.controls.emailID.updateValueAndValidity();
    this.localAgentInformationFormGroup.controls.contactNumber.updateValueAndValidity();
    this.localAgentInformationFormGroup.controls.companyHQLocation.updateValueAndValidity();
  }

  overviewCompanyInformation = this._fb.group({
    basicInformationFormGroup: this.basicInformationFormGroup,
    companyInformationFormGroup: this.companyInformationFormGroup,
    locationInformationFormGroup: this.locationInformationFormGroup,
    localAgentInformationFormGroup: this.localAgentInformationFormGroup,
    comment: this._fb.control(''),
  });

  /* ------------------------------------------------ */
}
