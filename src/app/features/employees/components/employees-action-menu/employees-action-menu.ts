import { ChangeDetectionStrategy, Component, computed, inject, input, output, signal } from "@angular/core";
import type { MenuItem } from "primeng/api";
import { ButtonModule } from "primeng/button";
import { MenuModule } from "primeng/menu";
import { EAdminUserActions } from "src/app/shared/enums/system-employee.enum";
import { I18nService } from "src/app/shared/services/i18n/i18n.service";
import { EmployeesActionsMapper } from "../../classes/employee-actions-mapper";


@Component({
  selector: "app-employees-action-menu",
  imports: [MenuModule, ButtonModule],
  templateUrl: "./employees-action-menu.html",
  styleUrl: "./employees-action-menu.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmployeesActionMenu {
  actions = input.required<EAdminUserActions[]>();
  disabled = input<boolean>(false);
  selectedItem = signal<string | null>(null);
  private readonly _i18n = inject(I18nService);
  employeesActionsMapper = new EmployeesActionsMapper(this._i18n);

  onChangeRole = output();
  onDelete = output();
  onEdit = output();
  onView = output();
  onDeactivate = output();

  handleEventsMapper = {
    [EAdminUserActions.CHANGE_ROLE]: this.onChangeRole,
    [EAdminUserActions.DELETE]: this.onDelete,
    [EAdminUserActions.EDIT]: this.onEdit,
    [EAdminUserActions.VIEW]: this.onView,
    [EAdminUserActions.DEACTIVATE]: this.onDeactivate
  };

  menuItems = computed<MenuItem[]>(() => {
    return this.employeesActionsMapper
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

