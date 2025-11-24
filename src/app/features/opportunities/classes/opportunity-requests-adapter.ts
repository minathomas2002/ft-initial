import { ICreateOpportunity, IOpportunityDraftRequest } from "src/app/shared/interfaces";

export class OpportunityRequestsAdapter {
  toOpportunityDraftRequest(formValue: ICreateOpportunity): IOpportunityDraftRequest {
    return {
      ...formValue.opportunityInformationFrom,
      designEngineerings: formValue.opportunityLocalizationForm.designEngineerings.map((designEngineering, i) => ({
        keyActivity: designEngineering.keyActivity,
        orderIndex: i,
      })),
      sourcings: formValue.opportunityLocalizationForm.sourcings.map((sourcing, i) => ({
        keyActivity: sourcing.keyActivity,
        orderIndex: i,
      })),
      manufacturings: formValue.opportunityLocalizationForm.manufacturings.map((manufacturing, i) => ({
        keyActivity: manufacturing.keyActivity,
        orderIndex: i,
      })),
      assemblyTestings: formValue.opportunityLocalizationForm.assemblyTestings.map((assemblyTesting, i) => ({
        keyActivity: assemblyTesting.keyActivity,
        orderIndex: i,
      })),
      afterSalesServices: formValue.opportunityLocalizationForm.afterSalesServices.map((afterSalesService, i) => ({
        keyActivity: afterSalesService.keyActivity,
        orderIndex: i,
      })),
    }
  }
}