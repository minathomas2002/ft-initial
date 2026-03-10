import { ERoles } from 'src/app/shared/enums';
import { I18nService } from 'src/app/shared/services/i18n/i18n.service';

export class EmployeeRoleMapper {
  private _roleTranslationMap: Record<string, string> = {
    [ERoles.ADMIN]: 'users.roles.admin',
    [ERoles.EMPLOYEE]: 'users.roles.employee',
    [ERoles.INVESTOR]: 'users.roles.investor',
    [ERoles.Division_MANAGER]: 'users.roles.divisionManager',
    [ERoles.DEPARTMENT_MANAGER]: 'users.roles.departmentManager',
    [ERoles.AutoProcess]: 'users.roles.autoProcess',
  };

  constructor(private i18nService: I18nService) { }

  /**
   * Gets translated role name based on current language
   * @param roleCode - The role code (ERoles enum value)
   * @param fallbackRole - Optional role string to use when translation not found
   * @returns Translated role name or fallback/original role if translation not found
   */
  getTranslatedRole(roleCode: ERoles, fallbackRole?: string): string {
    const translationKey = this._roleTranslationMap[roleCode];

    if (translationKey) {
      const translated = this.i18nService.translate(translationKey);
      if (translated !== translationKey) {
        return translated;
      }
    }

    return fallbackRole ?? roleCode?.toString() ?? '';
  }
}

