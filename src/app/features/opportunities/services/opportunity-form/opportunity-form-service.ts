import { OpportunityInformationForm } from './../../components/opportunity-information-form/opportunity-information-form';
import { ISelectItem } from '../../../../shared/interfaces/select-item.interface';
import { Injectable, signal, } from '@angular/core';
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
    opportunityTitle: '',
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
  OpportunityLocalizationFormInitialState: IOpportunityLocalizationFrom = {
    designEngineerings: [],
    sourcings: [],
    manufacturings: [],
    assemblyTestings: [],
    afterSalesServices: [],
  }

  opportunityInformation = signal<IOpportunityInformationFrom>(this.OpportunityInformationFormInitialState);
  opportunityLocalization = signal<IOpportunityLocalizationFrom>(this.OpportunityLocalizationFormInitialState);

  opportunityInformationForm = form(this.opportunityInformation, (schemaPath) => {
    required(schemaPath.opportunityTitle, { message: 'opportunity title is required' }),
      minLength(schemaPath.opportunityTitle, 3, { message: 'opportunity title must be at least 3 characters long' }),
      min(schemaPath.opportunityTitle, 10, { message: 'opportunity title must be at least 10 characters long' })
  });
  opportunityLocalizationForm = form(this.opportunityLocalization);

  opportunitySignal = signal<ICreateOpportunity>({
    opportunityInformationFrom: this.opportunityInformation(),
    opportunityLocalizationForm: this.opportunityLocalization(),
  });

  opportunityForm = form(this.opportunitySignal);
}
