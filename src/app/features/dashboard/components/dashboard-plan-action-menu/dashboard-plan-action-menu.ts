import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import type { MenuItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
import { EPlanStatus, IPlanRecord } from 'src/app/shared/interfaces';
import { I18nService } from 'src/app/shared/services/i18n/i18n.service';

@Component({
  selector: 'app-dashboard-plan-action-menu',
  imports: [MenuModule, ButtonModule],
  templateUrl: './dashboard-plan-action-menu.html',
  styleUrl: './dashboard-plan-action-menu.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardPlanActionMenu {
  plan = input.required<IPlanRecord>();
  private readonly i18nService = inject(I18nService);

  onViewDetails = output<IPlanRecord>();
  onEdit = output<IPlanRecord>();
  onDownload = output<IPlanRecord>();

  menuItems = computed<MenuItem[]>(() => {
    const plan = this.plan();
    const items: MenuItem[] = [
      {
        label: this.i18nService.translate('plans.actions.viewDetails'),
        icon: 'icon-eye',
        command: () => this.onViewDetails.emit(plan),
      },
    ];

    // Only show edit action for Draft and Pending statuses
    if (plan.status === EPlanStatus.DRAFT || plan.status === EPlanStatus.PENDING) {
      items.push({
        label: this.i18nService.translate('plans.actions.edit'),
        icon: 'icon-edit',
        command: () => this.onEdit.emit(plan),
      });
    }

    items.push({
      label: this.i18nService.translate('plans.actions.download'),
      icon: 'icon-download',
      command: () => this.onDownload.emit(plan),
    });

    return items;
  });
}

