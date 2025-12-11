import { Component, signal } from '@angular/core';
import { NavbarProfileDropdownComponent } from '../navbar-profile-dropdown/navbar-profile-dropdown.component';
import { NavbarNotificationsComponent } from '../navbar-notifications/navbar-notifications.component';
import { ButtonModule } from 'primeng/button';
import { DrawerModule } from 'primeng/drawer';
import { SidebarContentComponent } from '../sidebar-content/sidebar-content.component';
import { LanguageSwitcherComponent } from '../../../../../shared/components/language-switcher';

@Component({
	selector: 'app-layout-navbar',
	imports: [
		NavbarProfileDropdownComponent,
		//NavbarNotificationsComponent,
		ButtonModule,
		DrawerModule,
		SidebarContentComponent,
		//LanguageSwitcherComponent,
	],
	templateUrl: './layout-navbar.component.html',
	styleUrl: './layout-navbar.component.scss',
})
export class LayoutNavbarComponent {
	visibleSidebarDrawer = signal(false);
}
