import { Component, computed, inject, signal } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { BaseLabelComponent } from 'src/app/shared/components/base-components/base-label/base-label.component';
import { FormArrayInput } from 'src/app/shared/components/utility-components/form-array-input/form-array-input';
import { OpportunityFormService } from '../../services/opportunity-form/opportunity-form-service';
import { InputTextModule } from 'primeng/inputtext';
import { IKeyActivityRecord } from 'src/app/shared/interfaces';
import { Field, FieldTree } from '@angular/forms/signals';


interface IAfterSales {
  expenseHeader: string;
  inHousehold: number;
  cost: number;
  currency: string;
  costType: string;
  costCategory: string;
  costSubCategory: string;
  costSubSubCategory: string;
  costSubSubSubCategory: string;
  costSubSubSubSubCategory: string;
  costSubSubSubSubSubCategory: string;
}

@Component({
  selector: 'app-opportunity-localization-form',
  imports: [
    CardModule,
    ButtonModule,
    BaseLabelComponent,
    FormArrayInput,
    InputTextModule,
    Field
  ],
  templateUrl: './opportunity-localization-form.html',
  styleUrl: './opportunity-localization-form.scss',
})
export class OpportunityLocalizationForm {
  opportunityFormService = inject(OpportunityFormService);
  opportunityLocalizationForm = this.opportunityFormService.opportunityLocalizationForm
}
