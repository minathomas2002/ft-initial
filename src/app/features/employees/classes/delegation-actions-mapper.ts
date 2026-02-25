import { EDelegationActions } from "src/app/shared/enums/delegation-enum";
import { EAdminUserActions } from "src/app/shared/enums/system-employee.enum";
import { IActionMenuItem, ISystemEmployeeRecord } from "src/app/shared/interfaces";
import { I18nService } from "src/app/shared/services/i18n/i18n.service";

type TActionDefinition = {
  labelKey: string;
  command?: IActionMenuItem<ISystemEmployeeRecord, EAdminUserActions>["command"];
};

export class DelegationsActionsMapper {
  constructor(private readonly _i18n: I18nService) { }

  private _actionDefinitions: Record<EDelegationActions, TActionDefinition> = {

    [EDelegationActions.DELETE]: {
      labelKey: "delegations.actions.delete",
    },
    [EDelegationActions.EDIT]: {
      labelKey: "delegations.actions.edit",
    },
    [EDelegationActions.CANCEL]: {
      labelKey: "delegations.actions.cancel",
    }
  };

  getActions(
    actions: EDelegationActions[],
  ): IActionMenuItem<ISystemEmployeeRecord, EDelegationActions>[] {
    return actions.map((type: EDelegationActions) => ({
      key: type,
      label: this._i18n.translate(this._actionDefinitions[type].labelKey),
      command: this._actionDefinitions[type].command,
    }));
  }
}

