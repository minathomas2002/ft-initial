import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TColors } from 'src/app/shared/interfaces';
import { TranslatePipe } from 'src/app/shared/pipes';

@Component({
  selector: 'app-required-fields-message',
  imports: [TranslatePipe],
  templateUrl: './required-fields-message.html',
  styleUrl: './required-fields-message.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RequiredFieldsMessage {
  color = input<TColors>('primary')
  getBadgeClasses(): string {
    const colorMap: Record<TColors, string> = {
      primary: 'border-primary-200 bg-primary-50 text-primary-700',
      blue: 'border-blue-200 bg-blue-50 text-blue-700',
      fadedBlue: 'border-slate-300 bg-slate-50 text-[#4767A5]',
      red: 'border-[#DD9A95] bg-[#F7E9E8] text-[#901C13]',
      green: 'border-green-200 bg-green-50 text-green-700',
      yellow: 'border-yellow-200 bg-yellow-50 text-yellow-700',
      indigo: 'border-indigo-200 bg-indigo-50 text-indigo-700',
      purple: 'border-purple-200 bg-purple-50 text-purple-700',
      pink: 'border-pink-200 bg-pink-50 text-pink-700',
      gray: 'border-gray-200 bg-gray-50 text-gray-700',
      orange: 'border-[#FFE68F] bg-[#FFFAE7] text-[#AD8908]',
      fadeGreen: 'border-[#8CC0AA] bg-[#E6F1ED] text-[#055A36]',
      cloudBlue: 'border-[#B8DCF5] bg-[#F2F9FD] text-[#006EB8]',
    };
    return colorMap[this.color()];
  }
}
