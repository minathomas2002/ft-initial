import { EPlanPageTitle } from '../../enums/plan.enum';
import { I18nService } from '../../services/i18n/i18n.service';

/**
 * Maps EPlanPageTitle enum values (used for API/backend) to translation keys for display.
 * Enum values must remain unchanged for API compatibility (pageTitleForTL).
 */
const PLAN_PAGE_TITLE_TO_KEY: Record<string, string> = {
  [EPlanPageTitle.OverviewAndCompanyInformation]: 'plans.wizard.step1.title',
  [EPlanPageTitle.ProductAndPlantOverview]: 'plans.wizard.step2.title',
  [EPlanPageTitle.ValueChain]: 'plans.wizard.step3.title',
  [EPlanPageTitle.Saudization]: 'plans.wizard.step4.title',
  [EPlanPageTitle.CoverPage]: 'plans.wizard.coverPage',
  [EPlanPageTitle.Overview]: 'plans.wizard.stepTitles.overview',
  [EPlanPageTitle.ExistingSaudi]: 'plans.wizard.stepTitles.existingSaudi',
  [EPlanPageTitle.DirectLocalization]: 'plans.wizard.stepTitles.directLocalization',
  [EPlanPageTitle.Summary]: 'plans.wizard.step5.title',
  [EPlanPageTitle.OpportunityInformation]: 'opportunity.wizard.opportunityInformation',
  [EPlanPageTitle.OpportunityLocalization]: 'opportunity.wizard.opportunityLocalization',
};

export class PlanPageTitleMapper {
  constructor(private readonly i18nService: I18nService) {}

  /**
   * Returns the translated display string for a plan page title.
   * Falls back to the raw value if no translation key is found (e.g. custom/unknown from API).
   */
  getTranslatedTitle(pageTitle: string): string {
    const key = PLAN_PAGE_TITLE_TO_KEY[pageTitle];
    if (key) {
      return this.i18nService.translate(key);
    }
    return pageTitle;
  }
}
