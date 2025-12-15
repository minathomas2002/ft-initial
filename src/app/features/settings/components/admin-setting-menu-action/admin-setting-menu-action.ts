import { Component, computed, inject, output, signal } from '@angular/core';
import { Menu } from "primeng/menu";
import { Button } from "primeng/button";
import { I18nService } from 'src/app/shared/services/i18n';
import { HolidaySettingActionsMapper } from '../../classes/holiday-setting-actions-mapper';
import { computeMsgId } from '@angular/compiler';
import { MenuItem } from 'primeng/api';
import { EHolidaysManagementActions } from 'src/app/shared/enums/holidays-management.enum';

@Component({
  selector: 'app-admin-setting-menu-action',
  imports: [Menu, Button],
  templateUrl: './admin-setting-menu-action.html',
  styleUrl: './admin-setting-menu-action.scss',
})
export class AdminSettingMenuAction {
   
    selectedItem = signal<string | null>(null);
    private readonly _i18n = inject(I18nService);
    holidaySettingActionsMapper = new HolidaySettingActionsMapper(this._i18n);

     actions = computed(() => this.holidaySettingActionsMapper.getMappedActions());
//actions = signal<EHolidaysManagementActions[]>([EHolidaysManagementActions.DELETE]);

onDelete= output();
onEdit = output();
 handleEventsMapper = {
    [EHolidaysManagementActions.DELETE]: this.onDelete,
    [EHolidaysManagementActions.EDIT]: this.onEdit,
  };

    menuItems = computed<MenuItem[]>(() => {
    return this.holidaySettingActionsMapper
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
