import { Component, computed, inject, signal } from '@angular/core';
import { MenuModule } from 'primeng/menu';
import { AvatarModule } from 'primeng/avatar';
import { Router } from '@angular/router';
import { ERoutes } from '../../../../../shared/enums';
import { IdentifyUserComponent } from '../../../../../shared/components/utility-components/identify-user/identify-user.component';
import { AuthStore } from '../../../../../shared/stores/auth/auth.store';
import { I18nService } from '../../../../../shared/services/i18n/i18n.service';

@Component({
  selector: 'app-navbar-profile-dropdown',
  imports: [MenuModule, IdentifyUserComponent, AvatarModule],
  templateUrl: './navbar-profile-dropdown.component.html',
  styleUrl: './navbar-profile-dropdown.component.scss',
})
export class NavbarProfileDropdownComponent {
  authStore = inject(AuthStore);
  router = inject(Router);
  private readonly i18nService = inject(I18nService);
  isOpen = signal(false);
  dropdownItems = computed(() => {
    // Access currentLanguage to make computed reactive to language changes
    this.i18nService.currentLanguage();
    return [
      {
        label: this.i18nService.translate('navigation.viewProfile'),
        icon: 'icon-user',
        command: () => this.router.navigate(['/', ERoutes.profile]),
      },
      {
        label: this.i18nService.translate('navigation.signOut'),
        icon: 'icon-log-out',
        command: () => {
          this.authStore.logout();
          this.router.navigate(['/', ERoutes.auth, ERoutes.login])
        },
      },
    ];
  });
}
