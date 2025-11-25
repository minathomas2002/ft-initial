import { Injectable, signal, computed } from '@angular/core';
import { form, minLength, required, submit, validate } from '@angular/forms/signals'
import { IOpportunityInformationFrom, ISelectItem, IOpportunityLocalizationFrom, IKeyActivityRecord } from 'src/app/shared/interfaces';

export interface IBasicInformation {
  title: string;
  shortDescription: string;
  opportunityType: ISelectItem | null;
}

@Injectable({
  providedIn: 'root',
})
export class OpportunityFormService {
  private OpportunityInformationFormInitialState: IOpportunityInformationFrom = {
    id: null,
    title: '',
    opportunityType: null,
    shortDescription: '',
    opportunityCategory: '',
    spendSAR: '',
    minQuantity: '',
    maxQuantity: '',
    localSuppliers: '',
    globalSuppliers: '',
    dateRange: [],
    image: null,
  }
  private OpportunityLocalizationFormInitialState: IOpportunityLocalizationFrom = {
    designEngineerings: [
      {
        keyActivity: '',
      }
    ],
    sourcings: [
      {
        keyActivity: '',
      }
    ],
    manufacturings: [
      {
        keyActivity: '',
      }
    ],
    assemblyTestings: [
      {
        keyActivity: '',
      }
    ],
    afterSalesServices: [
      {
        keyActivity: '',
      }
    ],
  }

  private opportunityInformation = signal<IOpportunityInformationFrom>(this.OpportunityInformationFormInitialState);
  private opportunityLocalization = signal<IOpportunityLocalizationFrom>(this.OpportunityLocalizationFormInitialState);

  //Public forms that can be accessed directly
  opportunityInformationForm = form(this.opportunityInformation, (schemaPath) => {
    required(schemaPath.title, { message: 'opportunity title is required' }),
      required(schemaPath.shortDescription, { message: 'opportunity short description is required' }),
      required(schemaPath.opportunityType, { message: 'opportunity type is required' }),
      required(schemaPath.opportunityCategory, { message: 'opportunity category is required' }),
      required(schemaPath.spendSAR, { message: 'opportunity spend SAR is required' }),
      required(schemaPath.minQuantity, { message: 'opportunity min quantity is required' }),
      required(schemaPath.maxQuantity, { message: 'opportunity max quantity is required' }),
      required(schemaPath.localSuppliers, { message: 'opportunity local suppliers is required' }),
      required(schemaPath.globalSuppliers, { message: 'opportunity global suppliers is required' }),
      required(schemaPath.dateRange, { message: 'opportunity date range is required' }),
      required(schemaPath.image, { message: 'opportunity image is required' })
  });
  opportunityLocalizationForm = form(this.opportunityLocalization, schemaPath => {
    // Validate arrays have at least one item
    validate(schemaPath.designEngineerings, ({ value }) => {
      return this.validateKeyActivityArray(value()) ? null : {
        kind: 'required',
        message: 'Design engineering is required'
      };
    })
    validate(schemaPath.sourcings, ({ value }) => {
      return this.validateKeyActivityArray(value()) ? null : {
        kind: 'required',
        message: 'Sourcing is required'
      };
    })
    validate(schemaPath.manufacturings, ({ value }) => {
      return this.validateKeyActivityArray(value()) ? null : {
        kind: 'required',
        message: 'Manufacturing is required'
      };
    })
    validate(schemaPath.assemblyTestings, ({ value }) => {
      return this.validateKeyActivityArray(value()) ? null : {
        kind: 'required',
        message: 'Assembly testing is required'
      };
    })
    validate(schemaPath.afterSalesServices, ({ value }) => {
      return this.validateKeyActivityArray(value()) ? null : {
        kind: 'required',
        message: 'After sales services is required'
      };
    })
  });

  // Helper function to validate a single array
  private validateKeyActivityArray = (array: IKeyActivityRecord[]): boolean => {
    return array.every(item => item.keyActivity && item.keyActivity.trim() !== '');
  };



  isFormValid = computed(() => {
    const infoFormValid = this.opportunityInformationForm().valid();
    const localizationFormValid = this.opportunityLocalizationForm().valid();
    // Form is invalid if any array validation fails
    return infoFormValid && localizationFormValid
  });
  formValue = computed(() => {
    return {
      opportunityInformationFrom: this.opportunityInformationForm().value(),
      opportunityLocalizationForm: this.opportunityLocalizationForm().value(),
    }
  });

  resetForm() {
    this.opportunityInformationForm().reset();
    this.opportunityLocalizationForm().reset();
    this.opportunityInformation.set(this.OpportunityInformationFormInitialState);
    this.opportunityLocalization.set(this.OpportunityLocalizationFormInitialState);
  }

  // Factory method to create new key activity records
  createNewKeyActivity = () => ({ keyActivity: '' });

  markAsTouched() {
    submit(this.opportunityInformationForm, () => new Promise(() => { }))
    submit(this.opportunityLocalizationForm, () => new Promise(() => { }))
  }
}
