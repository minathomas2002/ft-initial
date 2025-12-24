import { EActionPlanTimeLine } from "../enums/action-plan-timeline.enum";
import { I18nService } from "../services/i18n";

export class ActionPlanMapper {
  private _roleTranslationMap: Record<string, string> = {
    [EActionPlanTimeLine.SUBMITED]: 'timeline.actions.created',
    [EActionPlanTimeLine.ASSIGNED]: 'timeline.actions.assign',
    [EActionPlanTimeLine.REASSIGNED]: 'timeline.actions.reassign',
    [EActionPlanTimeLine.APPROVED]: 'timeline.actions.approved',
    [EActionPlanTimeLine.REJECTED]: 'timeline.actions.rejected',
    [EActionPlanTimeLine.SUBMITECOMMENT]: 'timeline.actions.submitComment',
    [EActionPlanTimeLine.AUTOASSIGN]: 'timeline.actions.autoassign',

  };

  constructor(private i18nService: I18nService) { }


  getTranslatedAction(actionCode: EActionPlanTimeLine, additionalParam : any): string {
    // Try to find translation key for the role
    const translationKey = this._roleTranslationMap[actionCode];
    
    if (translationKey) {
      const translated = this.i18nService.translate(translationKey, { param: additionalParam });
      // If translation exists (not the same as key), return it
      if (translated !== translationKey) {
        return translated;
      }
    }

    // Fallback to original role if no translation found
    return actionCode?.toString();
  }
}