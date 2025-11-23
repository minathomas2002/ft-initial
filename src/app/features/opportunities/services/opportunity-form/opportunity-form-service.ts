import { OpportunityInformationForm } from './../../components/opportunity-information-form/opportunity-information-form';
import { ISelectItem } from '../../../../shared/interfaces/select-item.interface';
import { Injectable, signal, computed } from '@angular/core';
import { disabled, form, min, minLength, required } from '@angular/forms/signals'
import { ICreateOpportunity, IOpportunityInformationFrom, IOpportunityLocalizationFrom } from 'src/app/shared/interfaces';

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
    designEngineerings: [],
    sourcings: [],
    manufacturings: [],
    assemblyTestings: [],
    afterSalesServices: [],
  }

  private opportunityInformation = signal<IOpportunityInformationFrom>(this.OpportunityInformationFormInitialState);
  private opportunityLocalization = signal<IOpportunityLocalizationFrom>(this.OpportunityLocalizationFormInitialState);

  //Public forms that can be accessed directly
  opportunityInformationForm = form(this.opportunityInformation, (schemaPath) => {
    required(schemaPath.title, { message: 'opportunity title is required' }),
      minLength(schemaPath.title, 3, { message: 'opportunity title must be at least 3 characters long' }),
      min(schemaPath.title, 10, { message: 'opportunity title must be at least 10 characters long' })
  });
  opportunityLocalizationForm = form(this.opportunityLocalization);


  isFormValid = computed(() => this.opportunityInformationForm().valid() && this.opportunityLocalizationForm().valid());
  formValue = computed(() => {
    return {
      ...this.opportunityInformationForm().value(),
      ...this.opportunityLocalizationForm().value(),
    }
  });

  resetForm() {
    this.opportunityInformationForm().reset();
    this.opportunityLocalizationForm().reset();
    this.opportunityInformation.set(this.OpportunityInformationFormInitialState);
    this.opportunityLocalization.set(this.OpportunityLocalizationFormInitialState);
  }
}
