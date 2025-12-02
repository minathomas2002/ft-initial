import { Component, computed, inject, output, signal } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
import { EAdminUserActions } from 'src/app/shared/enums';
import { ERoleManagementActions } from 'src/app/shared/enums';
import { IActionMenuItem, IRoleManagementAssignmentRecord } from 'src/app/shared/interfaces';
import { I18nService } from 'src/app/shared/services/i18n/i18n.service';

type TActionDefinition = {
  labelKey: string;
  command?: IActionMenuItem<IRoleManagementAssignmentRecord, EAdminUserActions>["command"];
};

class ERoleManagementActionsMapper {
  constructor(private readonly _i18n: I18nService) { }

  private _actionDefinitions: Record<ERoleManagementActions, TActionDefinition> = {
    [ERoleManagementActions.TRANSFER]: {
      labelKey: "users.actions.transfer",
    },
  };

  getActions(
    actions: ERoleManagementActions[],
  ): IActionMenuItem<IRoleManagementAssignmentRecord, ERoleManagementActions>[] {
    return actions.map((type: ERoleManagementActions) => ({
      key: type,
      label: this._i18n.translate(this._actionDefinitions[type].labelKey),
      command: this._actionDefinitions[type].command,
    }));
  }
}


@Component({
  selector: 'app-role-management-actions',
  imports: [MenuModule, ButtonModule],
  templateUrl: './role-management-actions.html',
  styleUrl: './role-management-actions.scss',
})
export class RoleManagementActions {

  selectedItem = signal<string | null>(null);
  private readonly _i18n = inject(I18nService);

  onTransfer = output();
  ;

  handleEventsMapper = {
    [ERoleManagementActions.TRANSFER]: this.onTransfer,
  };

  menuItems = computed(() => {
    const mapper = new ERoleManagementActionsMapper(this._i18n);
    return mapper
      .getActions([ERoleManagementActions.TRANSFER])
      .map((mItem) => {
        return {
          ...mItem,
          command: () => {
            this.handleEventsMapper[mItem.key]?.emit();
          },
        };
      });
  });
}
