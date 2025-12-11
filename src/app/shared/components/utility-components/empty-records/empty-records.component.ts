import { Component, inject, input } from "@angular/core";
import { I18nService } from "src/app/shared/services/i18n";

@Component({
	selector: "app-empty-records",
	standalone: true,
	templateUrl: "./empty-records.component.html",
	styleUrls: ["./empty-records.component.scss"],
})
export class EmptyRecordsComponent {
	private readonly i18nService = inject(I18nService);
  
	messageTitle = input<string>(this.i18nService.translate('common.noDataFound'));
	titleClass = input<string>();
	iconClass = input<string>();
	subTitleClass = input<string>();
	subtitle = input<string>(
		`We couldn't find any data matching your filters. Try adjusting the criteria to see results.`,
	);
	icon = input<string>("icon-search");
}
