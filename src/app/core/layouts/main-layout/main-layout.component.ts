import { ChangeDetectionStrategy, Component } from "@angular/core";
import { LayoutContentComponent } from "./components/layout-content/layout-content.component";
import { LayoutFooterComponent } from "./components/layout-footer/layout-footer.component";
import { LayoutNavbarComponent } from "./components/layout-navbar/layout-navbar.component";
import { LayoutSidebarComponent } from "./components/layout-sidebar/layout-sidebar.component";
import { TrimOnBlurDirective } from "src/app/shared/directives/trim-on-blur.directive";

@Component({
	selector: "app-main-layout",
	imports: [
		LayoutSidebarComponent,
		LayoutNavbarComponent,
		LayoutContentComponent,
		LayoutFooterComponent,
		TrimOnBlurDirective,
	],
	templateUrl: "./main-layout.component.html",
	styleUrl: "./main-layout.component.scss",
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainLayoutComponent { }
