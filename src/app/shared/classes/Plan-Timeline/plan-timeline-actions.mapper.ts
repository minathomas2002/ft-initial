import { EOpportunityType } from "../../enums";
import { EActionPlanTimeLine } from "../../enums/action-plan-timeline.enum";
import { ITimeLineResponse } from "../../interfaces/plans.interface";
import { I18nService } from "../../services/i18n";

export class PlanTimelineActionsMapper {
  private _roleTranslationMap: Partial<Record<EActionPlanTimeLine, string>> = {
    [EActionPlanTimeLine.Submitted]: 'timeline.actions.created',
    [EActionPlanTimeLine.Assigned]: 'timeline.actions.assign',
    [EActionPlanTimeLine.Reassigned]: 'timeline.actions.reassigned',
    [EActionPlanTimeLine.Approved]: 'timeline.actions.approved',
    [EActionPlanTimeLine.Rejected]: 'timeline.actions.rejected',
    [EActionPlanTimeLine.CommentSubmitted]: 'timeline.actions.submitComment',
    [EActionPlanTimeLine.AutoAssign]: 'timeline.actions.autoAssign',
    [EActionPlanTimeLine.InternalReview]: 'Submitted comment on the plan and sent back to investor',
    [EActionPlanTimeLine.AutoRejected]: 'Plan Auto Rejected',
    [EActionPlanTimeLine.Resubmitted]: 'Reassigned plan to employee',
    [EActionPlanTimeLine.DVRejected]: 'DV Rejected',
    [EActionPlanTimeLine.DVRejectionAcknowledged]: 'DV Rejection Acknowledged',
    [EActionPlanTimeLine.DeptRejected]: 'Department Rejected',
    [EActionPlanTimeLine.DVApproved]: 'DV Approved',
    [EActionPlanTimeLine.DeptApproved]: 'Department Approved',
    [EActionPlanTimeLine.EmployeeApproved]: 'Employee Approved',
    [EActionPlanTimeLine.EditPlan]: 'Edited the plan',
  };

  constructor(private i18nService: I18nService) { }

  getActionParam(item: ITimeLineResponse) {
    let param: string = '';
    switch (item.actionType) {
      case EActionPlanTimeLine.AutoAssign:
        param = item.targetUserNameEn;
        break;
      case EActionPlanTimeLine.Assigned:
        param = item.targetUserNameEn;
        break;
      case EActionPlanTimeLine.Reassigned:
        param = item.targetUserNameEn;
        break;
      case EActionPlanTimeLine.Resubmitted:
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
      return translated;
    }

    // Fallback to original role if no translation found
    return actionCode?.toString();
  }
}
