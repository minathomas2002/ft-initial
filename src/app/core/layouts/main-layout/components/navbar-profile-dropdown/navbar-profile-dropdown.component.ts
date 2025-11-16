import { Component, inject, signal } from '@angular/core';
import { MenuModule } from 'primeng/menu';
import { AvatarModule } from 'primeng/avatar';
import { Router } from '@angular/router';
import { ERoutes } from '../../../../../shared/enums';
import { IdentifyUserComponent } from '../../../../../shared/components/utility-components/identify-user/identify-user.component';
import { AuthStore } from '../../../../../shared/stores/auth/auth.store';

@Component({
  selector: 'app-navbar-profile-dropdown',
  imports: [MenuModule, IdentifyUserComponent, AvatarModule],
  templateUrl: './navbar-profile-dropdown.component.html',
  styleUrl: './navbar-profile-dropdown.component.scss',
})
export class NavbarProfileDropdownComponent {
  authStore = inject(AuthStore);
  router = inject(Router);
  isOpen = signal(false);
  dropdownItems = signal([
    {
      label: 'View profile',
      icon: 'icon-user',
      command: () => this.router.navigate(['/', ERoutes.profile]),
    },
    {
      label: 'Sign out',
      icon: 'icon-log-out',
      command: () => {
        this.authStore.logout();
        this.router.navigate(['/', ERoutes.login])
      },
    },
  ]);
}
