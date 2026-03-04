import { ChangeDetectionStrategy, Component, computed, inject, signal, viewChild } from '@angular/core';
import { Menu, MenuModule } from 'primeng/menu';
import { AvatarModule } from 'primeng/avatar';
import { Router } from '@angular/router';
import { ERoles, ERoutes } from '../../../../../shared/enums';
import { IdentifyUserComponent } from '../../../../../shared/components/utility-components/identify-user/identify-user.component';
import { AuthStore } from '../../../../../shared/stores/auth/auth.store';
import { I18nService } from '../../../../../shared/services/i18n/i18n.service';
import { RoleService } from 'src/app/shared/services/role/role-service';
import { environment } from 'src/environments/environment';
import { ProfileStore } from 'src/app/shared/stores/profile/profile.store';

@Component({
  selector: 'app-navbar-profile-dropdown',
  imports: [MenuModule, IdentifyUserComponent, AvatarModule],
  templateUrl: './navbar-profile-dropdown.component.html',
  styleUrl: './navbar-profile-dropdown.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavbarProfileDropdownComponent {
  authStore = inject(AuthStore);
  roleService = inject(RoleService);
  profileStore = inject(ProfileStore);
  router = inject(Router);
  private readonly i18nService = inject(I18nService);
  isOpen = signal(false);
  menu = viewChild<Menu>('menu');
  private readonly isProduction = signal(environment.production);
  private readonly isSecEnvironment = signal(window.location.hostname === environment.secDomain);
  private readonly isInvestor = this.roleService.hasAnyRoleSignal([ERoles.INVESTOR]);
  private readonly isInternal = !this.isInvestor();
  protected readonly userProfilePicture = computed(() => {
    if (!this.profileStore.userProfile()) {
      return this.authStore.userProfile()?.photoURL ?? 'assets/images/user_placeholder.svg';
    }

    return this.profileStore.userImage();
  });

  dropdownItems = computed(() => {
    // Access currentLanguage to make computed reactive to language changes
    this.i18nService.currentLanguage();
    const items = [];

    // const shouldHideLogout = (this.isInternal || this.isSecEnvironment()) && this.isProduction();
    // if (!shouldHideLogout) {
      items.push({
        label: this.i18nService.translate('navigation.signOut'),
        icon: 'icon-log-out',
        command: () => {
          this.authStore.logout();
          this.router.navigate(['/', ERoutes.auth, ERoutes.login])
        },
      })
    // }

    return items;
  });

  toggleMenu(event: Event) {
    const items = this.dropdownItems();
    if (!items || items.length === 0) {
      return; // Prevent opening empty menu
    }

    this.menu()?.toggle(event);
  }
}
