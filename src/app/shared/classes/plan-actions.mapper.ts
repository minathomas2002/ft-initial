import { I18nService } from 'src/app/shared/services/i18n/i18n.service';
import { EActionPlanTimeLine } from 'src/app/shared/enums/action-plan-timeline.enum';
import { IActionMenuItem, IPlanRecord } from 'src/app/shared/interfaces';

type TActionDefinition = {
    labelKey: string;
    command?: IActionMenuItem<IPlanRecord, EActionPlanTimeLine>["command"];
};

export class PlanActionsMapper {
    constructor(private readonly i18n: I18nService) { }

    private _actionDefinitions: Record<EActionPlanTimeLine, TActionDefinition> = {
        [EActionPlanTimeLine.EditPlan]: { labelKey: 'plans.actions.edit' },
        [EActionPlanTimeLine.ViewDetails]: { labelKey: 'plans.actions.viewDetails' },
        [EActionPlanTimeLine.DownloadPDF]: { labelKey: 'plans.actions.download' },
        [EActionPlanTimeLine.Submitted]: { labelKey: 'plans.actions.submitted' },
        [EActionPlanTimeLine.Assigned]: { labelKey: 'plans.actions.assignToEmployee' },
        [EActionPlanTimeLine.Reassigned]: { labelKey: 'plans.actions.reAssign' },
        [EActionPlanTimeLine.CommentSubmitted]: { labelKey: 'plans.actions.commentSubmitted' },
        [EActionPlanTimeLine.Resubmitted]: { labelKey: 'Edit / Resubmit' },
        [EActionPlanTimeLine.Approved]: { labelKey: 'plans.actions.approved' },
        [EActionPlanTimeLine.Rejected]: { labelKey: 'plans.actions.rejected' },
        [EActionPlanTimeLine.EmployeeApproved]: { labelKey: 'plans.actions.approved' },
        [EActionPlanTimeLine.DVApproved]: { labelKey: 'plans.actions.approved' },
        [EActionPlanTimeLine.DeptApproved]: { labelKey: 'plans.actions.approved' },
        [EActionPlanTimeLine.DVRejected]: { labelKey: 'plans.actions.rejected' },
        [EActionPlanTimeLine.DeptRejected]: { labelKey: 'plans.actions.rejected' },
        [EActionPlanTimeLine.DVRejectionAcknowledged]: { labelKey: 'plans.actions.dvRejectionAcknowledged' },
        [EActionPlanTimeLine.ReturnedForMoreInfo]: { labelKey: 'plans.actions.returnedForMoreInfo' },
        [EActionPlanTimeLine.ViewTimeLine]: { labelKey: 'plans.actions.viewTimeline' },
        [EActionPlanTimeLine.AutoAssign]: { labelKey: 'plans.actions.autoAssign' },
        [EActionPlanTimeLine.InternalReview]: { labelKey: 'plans.actions.internalReview' },
        [EActionPlanTimeLine.RemoveAssignee]: { labelKey: 'plans.actions.removeAssignee' },
        [EActionPlanTimeLine.Delete]: { labelKey: 'plans.actions.delete' },
        [EActionPlanTimeLine.AutoRejected]: { labelKey: 'Plan Auto Rejected' },
    };

    getActions(
        actions: EActionPlanTimeLine[],
    ): IActionMenuItem<IPlanRecord, EActionPlanTimeLine>[] {
        return actions.map((type: EActionPlanTimeLine) => ({
            key: type,
            label: this.i18n.translate(this._actionDefinitions[type].labelKey),
            command: this._actionDefinitions[type].command,
        }));
    }
}
