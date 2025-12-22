import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import type { MenuItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
import { EEmployeePlanStatus, IPlanRecord } from 'src/app/shared/interfaces';
import { I18nService } from 'src/app/shared/services/i18n/i18n.service';

@Component({
    selector: 'app-dv-manager-dashboard-plan-action-menu',
    imports: [MenuModule, ButtonModule],
    templateUrl: './dv-manager-dashboard-plan-action-menu.html',
    styleUrl: './dv-manager-dashboard-plan-action-menu.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DvManagerDashboardPlanActionMenu {
    plan = input.required<IPlanRecord>();
    private readonly i18nService = inject(I18nService);

    onViewDetails = output<IPlanRecord>();
    onDownload = output<IPlanRecord>();
    onAssignToEmployee = output<IPlanRecord>();
    onReAssign = output<IPlanRecord>();
    onViewTimeline = output<IPlanRecord>();

    menuItems = computed<MenuItem[]>(() => {
        const plan = this.plan();
        const items: MenuItem[] = [
            {
                label: this.i18nService.translate('plans.actions.viewDetails'),
                icon: 'icon-eye',
                command: () => this.onViewDetails.emit(plan),
            },
        ];

        items.push({
            label: this.i18nService.translate('plans.actions.download'),
            icon: 'icon-data',
            command: () => this.onDownload.emit(plan),
        });

        items.push({
            label: this.i18nService.translate('plans.actions.viewTimeline'),
            command: () => this.onViewTimeline.emit(plan),
        });

        if (plan.status === EEmployeePlanStatus.UNASSIGNED) {
            items.push({
                label: this.i18nService.translate('plans.actions.assignToEmployee'),
                command: () => this.onAssignToEmployee.emit(plan),
            });
        }


        //TODO check this logic
        if (![EEmployeePlanStatus.APPROVED,
            EEmployeePlanStatus.REJECTED,
            EEmployeePlanStatus.UNASSIGNED
        ].includes(plan.status as EEmployeePlanStatus)) {
            items.push({
                label: this.i18nService.translate('plans.actions.reAssign'),
                command: () => this.onReAssign.emit(plan),
            });
        }

        return items;
    });
}

