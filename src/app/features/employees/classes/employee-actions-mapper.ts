import { EAdminUserActions } from "src/app/shared/enums/system-employee.enum";
import { IActionMenuItem, ISystemEmployeeRecord } from "src/app/shared/interfaces";
import { I18nService } from "src/app/shared/services/i18n/i18n.service";

type TActionDefinition = {
  labelKey: string;
  command?: IActionMenuItem<ISystemEmployeeRecord, EAdminUserActions>["command"];
};

export class EmployeesActionsMapper {
  constructor(private readonly _i18n: I18nService) { }

  private _actionDefinitions: Record<EAdminUserActions, TActionDefinition> = {
    [EAdminUserActions.CHANGE_ROLE]: {
      labelKey: "employees.actions.changeRole",
    },
    [EAdminUserActions.DELETE]: {
      labelKey: "employees.actions.delete",
    },
    [EAdminUserActions.EDIT]: {
      labelKey: "employees.actions.edit",
    },
    [EAdminUserActions.VIEW]: {
      labelKey: "employees.actions.view",
    },
    [EAdminUserActions.DEACTIVATE]: {
      labelKey: "employees.actions.deactivate",
    },
  };

  getActions(
    actions: EAdminUserActions[],
  ): IActionMenuItem<ISystemEmployeeRecord, EAdminUserActions>[] {
    return actions.map((type: EAdminUserActions) => ({
      key: type,
      label: this._i18n.translate(this._actionDefinitions[type].labelKey),
      command: this._actionDefinitions[type].command,
    }));
  }
}

