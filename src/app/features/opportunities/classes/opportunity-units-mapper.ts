import { EOpportunityQuantity } from "src/app/shared/enums";
import { I18nService } from "src/app/shared/services/i18n";

export class opportunityUnitsMapper {
  constructor(private i18nService: I18nService) {
  }


  getUnitLabel(status: EOpportunityQuantity): string {
    const statusMap: Record<EOpportunityQuantity, string> = {
      [EOpportunityQuantity.KM]: this.i18nService.translate('opportunity.units.km'),
      [EOpportunityQuantity.Panels]: this.i18nService.translate('opportunity.units.panels'),
      [EOpportunityQuantity.CB]: this.i18nService.translate('opportunity.units.cb'),
      [EOpportunityQuantity.Discs]: this.i18nService.translate('opportunity.units.discs'),
      [EOpportunityQuantity.KTons]: this.i18nService.translate('opportunity.units.ktons'),
      [EOpportunityQuantity.Unit]: this.i18nService.translate('opportunity.units.unit'),
    };
    return statusMap[status] || '';
  }
}