import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
	selector: 'app-base-label',
	imports: [],
	templateUrl: './base-label.component.html',
	styleUrl: './base-label.component.scss',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BaseLabelComponent {
	title = input<string>();
	secondaryTitle = input<string>();
	styleClass = input<string>('');
	required = input<boolean>();
}
