import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TranslatePipe } from 'src/app/shared/pipes';
import { IPlansDashboardStatistics } from 'src/app/shared/interfaces';

@Component({
  selector: 'app-dashboard-statistics-cards',
  imports: [TranslatePipe],
  templateUrl: './dashboard-statistics-cards.html',
  styleUrl: './dashboard-statistics-cards.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardStatisticsCards {
  statistics = input.required<IPlansDashboardStatistics | null>();
}
