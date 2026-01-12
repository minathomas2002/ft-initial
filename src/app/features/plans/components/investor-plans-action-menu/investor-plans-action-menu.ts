import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
import { EActionPlanTimeLine } from 'src/app/shared/enums/action-plan-timeline.enum';
import { IPlanRecord } from 'src/app/shared/interfaces';
import { I18nService } from 'src/app/shared/services/i18n';
import { PlanStore } from 'src/app/shared/stores/plan/plan.store';

@Component({
  selector: 'app-investor-plans-action-menu',
  imports: [MenuModule, ButtonModule],
  templateUrl: './investor-plans-action-menu.html',
  styleUrl: './investor-plans-action-menu.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InvestorPlansActionMenu {
  plan = input.required<IPlanRecord>();
  private readonly i18nService = inject(I18nService);
  readonly planStore = inject(PlanStore);

  // TODO: add (Delete) action
  onViewDetails = output<IPlanRecord>();
  onEdit = output<IPlanRecord>();
  onDownload = output<IPlanRecord>();
  onViewTimeLine = output<IPlanRecord>();

  menuItems = computed<MenuItem[]>(() => {
    const plan = this.plan();
    const items: MenuItem[] = [
      {
        label: this.i18nService.translate('plans.actions.viewDetails'),
        command: () => this.onViewDetails.emit(plan),
      }
    ];
    items.push({
      label: this.i18nService.translate('plans.actions.viewTimeline'),
      command: () => this.onViewTimeLine.emit(plan),
    });
    // Only show edit action for Draft and Pending statuses
    if (plan.actions && plan.actions.includes(EActionPlanTimeLine.EditPlan)) {
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
