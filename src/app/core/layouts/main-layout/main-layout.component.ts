import { ChangeDetectionStrategy, Component, HostListener, signal } from "@angular/core";
import { LayoutContentComponent } from "./components/layout-content/layout-content.component";
import { LayoutFooterComponent } from "./components/layout-footer/layout-footer.component";
import { LayoutNavbarComponent } from "./components/layout-navbar/layout-navbar.component";
import { LayoutSidebarComponent } from "./components/layout-sidebar/layout-sidebar.component";

@Component({
	selector: "app-main-layout",
	imports: [
		LayoutSidebarComponent,
		LayoutNavbarComponent,
		LayoutContentComponent,
		LayoutFooterComponent,
	],
	templateUrl: "./main-layout.component.html",
	styleUrl: "./main-layout.component.scss",
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainLayoutComponent {
	private static readonly DESKTOP_BREAKPOINT = 1024;
  private static readonly SIDEBAR_STATE_STORAGE_KEY = "main-layout-sidebar-expanded";

	isSidebarExpanded = signal(this.getInitialSidebarState());

	@HostListener("window:resize")
	onWindowResize(): void {
		if (!this.isDesktopScreen()) {
			this.isSidebarExpanded.set(false);
			return;
		}

		this.isSidebarExpanded.set(this.getStoredSidebarState() ?? true);
	}

	toggleSidebar(): void {
		this.isSidebarExpanded.update((expanded) => !expanded);
		this.persistSidebarState();
	}

	private getInitialSidebarState(): boolean {
		if (!this.isDesktopScreen()) {
			return false;
		}

		return this.getStoredSidebarState() ?? true;
	}

	private getStoredSidebarState(): boolean | null {
		if (typeof window === "undefined") {
			return null;
		}

		const storedValue = window.localStorage.getItem(MainLayoutComponent.SIDEBAR_STATE_STORAGE_KEY);
		if (storedValue === null) {
			return null;
		}

		return storedValue === "true";
	}

	private persistSidebarState(): void {
		if (typeof window === "undefined") {
			return;
		}

		window.localStorage.setItem(
			MainLayoutComponent.SIDEBAR_STATE_STORAGE_KEY,
			String(this.isSidebarExpanded()),
		);
	}

	private isDesktopScreen(): boolean {
		return typeof window !== "undefined" && window.innerWidth >= MainLayoutComponent.DESKTOP_BREAKPOINT;
	}
}
