import { EOpportunityType } from "../../enums";
import { EActionPlanTimeLine } from "../../enums/action-plan-timeline.enum";
import { ITimeLineResponse } from "../../interfaces/plans.interface";
import { I18nService } from "../../services/i18n";

export class PlanTimelineActionsMapper {
  private _roleTranslationMap: Record<string, string> = {
    [EActionPlanTimeLine.Submitted]: 'timeline.actions.created',
    [EActionPlanTimeLine.Assigned]: 'timeline.actions.assign',
    [EActionPlanTimeLine.Reassigned]: 'timeline.actions.reassigned',
    [EActionPlanTimeLine.Approved]: 'timeline.actions.approved',
    [EActionPlanTimeLine.Rejected]: 'timeline.actions.rejected',
    [EActionPlanTimeLine.SubmittedComment]: 'timeline.actions.submitComment',
    [EActionPlanTimeLine.AutoAssigned]: 'timeline.actions.autoAssign',
  };

  constructor(private i18nService: I18nService) { }

  getActionParam(item: ITimeLineResponse) {
    let param: string = '';
    switch (item.actionType) {
      case EActionPlanTimeLine.AutoAssigned:
        param = item.targetUserNameEn;
        break;
      case EActionPlanTimeLine.Assigned:
        param = item.targetUserNameEn;
        break;
      case EActionPlanTimeLine.Reassigned:
        param = item.targetUserNameEn;
        break;
      case EActionPlanTimeLine.Submitted:
        param = (item.planType == EOpportunityType.SERVICES) ? this.i18nService.translate('opportunity.type.service') : this.i18nService.translate('opportunity.type.product');
        break;
      default:
        param = '';
        break;
    }
    return param;
  }


  getTranslatedAction(actionCode: EActionPlanTimeLine, additionalParam: any): string {
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