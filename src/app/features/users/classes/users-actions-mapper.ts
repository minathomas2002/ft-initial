import { EAdminUserActions } from "src/app/shared/enums/users.enum";
import { IActionMenuItem, IUserRecord } from "src/app/shared/interfaces";

export class UsersActionsMapper {
  private _actionDefinitions: Record<
    EAdminUserActions,
    Omit<IActionMenuItem<IUserRecord, EAdminUserActions>, "type">
  > = {
      [EAdminUserActions.ChangeRole]: {
        label: "Change Role",
        key: EAdminUserActions.ChangeRole,
      },
      [EAdminUserActions.Delete]: {
        label: "Delete",
        key: EAdminUserActions.Delete,
      },

    };

  getActions(
    actions: EAdminUserActions[],
  ): IActionMenuItem<IUserRecord, EAdminUserActions>[] {
    return actions.map((type: EAdminUserActions) => ({
      key: type,
      label: this._actionDefinitions[type].label,
      command: (event) => this._actionDefinitions[type].command?.(event),
    }));
  }
}
