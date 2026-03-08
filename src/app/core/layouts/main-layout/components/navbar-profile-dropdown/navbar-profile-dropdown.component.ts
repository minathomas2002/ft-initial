import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Popover, PopoverModule } from 'primeng/popover';
import { AvatarModule } from 'primeng/avatar';
import { DividerModule } from 'primeng/divider';
import { RadioButtonModule } from 'primeng/radiobutton';
import { Router } from '@angular/router';
import { ERoles, ERoutes } from '../../../../../shared/enums';
import { IdentifyUserComponent } from '../../../../../shared/components/utility-components/identify-user/identify-user.component';
import { AuthStore } from '../../../../../shared/stores/auth/auth.store';
import { I18nService } from '../../../../../shared/services/i18n/i18n.service';
import { RoleService } from 'src/app/shared/services/role/role-service';
import { ProfileStore } from 'src/app/shared/stores/profile/profile.store';
import { MenuItem } from 'primeng/api';
import { of, switchMap, take } from 'rxjs';
import { DelegationStore } from 'src/app/shared/stores/system-employees/delegation.store';
import { SystemEmployeeRoleMapper } from 'src/app/shared/classes/role.mapper';
import type { IImpersonationOptions } from 'src/app/shared/interfaces/delegation.interface';

@Component({
  selector: 'app-navbar-profile-dropdown',
  imports: [
    FormsModule,
    RouterLink,
    PopoverModule,
    IdentifyUserComponent,
    AvatarModule,
    DividerModule,
    RadioButtonModule,
  ],
  templateUrl: './navbar-profile-dropdown.component.html',
  styleUrl: './navbar-profile-dropdown.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavbarProfileDropdownComponent implements OnInit {
  authStore = inject(AuthStore);
  roleService = inject(RoleService);
  profileStore = inject(ProfileStore);
  router = inject(Router);
  i18nService = inject(I18nService);
  isOpen = signal(false);
  profilePopover = viewChild<Popover>('profilePopover');
  delegationStore = inject(DelegationStore);
  private readonly roleMapper = new SystemEmployeeRoleMapper(this.i18nService);

  ngOnInit(): void {
    this.profileStore.getUserProfile()
      .pipe(
        take(1),
        switchMap((res) => {
          if (this.roleService.hasAnyRoleSignal([ERoles.EMPLOYEE, ERoles.Division_MANAGER, ERoles.DEPARTMENT_MANAGER])()) {
            return this.delegationStore.getImpersonationOptions()
          }
          return of(res);
        })
      )
      .subscribe();
  }
  protected readonly userProfilePicture = computed(() => {
    if (!this.profileStore.userProfile()) {
      return this.authStore.userProfile()?.photoURL ?? 'assets/images/user_placeholder.svg';
    }

    return this.profileStore.userImage();
  });

  /** Current user ID for impersonation radio selection */
  selectedAccountId = computed(() => this.authStore.userProfile()?.userId ?? '');

  hasImpersonationOptions = computed(
    () => (this.delegationStore.impersonationOptions()?.length ?? 0) > 0
  );

  /** Switch accounts list: current user first (as selected), then other impersonation options */
  impersonationOptionsWithCurrentUser = computed((): IImpersonationOptions[] => {
    if (!this.hasImpersonationOptions()) return [];
    const profile = this.authStore.userProfile();
    if (!profile) return this.delegationStore.impersonationOptions();
    const currentUserId = profile.userId;
    const currentUserOption: IImpersonationOptions = {
      userId: currentUserId,
      nameEn: profile.nameEN ?? '',
      nameAr: profile.nameAR ?? '',
      profilePic: this.userProfilePicture() ?? 'assets/images/user_placeholder.svg',
      role: profile.roleCodes?.[0] ?? ERoles.EMPLOYEE,
      userName: profile.employeeID ?? profile.userId ?? '',
    };
    const others = this.delegationStore.impersonationOptions().filter((o) => o.userId !== currentUserId);
    return [currentUserOption, ...others];
  });

  dropdownItems = computed(() => {
    // Access currentLanguage to make computed reactive to language changes
    this.i18nService.currentLanguage();
    const items: MenuItem[] = [
      {
        label: this.i18nService.translate('navigation.myProfile'),
        icon: 'icon-user',
        routerLink: [ERoutes.myProfile],
      }
    ];

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

  toggleProfilePopover(event: Event) {
    const items = this.dropdownItems();
    if (!items || items.length === 0) {
      return;
    }
    this.profilePopover()?.toggle(event);
  }

  isCurrentAccount(option: IImpersonationOptions): boolean {
    return option.userId === this.selectedAccountId();
  }

  getRoleLabel(role: ERoles): string {
    return this.roleMapper.getTranslatedRole(role);
  }

  executeItemCommand(item: MenuItem) {
    if (item.command) {
      item.command({ item, originalEvent: new MouseEvent('click') });
    }
    this.profilePopover()?.hide();
  }

  onAccountSelect(option: IImpersonationOptions) {
    if (this.isCurrentAccount(option)) return;
    // TODO: Call switch/impersonation API when backend provides it.
    // For now, reload to apply impersonation if backend uses cookie/header.
    window.location.reload();
  }
}
