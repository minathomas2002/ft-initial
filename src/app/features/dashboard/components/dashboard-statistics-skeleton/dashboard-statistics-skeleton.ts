import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { SkeletonModule } from 'primeng/skeleton';

@Component({
  selector: 'app-dashboard-statistics-skeleton',
  imports: [SkeletonModule],
  templateUrl: './dashboard-statistics-skeleton.html',
  styleUrl: './dashboard-statistics-skeleton.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardStatisticsSkeleton {
  count = input<number>(5);
  items = computed(() => Array.from({ length: this.count() }));
}
