import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
	selector: 'app-base-error',
	imports: [],
	templateUrl: './base-error.component.html',
	styleUrl: './base-error.component.scss',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BaseErrorComponent {
	message = input<string>();
	styleClass = input<string>('');
}

