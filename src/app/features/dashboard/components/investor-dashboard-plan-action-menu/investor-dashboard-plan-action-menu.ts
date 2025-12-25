import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import type { MenuItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
import { EInvestorPlanStatus, IPlanRecord } from 'src/app/shared/interfaces';
import { I18nService } from 'src/app/shared/services/i18n/i18n.service';

@Component({
  selector: 'app-investor-dashboard-plan-action-menu',
  imports: [MenuModule, ButtonModule],
  templateUrl: './investor-dashboard-plan-action-menu.html',
  styleUrl: './investor-dashboard-plan-action-menu.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InvestorDashboardPlanActionMenu {
  plan = input.required<IPlanRecord>();
  private readonly i18nService = inject(I18nService);

  onViewDetails = output<IPlanRecord>();
  onEdit = output<IPlanRecord>();
  onDownload = output<IPlanRecord>();
  onViewTimeLine= output<IPlanRecord>();

  menuItems = computed<MenuItem[]>(() => {
    const plan = this.plan();
    const items: MenuItem[] = [
      {
        label: this.i18nService.translate('plans.actions.viewDetails'),
        command: () => this.onViewDetails.emit(plan),
      },
      {
        label: this.i18nService.translate('plans.actions.viewTimeline'),
        command: () => this.onViewTimeLine.emit(plan),
      },
    ];

    // Only show edit action for Draft and Pending statuses
    if (plan.status === EInvestorPlanStatus.DRAFT || plan.status === EInvestorPlanStatus.PENDING) {
      items.push({
        label: this.i18nService.translate('plans.actions.edit'),
        command: () => this.onEdit.emit(plan),
      });
    }

    items.push({
      label: this.i18nService.translate('plans.actions.download'),
      command: () => this.onDownload.emit(plan),
    });

    return items;
  });
}

