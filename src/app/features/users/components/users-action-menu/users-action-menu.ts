import { Component, computed, input, output, signal } from "@angular/core";
import type { MenuItem } from "primeng/api";
import { ButtonModule } from "primeng/button";
import { MenuModule } from "primeng/menu";
import { EAdminUserActions } from "src/app/shared/enums/users.enum";
import { UsersActionsMapper } from "../../classes/users-actions-mapper";


@Component({
  selector: "app-users-action-menu",
  imports: [MenuModule, ButtonModule],
  templateUrl: "./users-action-menu.html",
  styleUrl: "./users-action-menu.scss",
})
export class UsersActionMenu {
  actions = input.required<EAdminUserActions[]>();
  selectedItem = signal<string | null>(null);
  usersActionsMapper = new UsersActionsMapper();

  onChangeRole = output();
  onDelete = output();

  handleEventsMapper = {
    [EAdminUserActions.ChangeRole]: this.onChangeRole,
    [EAdminUserActions.Delete]: this.onDelete,
  };

  menuItems = computed<MenuItem[]>(() => {
    return this.usersActionsMapper
      .getActions(this.actions())
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
