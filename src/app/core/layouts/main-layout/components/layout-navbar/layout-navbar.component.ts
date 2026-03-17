import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, model, output, signal } from '@angular/core';
import { NavbarProfileDropdownComponent } from '../navbar-profile-dropdown/navbar-profile-dropdown.component';
import { NavbarNotificationsComponent } from '../navbar-notifications/navbar-notifications.component';
import { ButtonModule } from 'primeng/button';
import { DrawerModule } from 'primeng/drawer';
import { SidebarContentComponent } from '../sidebar-content/sidebar-content.component';
import { LanguageSwitcherComponent } from '../../../../../shared/components/language-switcher';
import { I18nService } from 'src/app/shared/services/i18n/i18n.service';
import { AuthStore } from 'src/app/shared/stores/auth/auth.store';

@Component({
	selector: 'app-layout-navbar',
	imports: [
		NgClass,
		NavbarProfileDropdownComponent,
		NavbarNotificationsComponent,
		ButtonModule,
		DrawerModule,
		SidebarContentComponent,
		LanguageSwitcherComponent,
	],
	templateUrl: './layout-navbar.component.html',
	styleUrl: './layout-navbar.component.scss',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LayoutNavbarComponent {
	private readonly i18nService = inject(I18nService);
	private readonly authStore = inject(AuthStore);

	visibleSidebarDrawer = signal(false);
	isImpersonating = computed(() => this.authStore.isImpersonating());
	navbarStickyClass = computed(() =>
		this.isImpersonating() ? 'sticky top-[45px] z-50' : 'sticky top-0 z-50',
	);
	sidebarDrawerCollapsed = model(false);
	toggleDesktopSidebar = output<void>();

	isRtl = computed(() => this.i18nService.currentLanguage() === 'ar');

	drawerPosition = computed(() => (this.isRtl() ? 'right' : 'left'));

	drawerStyleClass = computed(() =>
		this.sidebarDrawerCollapsed()
			? '!w-[80px] max-w-[95%] transition-[width] duration-300 ease-in-out'
			: '!w-[311px] max-w-[95%] transition-[width] duration-300 ease-in-out',
	);

	/** LTR: expand=right, collapse=left. RTL: expand=left, collapse=right */
	sidebarToggleIcon = computed(() => {
		const collapsed = this.sidebarDrawerCollapsed();
		const rtl = this.isRtl();
		if (collapsed) return rtl ? 'icon-arrow-left' : 'icon-arrow-right';
		return rtl ? 'icon-arrow-right' : 'icon-arrow-left';
	});

	handleSidebarToggle(): void {
		if (typeof window !== 'undefined' && window.innerWidth >= 1024) {
			this.toggleDesktopSidebar.emit();
			return;
		}

		this.visibleSidebarDrawer.set(true);
	}
}
