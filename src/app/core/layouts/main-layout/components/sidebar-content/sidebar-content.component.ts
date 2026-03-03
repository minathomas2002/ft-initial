import { ChangeDetectionStrategy, Component, computed, inject, model, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { PanelModule } from 'primeng/panel';
import { SidebarDropdownComponent } from '../sidebar-dropdown/sidebar-dropdown.component';
import { SidebarLinkComponent } from '../sidebar-link/sidebar-link.component';
import type { ISideBarLink } from './../../models/sidebar.interface';
import { ERoutes } from '../../../../../shared/enums';
import { I18nService } from '../../../../../shared/services/i18n/i18n.service';
import { PermissionService } from 'src/app/shared/services/permission/permission-service';
import { BaseLogoComponent } from 'src/app/shared/components/base-components/base-logo/base-logo.component';
import { AddContactUsDialog } from "./add-contact-us-dialog/add-contact-us-dialog";

@Component({
  selector: 'app-sidebar-content',
  imports: [SidebarLinkComponent, PanelModule, SidebarDropdownComponent, RouterModule, BaseLogoComponent, AddContactUsDialog],
  templateUrl: './sidebar-content.component.html',
  styleUrl: './sidebar-content.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarContentComponent {
  private readonly i18nService = inject(I18nService);
  private readonly permissionService = inject(PermissionService);

  canContactUs = this.permissionService.canContactUs;
  contactUsFormVisibility = signal(false);

  AddContactUsDialogVisible = signal<boolean>(false);
  sidebarDrawerVisibility = model(false);

  sidebarLinks = computed<ISideBarLink[]>((): ISideBarLink[] => {
    // Access currentLanguage to make computed reactive to language changes
    this.i18nService.currentLanguage();
    var opportunitiesLink = this.permissionService.canAccessOnOpportunityAdmin()
      ? ERoutes.opportunities + '/' + ERoutes.admin
      : ERoutes.opportunities;

    var dashboardLink = ERoutes.dashboard;

    var planLink = ERoutes.plans;

    return [
      {
        label: this.i18nService.translate('navigation.dashboard'),
        icon: 'icon-home',
        routerLink: dashboardLink,
        show: this.permissionService.canAccessDashboard()
      },
      {
        label: this.i18nService.translate('navigation.opportunities'),
        icon: 'icon-idea',
        routerLink: opportunitiesLink,
        show: true,
      },
      {
        label: this.i18nService.translate('navigation.plans'),
        icon: 'icon-file-text',
        routerLink: planLink,
        show: this.permissionService.canAccessPlan()
      },
      {
        label: this.i18nService.translate('navigation.users'),
        icon: 'icon-users',
        routerLink: ERoutes.employees,
        show: this.permissionService.canAccessUsers()
      },
      {
        label: this.i18nService.translate('navigation.investors'),
        icon: 'icon-users',
        routerLink: ERoutes.investors,
        show: this.permissionService.canAccessInvestors()
      },
      {
        label: 'My Profile',
        icon: 'icon-profile',
        routerLink: ERoutes.myProfile,
        show: true
      },
      {
        label: 'Settings',
        icon: 'icon-settings',
        routerLink: ERoutes.settings,
        show: this.permissionService.canAccessSettings()
      }
    ];
  });

  helpLink = computed<ISideBarLink>(() => {
    // Access currentLanguage to make computed reactive to language changes
    this.i18nService.currentLanguage();
    return {
      label: this.i18nService.translate('navigation.help'),
      icon: 'icon-help',
      routerLink: 'https://rmgsegypt.sharepoint.com/sites/PalantyrKB',
      external: true,
      show: true,
    };
  });

  get DashboardLink() {
    return ERoutes.dashboard;
  }

  closeSidebarDrawer() {
    this.sidebarDrawerVisibility.set(false);
  }
}
