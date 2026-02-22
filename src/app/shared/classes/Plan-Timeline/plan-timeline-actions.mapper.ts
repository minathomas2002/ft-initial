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
    [EActionPlanTimeLine.InternalReview]: 'timeline.actions.internalReview',
    [EActionPlanTimeLine.AutoRejected]: 'timeline.actions.autoRejected',
    [EActionPlanTimeLine.Resubmitted]: 'timeline.actions.resubmitted',
    [EActionPlanTimeLine.DVRejected]: 'timeline.actions.dVRejected',
    [EActionPlanTimeLine.DVRejectionAcknowledged]: 'timeline.actions.dVRejectionAcknowledged',
    [EActionPlanTimeLine.DeptRejected]: 'timeline.actions.deptRejected',
    [EActionPlanTimeLine.DVApproved]: 'timeline.actions.dvApproved',
    [EActionPlanTimeLine.DeptApproved]: 'timeline.actions.deptApproved',
    [EActionPlanTimeLine.EmployeeApproved]: 'timeline.actions.employeeApproved',
    [EActionPlanTimeLine.EditPlan]: 'timeline.actions.editPlan',
    [EActionPlanTimeLine.DVReview]: 'timeline.actions.dVReview',
    [EActionPlanTimeLine.DeptManagerReview]: 'timeline.actions.deptManagerReview',
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
      case EActionPlanTimeLine.DVRejected:
        param = item.targetUserNameEn;
        break;
      case EActionPlanTimeLine.Submitted:
        param = (item.planType == EOpportunityType.SERVICES) ? this.i18nService.translate('opportunity.type.service') : this.i18nService.translate('opportunity.type.product');
        break;
      case EActionPlanTimeLine.DeptRejected:
          param = item.targetUserNameEn;
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
