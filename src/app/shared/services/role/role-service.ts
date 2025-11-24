import { Injectable, inject, computed } from '@angular/core';
import { AuthStore } from '../../stores/auth/auth.store';
import { ERoles } from '../../enums/roles.enum';

@Injectable({
  providedIn: 'root',
})
export class RoleService {
  private readonly authStore = inject(AuthStore);

  /**
   * Get computed signal for checking if user has any of the specified role ids
   * @param roleCodes - Array of role ids to check
   * @returns computed signal that returns true if user has at least one of the roles
   */
  hasAnyRoleSignal(roleCodes: ERoles[]) {
    return computed(() => {
      const user = this.authStore.jwtUserDetails();
      if (!user || !user.RoleCodes || user.RoleCodes.length === 0) {
        return false;
      }
      return roleCodes.some((roleCode) => user.RoleCodes.includes(roleCode));
    });
  }
}
