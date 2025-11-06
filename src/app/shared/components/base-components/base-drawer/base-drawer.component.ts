import { Component, input, model, output, viewChild } from "@angular/core";
import { ButtonModule } from "primeng/button";
import { type Drawer, DrawerModule } from "primeng/drawer";
import { TooltipModule } from "primeng/tooltip";
@Component({
	selector: "app-base-drawer",
	imports: [DrawerModule, ButtonModule, TooltipModule],
	templateUrl: "./base-drawer.component.html",
	styleUrl: "./base-drawer.component.scss",
})
export class BaseDrawerComponent {
	visible = model<boolean>(false);
	title = input<string>();
	icon = input<string>();
	onCancel = output();
	onShow = output();
	onHide = output();
	drawerRef = viewChild.required<Drawer>("drawerRef");
	isLoading = input<boolean>(false);
	showClearAll = input<boolean>(false);
	onClearAll = output<void>();

	closeCallback(e: Event): void {
		this.drawerRef()?.close(e);
	}

	cancelClicked(e: Event): void {
		this.closeCallback(e);
		this.onCancel?.emit();
	}
}
