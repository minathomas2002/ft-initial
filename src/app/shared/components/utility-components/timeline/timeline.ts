import { CommonModule } from '@angular/common';
import { Component, contentChild, input, TemplateRef } from '@angular/core';
import { TimelineModule } from 'primeng/timeline';
import { TColors } from 'src/app/shared/interfaces';

@Component({
  selector: 'app-timeline',
  imports: [TimelineModule, CommonModule],
  templateUrl: './timeline.html',
  styleUrl: './timeline.scss',
})
export class Timeline {

  timelineTemplate = contentChild.required<TemplateRef<unknown>>('timelineTemplate');
	events = input<{ color: TColors; item: unknown }[]>([]);


  getBadgeClasses(color: TColors) {
		const colorMap: Record<TColors, { border: string; circle: string }> = {
			blue: { border: 'border-blue-700', circle: 'bg-blue-700' },
			red: { border: 'border-red-700', circle: 'bg-red-700' },
			green: { border: 'border-green-700', circle: 'bg-green-700' },
			yellow: { border: 'border-yellow-400', circle: 'bg-yellow-400' },
			indigo: { border: 'border-indigo-700', circle: 'bg-indigo-700' },
			purple: { border: 'border-purple-700', circle: 'bg-purple-700' },
			pink: { border: 'border-pink-700', circle: 'bg-pink-700' },
			gray: { border: 'border-gray-700', circle: 'bg-gray-700' },
      orange: { border: 'border-orange-700', circle: 'bg-orange-700' },
			primary: { border: 'border-primary-700', circle: 'bg-primary-700' },
		};
		return colorMap[color];
	}

  
}
