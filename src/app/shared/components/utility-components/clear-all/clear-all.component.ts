import { ChangeDetectionStrategy, Component, output } from '@angular/core';
import { TranslatePipe } from 'src/app/shared/pipes/translate.pipe';

@Component({
	selector: 'app-clear-all',
	imports: [TranslatePipe],
	templateUrl: './clear-all.component.html',
	styleUrl: './clear-all.component.scss',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClearAllComponent {
	onClearAll = output();
}
