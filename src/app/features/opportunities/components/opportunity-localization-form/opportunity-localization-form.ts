import { Component, computed, inject, signal } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { BaseLabelComponent } from 'src/app/shared/components/base-components/base-label/base-label.component';
import { FormArrayInput } from 'src/app/shared/components/utility-components/form-array-input/form-array-input';
import { OpportunityFormService } from '../../services/opportunity-form/opportunity-form-service';
import { OpportunitiesStore } from 'src/app/shared/stores/opportunities/opportunities.store';
import { InputTextModule } from 'primeng/inputtext';
import { IKeyActivityRecord } from 'src/app/shared/interfaces';
import { ReactiveFormsModule } from '@angular/forms';
import { MessageModule } from 'primeng/message';
import { AbstractControl, FormArray, FormGroup, FormControl } from '@angular/forms';
import { TranslatePipe } from 'src/app/shared/pipes/translate.pipe';
import { SkeletonModule } from 'primeng/skeleton';
import { TrimOnBlurDirective } from 'src/app/shared/directives/trim-on-blur.directive';


@Component({
  selector: 'app-opportunity-localization-form',
  imports: [
    CardModule,
    ButtonModule,
    BaseLabelComponent,
    FormArrayInput,
    InputTextModule,
    ReactiveFormsModule,
    MessageModule,
    TranslatePipe,
    SkeletonModule,
    TrimOnBlurDirective,
  ],
  templateUrl: './opportunity-localization-form.html',
  styleUrl: './opportunity-localization-form.scss',
})
export class OpportunityLocalizationForm {
  opportunityFormService = inject(OpportunityFormService);
  opportunitiesStore = inject(OpportunitiesStore);
  opportunityLocalizationForm = this.opportunityFormService.opportunityLocalizationForm;
  isLoading = this.opportunitiesStore.loading;

  // Bound method to preserve 'this' context when passed to form-array-input
  createKeyActivityControl = () => {
    return this.opportunityFormService.createKeyActivityControl();
  };

  isRecordInvalid(itemControl: AbstractControl, formArray: FormArray): boolean {
    const itemValue = itemControl.value as IKeyActivityRecord;
    if (itemValue?.keyActivity?.trim() !== '') {
      return false;
    }
    return formArray.touched && formArray.invalid;
  }

  getFormArray(controlName: string): FormArray {
    return this.opportunityLocalizationForm.get(controlName) as FormArray;
  }

  getKeyActivityControl(itemControl: AbstractControl): FormControl | null {
    return (itemControl as FormGroup).get('keyActivity') as FormControl | null;
  }
}
