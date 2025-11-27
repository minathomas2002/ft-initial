import { ERoleNames } from 'src/app/shared/enums';
import { I18nService } from 'src/app/shared/services/i18n/i18n.service';

export class UserRoleMapper {
  private _roleTranslationMap: Record<string, string> = {
    [ERoleNames.Admin]: 'users.roles.admin',
    [ERoleNames.Employee]: 'users.roles.employee',
    [ERoleNames.Manager]: 'users.roles.manager',
    [ERoleNames.DepartmentManager]: 'users.roles.departmentManager',
    [ERoleNames.Investor]: 'users.roles.investor'    
  };

  constructor(private i18nService: I18nService) {}

  /**
   * Gets translated role name based on current language
   * @param role - The role string to translate (e.g., "Admin", "admin", "Employee")
   * @returns Translated role name or original role if translation not found
   */
  getTranslatedRole(role: ERoleNames): string {
    // Try to find translation key for the role
    const translationKey = this._roleTranslationMap[role];
    
    if (translationKey) {
      const translated = this.i18nService.translate(translationKey);
      // If translation exists (not the same as key), return it
      if (translated !== translationKey) {
        return translated;
      }
    }

    // Fallback to original role if no translation found
    return role;
  }
}

