import { EUserStatus } from "src/app/shared/enums/users.enum";
import type { ISelectItem, TColors } from "src/app/shared/interfaces";
import { I18nService } from "src/app/shared/services/i18n/i18n.service";

export class UserStatusMapper {
  private _statusTranslationMap: Record<EUserStatus, string> = {
    [EUserStatus.ACTIVE]: 'users.status.active',
    [EUserStatus.INACTIVE]: 'users.status.inactive',
    [EUserStatus.DELEGATED]: 'users.status.delegated'
  };

  constructor(private i18nService: I18nService) {}

  mapUserStatusColor(): {
    [key in EUserStatus]: { title: string; color: TColors };
  } {
    // Access currentLanguage to ensure reactivity to language changes
    this.i18nService.currentLanguage();
    return {
      [EUserStatus.ACTIVE]: {
        title: this.i18nService.translate(this._statusTranslationMap[EUserStatus.ACTIVE]),
        color: "green",
      },
      [EUserStatus.INACTIVE]: {
        title: this.i18nService.translate(this._statusTranslationMap[EUserStatus.INACTIVE]),
        color: "red",
      },
      [EUserStatus.DELEGATED]: {
        title: this.i18nService.translate(this._statusTranslationMap[EUserStatus.DELEGATED]),
        color: "orange",
      }
    };
  }

  getMappedStatusList(): any[] {
    return [      
      {
        label: this.i18nService.translate('users.status.all'),
        value: undefined
      },
      {
        label: this.i18nService.translate(this._statusTranslationMap[EUserStatus.ACTIVE]),
        value: true
      },
      {
        label: this.i18nService.translate(this._statusTranslationMap[EUserStatus.INACTIVE]),
        value: false
      }
    ]
  }
}
