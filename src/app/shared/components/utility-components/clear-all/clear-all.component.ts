import { ChangeDetectionStrategy, Component, output } from '@angular/core';

@Component({
	selector: 'app-clear-all',
	imports: [],
	templateUrl: './clear-all.component.html',
	styleUrl: './clear-all.component.scss',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClearAllComponent {
	onClearAll = output();
}
