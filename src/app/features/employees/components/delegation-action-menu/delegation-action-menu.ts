import { ChangeDetectionStrategy, Component, computed, inject, input, output, signal } from "@angular/core";
import type { MenuItem } from "primeng/api";
import { ButtonModule } from "primeng/button";
import { MenuModule } from "primeng/menu";
import { EAdminUserActions } from "src/app/shared/enums/system-employee.enum";
import { I18nService } from "src/app/shared/services/i18n/i18n.service";
import { EmployeesActionsMapper } from "../../classes/employee-actions-mapper";
import { EDelegationActions } from "src/app/shared/enums/delegation-enum";
import { DelegationsActionsMapper } from "../../classes/delegation-actions-mapper";

@Component({
  selector: 'app-delegation-action-menu',
  imports: [ButtonModule, MenuModule],
  templateUrl: './delegation-action-menu.html',
  styleUrl: './delegation-action-menu.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DelegationActionMenu {
  actions = input.required<EDelegationActions[]>();
  disabled = input<boolean>(false);
  selectedItem = signal<string | null>(null);
  private readonly _i18n = inject(I18nService);
  employeesActionsMapper = new DelegationsActionsMapper(this._i18n);

  onChangeRole = output();
  onDelete = output();
  onEdit = output();
  onView = output();
  onDeactivate = output();

  handleEventsMapper = {
    [EDelegationActions.EDIT]: this.onEdit,
    [EDelegationActions.DELETE]: this.onDelete,
    [EDelegationActions.CANCEL]: this.onChangeRole,
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


