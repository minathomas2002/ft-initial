import { ERoles } from "../enums";
import { I18nService } from "../services/i18n";

export class SystemEmployeeRoleMapper {
  private _roleTranslationMap: Record<string, string> = {
    [ERoles.ADMIN]: 'users.roles.admin',
    [ERoles.EMPLOYEE]: 'users.roles.employee',
    [ERoles.MANAGER]: 'users.roles.manager',
    [ERoles.INVESTOR]: 'users.roles.investor',
    [ERoles.DEPARTMENT_MANAGER]: 'users.roles.departmentManager',
    [ERoles.AutoProcess]: 'users.roles.autoProcess',
  };

  constructor(private i18nService: I18nService) { }

  /**
   * Gets translated role name based on current language
   * @param role - The role string to translate (e.g., "Admin", "admin", "Employee")
   * @returns Translated role name or original role if translation not found
   */
  getTranslatedRole(roleCode: ERoles): string {
    // Try to find translation key for the role
    const translationKey = this._roleTranslationMap[roleCode];

    if (translationKey) {
      const translated = this.i18nService.translate(translationKey);
      // If translation exists (not the same as key), return it
      if (translated !== translationKey) {
        return translated;
      }
    }

    // Fallback to original role if no translation found
    return roleCode?.toString();
  }
}