import { ChangeDetectionStrategy, Component, computed, inject, input, model, output, viewChild } from "@angular/core";
import { ButtonModule } from "primeng/button";
import { type Drawer, DrawerModule } from "primeng/drawer";
import { TooltipModule } from "primeng/tooltip";
import { TranslatePipe } from '../../../pipes';
import { AuthStore } from "src/app/shared/stores/auth/auth.store";
@Component({
	selector: "app-base-drawer",
	imports: [DrawerModule, ButtonModule, TooltipModule, TranslatePipe],
	templateUrl: "./base-drawer.component.html",
	styleUrl: "./base-drawer.component.scss",
	changeDetection: ChangeDetectionStrategy.OnPush,
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
	authStore = inject(AuthStore)
	onClearAll = output<void>();
	isImpersonating = computed(() => this.authStore.isImpersonating());
	dialogStyleClass = computed(() =>
		this.isImpersonating()
			? '!h-[calc(100%-45px)] !mt-[45px]'
			: ''
	);

	closeCallback(e: Event): void {
		this.drawerRef()?.close(e);
	}

	cancelClicked(e: Event): void {
		this.closeCallback(e);
		this.onCancel?.emit();
	}
}
