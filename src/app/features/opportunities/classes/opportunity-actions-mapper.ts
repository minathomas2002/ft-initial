import { IActionMenuItem, IAdminOpportunity } from 'src/app/shared/interfaces';
import { EOpportunityAction } from '../../../shared/enums/opportunities.enum';
import type { MenuItem } from 'primeng/api';

export interface IOpportunityActionMenuItem extends MenuItem {
  key: EOpportunityAction;
}

export class OpportunityActionsMapper {
  private _actionDefinitions: Record<
    EOpportunityAction,
    Omit<IActionMenuItem<IAdminOpportunity, EOpportunityAction>, "type">
  > = {
      [EOpportunityAction.Edit]: {
        label: 'opportunity.action.edit',
        key: EOpportunityAction.Edit,
      },
      [EOpportunityAction.Delete]: {
        label: 'opportunity.action.delete',
        key: EOpportunityAction.Delete,
      },
      [EOpportunityAction.MoveToDraft]: {
        label: 'opportunity.action.moveToDraft',
        key: EOpportunityAction.MoveToDraft,
      },
      [EOpportunityAction.Publish]: {
        label: 'opportunity.action.publish',
        key: EOpportunityAction.Publish,
      },
      [EOpportunityAction.Apply]: {
        label: 'opportunity.action.apply',
        key: EOpportunityAction.Apply,
      },
      [EOpportunityAction.SystemReminder]: {
        label: 'opportunity.action.systemReminder',
        key: EOpportunityAction.SystemReminder,
      },
    };

  getActions(
    actions: EOpportunityAction[],
  ): IActionMenuItem<IAdminOpportunity, EOpportunityAction>[] {
    return actions.map((type: EOpportunityAction) => ({
      key: type,
      label: this._actionDefinitions[type].label,
      command: (event) => this._actionDefinitions[type].command?.(event),
    }));
  }
}

