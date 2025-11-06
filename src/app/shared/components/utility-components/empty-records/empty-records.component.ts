import { Component, input } from "@angular/core";

@Component({
	selector: "app-empty-records",
	standalone: true,
	templateUrl: "./empty-records.component.html",
	styleUrls: ["./empty-records.component.scss"],
})
export class EmptyRecordsComponent {
	messageTitle = input<string>("No Data found");
	titleClass = input<string>();
	iconClass = input<string>();
	subTitleClass = input<string>();
	subtitle = input<string>(
		`We couldn't find any data matching your filters. Try adjusting the criteria or date to see results.`,
	);
	icon = input<string>("icon-search");
}
