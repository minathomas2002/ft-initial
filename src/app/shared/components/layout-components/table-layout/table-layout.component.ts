import { Component, input } from '@angular/core';

@Component({
	selector: 'app-table-layout',
	imports: [],
	templateUrl: './table-layout.component.html',
	styleUrl: './table-layout.component.scss',
})
export class TableLayoutComponent {
	tableTitle = input.required<string>();
  tableSubTitle = input<string>("");
}
