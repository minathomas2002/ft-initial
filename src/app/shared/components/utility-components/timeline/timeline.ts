import { CommonModule } from '@angular/common';
import { Component, computed, contentChild, inject, input, TemplateRef } from '@angular/core';
import { TimelineModule } from 'primeng/timeline';
import { TColors } from 'src/app/shared/interfaces';
import { I18nService } from 'src/app/shared/services/i18n';

@Component({
	selector: 'app-timeline',
	imports: [TimelineModule, CommonModule],
	templateUrl: './timeline.html',
	styleUrl: './timeline.scss',
})
export class Timeline {
	private readonly i18nService = inject(I18nService);

	timelineTemplate = contentChild.required<TemplateRef<unknown>>('timelineTemplate');
	events = input<{ color: TColors; item: unknown }[]>([]);

	/** Timeline bar position: right in RTL, left in LTR (start of reading direction) */
	align = computed(() =>
		this.i18nService.currentLanguage() === 'ar' ? 'right' : 'left'
	);


	getBadgeClasses(color: TColors) {
		const colorMap: Record<TColors, { border: string; circle: string }> = {
			blue: { border: 'border-blue-700', circle: 'bg-blue-700' },
			fadedBlue: { border: 'border-slate-300', circle: 'bg-slate-50' },
			red: { border: 'border-red-700', circle: 'bg-red-700' },
			green: { border: 'border-green-700', circle: 'bg-green-700' },
			yellow: { border: 'border-yellow-400', circle: 'bg-yellow-400' },
			indigo: { border: 'border-indigo-700', circle: 'bg-indigo-700' },
			purple: { border: 'border-purple-700', circle: 'bg-purple-700' },
			pink: { border: 'border-pink-700', circle: 'bg-pink-700' },
			gray: { border: 'border-gray-700', circle: 'bg-gray-700' },
			orange: { border: 'border-[#FFE68F]', circle: 'bg-[#FFFAE7]' },
			primary: { border: 'border-primary-700', circle: 'bg-primary-700' },
			fadeGreen: { border: 'border-[#8CC0AA]', circle: 'bg-[#E6F1ED]' },
			cloudBlue: { border: 'border-[#B8DCF5]', circle: 'bg-[#F2F9FD]' },
		};
		return colorMap[color];
	}
}
