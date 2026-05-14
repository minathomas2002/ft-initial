import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { TranslatePipe } from 'src/app/shared/pipes';

@Component({
  selector: 'app-total-cost-indicator',
  imports: [TranslatePipe],
  templateUrl: './total-cost-indicator.html',
  styleUrl: './total-cost-indicator.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TotalCostIndicator {
  /** Sum of all Cost % fields across the value chain (may exceed 100). */
  percentage = input(0, {
    transform: (v: number | string | null | undefined) => {
      const n = Number(v);
      return Number.isFinite(n) ? n : 0;
    },
  });

  protected readonly displayPercentage = computed(() => {
    const n = this.percentage();
    const rounded = Math.round(n * 100) / 100;
    if (!Number.isFinite(rounded)) return '0';
    return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(2).replace(/\.?0+$/, '');
  });
}
