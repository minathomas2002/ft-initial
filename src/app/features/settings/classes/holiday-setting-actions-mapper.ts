import { date } from "@primeuix/themes/aura/datepicker";
import { EHolidaysManagementActions } from "src/app/shared/enums/holidays-management.enum";
import { IActionMenuItem } from "src/app/shared/interfaces";
import { IHolidaysManagementRecord } from "src/app/shared/interfaces/ISetting";
import { I18nService } from "src/app/shared/services/i18n";


type TActionDefinition = {
  labelKey: string;
  command?: IActionMenuItem<IHolidaysManagementRecord, EHolidaysManagementActions>["command"];
};

export class HolidaySettingActionsMapper {
  constructor(private readonly _i18n: I18nService) { }

  private _actionDefinitions: Record<EHolidaysManagementActions, TActionDefinition> = {
    
    [EHolidaysManagementActions.DELETE]: {
      labelKey: "setting.adminView.holidays.actions.delete",
    },
    [EHolidaysManagementActions.EDIT]: {
      labelKey: "setting.adminView.holidays.actions.edit",
    },
  };

  getMappedActions(item :IHolidaysManagementRecord):EHolidaysManagementActions[]{
    const actions: EHolidaysManagementActions[] = [];
    const today = new Date();
    if (new Date(item.dateTo) >= today) 
      actions.push(EHolidaysManagementActions.EDIT);
    actions.push(EHolidaysManagementActions.DELETE);
    return actions;

  }
  getActions(
    actions: EHolidaysManagementActions[],
  ): IActionMenuItem<IHolidaysManagementRecord, EHolidaysManagementActions>[] {
    return actions.map((type: EHolidaysManagementActions) => ({
      key: type,
      label: this._i18n.translate(this._actionDefinitions[type].labelKey),
      command: this._actionDefinitions[type].command,
    }));
  }
}
