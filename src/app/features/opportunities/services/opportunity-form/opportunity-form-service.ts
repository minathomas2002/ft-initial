import { Injectable, signal, computed } from '@angular/core';
import { form, maxLength, minLength, required, submit, validate } from '@angular/forms/signals'
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
    dateRange: null,
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
    required(schemaPath.title, { message: 'Opportunity title is required' }),
      maxLength(schemaPath.title, 100, { message: 'Opportunity title must be less than 100 characters' }),
      required(schemaPath.shortDescription, { message: 'Short description is required' }),
      maxLength(schemaPath.shortDescription, 250, { message: 'Short description must be less than 250 characters' }),
      required(schemaPath.opportunityType, { message: 'Opportunity type is required' }),
      required(schemaPath.opportunityCategory, { message: 'Category is required' }),
      required(schemaPath.spendSAR, { message: 'Spend SAR is required' }),
      required(schemaPath.minQuantity, { message: 'Min quantity is required' }),
      required(schemaPath.maxQuantity, { message: 'Max quantity is required' }),
      required(schemaPath.localSuppliers, { message: 'Local suppliers is required' }),
      required(schemaPath.globalSuppliers, { message: 'Global suppliers is required' }),
      required(schemaPath.dateRange, { message: 'Date range is required' }),
      required(schemaPath.image, { message: 'Image is required' }),
      validate(schemaPath.minQuantity, ({ value, valueOf }) => {
        if (valueOf(schemaPath.maxQuantity) < value()) {
          return {
            kind: 'min',
            message: 'Min quantity must be less than max quantity'
          }
        }
        return null;
      }),
      validate(schemaPath.maxQuantity, ({ value, valueOf }) => {
        if (valueOf(schemaPath.minQuantity) > value()) {
          return {
            kind: 'max',
            message: 'max quantity must be greater than min quantity'
          }
        }
        return null;
      }),
      validate(schemaPath.dateRange, ({ value }) => {
        console.log(value());

        if (value() && !value()![1]) {
          return {
            kind: 'minLength',
            message: 'You should select a date range'
          }
        }
        return null;
      })
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

  updateImageField(image: File | null) {
    const currentValue = this.opportunityInformation();
    this.opportunityInformation.set({
      ...currentValue,
      image: image
    });
  }
}
