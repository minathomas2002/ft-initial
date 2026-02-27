import { EDelegationStatus } from "src/app/shared/enums/delegation-enum";
import type { TColors } from "src/app/shared/interfaces";
import { I18nService } from "src/app/shared/services/i18n/i18n.service";

export class DelegationStatusMapper {
  private _statusTranslationMap: Record<EDelegationStatus, string> = {
    [EDelegationStatus.ACTIVE]: 'delegation.status.active',
    [EDelegationStatus.CANCELLED]: 'delegation.status.cancelled',
    [EDelegationStatus.EXPIRED]: 'delegation.status.expired',
    [EDelegationStatus.UPCOMING]: 'delegation.status.upcoming'
  };

  constructor(private i18nService: I18nService) { }

  mapDelegationStatusColor(): {
    [key in EDelegationStatus]: { title: string; color: TColors };
  } {
    // Access currentLanguage to ensure reactivity to language changes
    this.i18nService.currentLanguage();
    return {
      [EDelegationStatus.ACTIVE]: {
        title: this.i18nService.translate(this._statusTranslationMap[EDelegationStatus.ACTIVE]),
        color: "green",
      },
      [EDelegationStatus.CANCELLED]: {
        title: this.i18nService.translate(this._statusTranslationMap[EDelegationStatus.CANCELLED]),
        color: "red",
      },
      [EDelegationStatus.EXPIRED]: {
        title: this.i18nService.translate(this._statusTranslationMap[EDelegationStatus.EXPIRED]),
        color: "orange",
      },
      [EDelegationStatus.UPCOMING]: {
        title: this.i18nService.translate(this._statusTranslationMap[EDelegationStatus.UPCOMING]),
        color: "blue",
      }
    };
  }

  getMappedStatusList(): any[] {
    return [
      {
        label: this.i18nService.translate(this._statusTranslationMap[EDelegationStatus.ACTIVE]),
        value: 1
      },
      {
        label: this.i18nService.translate(this._statusTranslationMap[EDelegationStatus.CANCELLED]),
        value: 2
      },
      {
        label: this.i18nService.translate(this._statusTranslationMap[EDelegationStatus.EXPIRED]),
        value: 3
      },
      {
        label: this.i18nService.translate(this._statusTranslationMap[EDelegationStatus.UPCOMING]),
        value: 4
      }
    ]
  }

  getStatus(status: string): { title: string; color: TColors } {
    const statusMap = this.mapDelegationStatusColor();
    const statusKey = status.toLowerCase() as EDelegationStatus;
    return statusMap[statusKey] || {
      title: status,
      color: 'gray' as const,
    };
  }
}
