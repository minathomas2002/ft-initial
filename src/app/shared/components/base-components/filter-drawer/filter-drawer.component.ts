import { Component, input, model, output } from "@angular/core";
import { ButtonModule } from "primeng/button";

import type { IFilterBase } from "../../../interfaces";
import { BaseDrawerComponent } from "../base-drawer/base-drawer.component";
import { AbstractServiceFilter } from "../../../classes/abstract-service-filter";

@Component({
	selector: "app-filter-drawer",
	imports: [BaseDrawerComponent, ButtonModule],
	templateUrl: "./filter-drawer.component.html",
})
export class FilterDrawerComponent {
	drawerVisible = model<boolean>(false);
	filterService = input.required<AbstractServiceFilter<IFilterBase<unknown>>>();

	onShow = output<void>();
	onHide = output<void>();
	onApplyFilter = output<void>();

	handleShow(): void {
		this.onShow.emit();
	}

	handleHide(): void {
		this.onHide.emit();
	}

	handleApplyFilter(): void {
		this.onApplyFilter.emit();
	}
}
