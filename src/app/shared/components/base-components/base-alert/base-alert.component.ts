
import { Component, computed, input, output } from "@angular/core";
import type { TColors } from "../../../interfaces";

@Component({
	selector: "app-base-alert",
	standalone: true,
	imports: [],
	templateUrl: "./base-alert.component.html",
	styleUrls: ["./base-alert.component.scss"],
})
export class BaseAlertComponent {
	title = input<string>("");
	message = input<string>("");
	color = input<TColors>("yellow");
	showClose = input<boolean>(true);
	onClose = output<void>();

	private readonly alertClassesMap: Record<TColors, string> = {
		blue: "border-blue-600 bg-blue-50",
		yellow: "border-yellow-600 bg-yellow-50",
		red: "border-red-600 bg-red-50",
		green: "border-green-600 bg-green-50",
		indigo: "border-indigo-600 bg-indigo-50",
		purple: "border-purple-600 bg-purple-50",
		pink: "border-pink-600 bg-pink-50",
		gray: "border-gray-600 bg-gray-50",
		orange: "border-orange-600 bg-orange-50",
		primary: "border-primary-600 bg-primary-50",
	};

	private readonly iconClassesMap: Record<TColors, string> = {
		blue: "bg-[#2563EB26] text-blue-600",
		yellow: "bg-[#DC680326] text-yellow-600",
		red: "bg-[#DC262626] text-red-600",
		green: "bg-[#05966926] text-green-600",
		indigo: "bg-[#4F46E526] text-indigo-600",
		purple: "bg-[#9333EA26] text-purple-600",
		pink: "bg-[#DB277726] text-pink-600",
		gray: "bg-[#4B556326] text-gray-600",
		orange: "bg-[#DC680326] text-orange-600",
		primary: "bg-[#1E469126] text-primary-600",
	};

	private readonly iconMap: Record<TColors, string> = {
		blue: "icon-info-circle",
		yellow: "icon-info-circle",
		red: "icon-error",
		green: "icon-check-circle",
		indigo: "icon-info-circle",
		purple: "icon-info-circle",
		pink: "icon-info-circle",
		gray: "icon-info-circle",
		orange: "icon-info-circle",
		primary: "icon-info-circle",
	};

	alertClasses = computed(() => {
		const baseClasses =
			"border p-4 flex items-start gap-4 rounded-xl mb-5 mx-auto animated fadeIn";
		return `${baseClasses} ${this.alertClassesMap[this.color()]}`;
	});

	iconClasses = computed(() => {
		const baseClasses =
			"w-[32px] h-[32px] rounded-full grid place-content-center";
		return `${baseClasses} ${this.iconClassesMap[this.color()]}`;
	});

	iconName = computed(() => this.iconMap[this.color()]);

	onCloseClick() {
		this.onClose.emit();
	}
}
