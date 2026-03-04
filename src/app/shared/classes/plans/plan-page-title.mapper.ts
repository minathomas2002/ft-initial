import { I18nService } from '../../services/i18n/i18n.service';

/**
 * Legacy mapping for API/backend that may still send old display strings.
 * New enum values are localization keys; this map supports backward compatibility.
 */
const LEGACY_PAGE_TITLE_TO_KEY: Record<string, string> = {
  'Overview & Company Information': 'plans.wizard.step1.title',
  'Product & Plant Overview': 'plans.wizard.step2.title',
  'Value Chain': 'plans.wizard.step3.title',
  Saudization: 'plans.wizard.step4.title',
  'Cover Page': 'plans.wizard.coverPage',
  Overview: 'plans.wizard.stepTitles.overview',
  'Existing Saudi Co.': 'plans.wizard.stepTitles.existingSaudi',
  'Direct Localization': 'plans.wizard.stepTitles.directLocalization',
  Summary: 'plans.wizard.step5.title',
  'Opportunity Information': 'opportunity.wizard.opportunityInformation',
  'Opportunity Localization': 'opportunity.wizard.opportunityLocalization',
};

export class PlanPageTitleMapper {
  constructor(private readonly i18nService: I18nService) {}

  /**
   * Returns the translated display string for a plan page title.
   * Accepts either localization keys (new) or legacy display strings (API backward compatibility).
   */
  getTranslatedTitle(pageTitle: string): string {
    const key = LEGACY_PAGE_TITLE_TO_KEY[pageTitle] ?? pageTitle;
    const translated = this.i18nService.translate(key);
    return translated !== key ? translated : pageTitle;
  }
}
