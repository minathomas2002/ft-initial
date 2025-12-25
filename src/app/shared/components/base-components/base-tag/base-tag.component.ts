import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TagModule } from 'primeng/tag';
import type { TColors } from '../../../interfaces';

@Component({
	selector: 'app-base-tag',
	imports: [TagModule],
	templateUrl: './base-tag.component.html',
	styleUrl: './base-tag.component.scss',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BaseTagComponent {
	color = input<TColors>('red');
	value = input<string>('');
	styleClass = input<string>('');

	getBadgeClasses(): string {
		const colorMap: Record<TColors, string> = {
			primary: 'border-primary-200 bg-primary-50 text-primary-700',
			blue: 'border-blue-200 bg-blue-50 text-blue-700',
			red: 'border-red-200 bg-red-50 text-red-700',
			green: 'border-green-200 bg-green-50 text-green-700',
			yellow: 'border-yellow-200 bg-yellow-50 text-yellow-700',
			indigo: 'border-indigo-200 bg-indigo-50 text-indigo-700',
			purple: 'border-purple-200 bg-purple-50 text-purple-700',
			pink: 'border-pink-200 bg-pink-50 text-pink-700',
			gray: 'border-gray-200 bg-gray-50 text-gray-700',
			orange: 'border-orange-200 bg-orange-50 text-orange-700'
		};

		return colorMap[this.color()];
	}

	getEffectiveClasses(): string {
		// If styleClass is provided, use it; otherwise use getBadgeClasses
		return this.styleClass() || this.getBadgeClasses();
	}
}
