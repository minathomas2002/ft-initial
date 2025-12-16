import { Component, input } from '@angular/core';

@Component({
	selector: 'app-base-label',
	imports: [],
	templateUrl: './base-label.component.html',
	styleUrl: './base-label.component.scss',
})
export class BaseLabelComponent {
	title = input<string>();
	secondaryTitle = input<string>();
	styleClass = input<string>('');
	required = input<boolean>();
}
