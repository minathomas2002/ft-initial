import {  EHolidaysType } from "src/app/shared/enums/holidays-management-type";
import { I18nService } from "src/app/shared/services/i18n";

export class HolidaysTypeMapper {
  private _typeTranslationMap: Record<EHolidaysType, string> = {
      [EHolidaysType.DAYOFF]: 'setting.adminView.holidays.table.typeMapper.dayOff',
      [EHolidaysType.OFFICIALHOLIDAY]: 'setting.adminView.holidays.table.typeMapper.officialHoliday'
    };

  constructor(private i18nService: I18nService) { }

    getMappedTypesList(): any[] {
      return [
        {
          label: this.i18nService.translate(this._typeTranslationMap[EHolidaysType.DAYOFF]),
          value: true
        },
        {
          label: this.i18nService.translate(this._typeTranslationMap[EHolidaysType.OFFICIALHOLIDAY]),
          value: false
        }
      ]
    }
}

