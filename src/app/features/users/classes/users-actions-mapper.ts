import { EAdminUserActions } from "src/app/shared/enums/users.enum";
import { IActionMenuItem, IUserRecord } from "src/app/shared/interfaces";
import { I18nService } from "src/app/shared/services/i18n/i18n.service";

type TActionDefinition = {
  labelKey: string;
  command?: IActionMenuItem<IUserRecord, EAdminUserActions>["command"];
};

export class UsersActionsMapper {
  constructor(private readonly _i18n: I18nService) {}

  private _actionDefinitions: Record<EAdminUserActions, TActionDefinition> = {
    [EAdminUserActions.CHANGE_ROLE]: {
      labelKey: "users.actions.changeRole",
    },
    [EAdminUserActions.DELETE]: {
      labelKey: "users.actions.delete",
    },
    [EAdminUserActions.EDIT]: {
      labelKey: "users.actions.edit",
    },
    [EAdminUserActions.VIEW]: {
      labelKey: "users.actions.view",
    },
    [EAdminUserActions.DEACTIVATE]: {
      labelKey: "users.actions.deactivate",
    },
  };

  getActions(
    actions: EAdminUserActions[],
  ): IActionMenuItem<IUserRecord, EAdminUserActions>[] {
    return actions.map((type: EAdminUserActions) => ({
      key: type,
      label: this._i18n.translate(this._actionDefinitions[type].labelKey),
      command: this._actionDefinitions[type].command,
    }));
  }
}

