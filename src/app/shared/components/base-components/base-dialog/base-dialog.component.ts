import { Component, input, model, output, viewChild } from "@angular/core";
import { ButtonModule } from "primeng/button";
import { type Dialog, DialogModule } from "primeng/dialog";
import { DividerModule } from "primeng/divider";
@Component({
	selector: "app-base-dialog",
	imports: [DialogModule, ButtonModule, DividerModule],
	templateUrl: "./base-dialog.component.html",
	styleUrl: "./base-dialog.component.scss",
})
export class BaseDialogComponent {
	visible = model<boolean>(false);
	onConfirm = output();
	onShow = output();
	onClose = output();
	icon = input<string>("icon-eye");
	title = input<string>("", {
		alias: "dialog-title",
	});
	confirmLabel = input<string>("Submit");
	showCloseButton = input<boolean>(true);
	showConfirmButton = input<boolean>(true);
	isLoading = input<boolean>(false);
	contentStyleClass = input<string>("");
	styleClass = input<string>("");
	dialogRef = viewChild.required<Dialog>("dialogRef");
	isConfirmationDisabled = input(false);
	confirmButtonClass = input("w-[50%]");
	cancelButtonClass = input("w-[50%]");
	appendTo = input("body");

	closeCallback(e: Event): void {
		this.dialogRef()?.close(e);
	}
}
