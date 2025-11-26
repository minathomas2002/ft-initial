import { Component, input, output } from '@angular/core';
import { TooltipModule } from 'primeng/tooltip';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { DatePipe } from '@angular/common';
import { IAdminOpportunity } from '../../../interfaces/admin-opportunities.interface';
import { EOpportunityStatus, EOpportunityState, EOpportunityAction } from '../../../enums/opportunities.enum';
import { TranslatePipe } from '../../../pipes';
import { BaseTagComponent } from '../../base-components/base-tag/base-tag.component';
import { OpportunityDetailItem } from '../opportunity-detail-item/opportunity-detail-item';

@Component({
  selector: 'app-admin-opportunity-card',
  imports: [
    TooltipModule,
    ButtonModule,
    MenuModule,
    DatePipe,
    TranslatePipe,
    BaseTagComponent,
    OpportunityDetailItem
  ],
  templateUrl: './admin-opportunity-card.html',
  styleUrl: './admin-opportunity-card.scss',
})
export class AdminOpportunityCard {
  opportunity = input.required<IAdminOpportunity>();
  onViewDetails = output<IAdminOpportunity>();
  onAction = output<{ opportunity: IAdminOpportunity; action: EOpportunityAction }>();

  EOpportunityStatus = EOpportunityStatus;
  EOpportunityState = EOpportunityState;
  EOpportunityAction = EOpportunityAction;

  getOpportunityIcon(): string {
    switch (this.opportunity().opportunityType) {
      case 1:
        return 'icon-flag';
      case 2:
        return 'icon-idea';
      default:
        return 'icon-search';
    }
  }

  getStatusConfig() {
    const status = this.opportunity().status;
    if (status === EOpportunityStatus.PUBLISHED) {
      return { label: 'opportunity.status.published', color: 'green' as const };
    } else {
      return { label: 'opportunity.status.draft', color: 'gray' as const };
    }
  }

  getStateConfig() {
    const isActive = this.opportunity().isActive;
    if (isActive) {
      return { label: 'opportunity.state.active', color: 'green' as const };
    } else {
      return { label: 'opportunity.state.inactive', color: 'gray' as const };
    }
  }

  shouldShowWarning(): boolean {
    const opp = this.opportunity();
    if (opp.status === EOpportunityStatus.DRAFT && opp.startDate) {
      const startDate = new Date(opp.startDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return today >= startDate;
    }
    return false;
  }

  getActionsMenuItems(): MenuItem[] {
    const opp = this.opportunity();
    const items: MenuItem[] = [];
    
    if (opp.actions.includes(EOpportunityAction.Edit)) {
      items.push({
        label: 'opportunity.action.edit',
        icon: 'icon-edit',
        command: () => this.onAction.emit({ opportunity: opp, action: EOpportunityAction.Edit })
      });
    }
    
    if (opp.actions.includes(EOpportunityAction.Delete)) {
      items.push({
        label: 'opportunity.action.delete',
        icon: 'icon-delete',
        command: () => this.onAction.emit({ opportunity: opp, action: EOpportunityAction.Delete })
      });
    }
    
    if (opp.actions.includes(EOpportunityAction.MoveToDraft)) {
      items.push({
        label: 'opportunity.action.moveToDraft',
        icon: 'icon-draft',
        command: () => this.onAction.emit({ opportunity: opp, action: EOpportunityAction.MoveToDraft })
      });
    }
    
    if (opp.actions.includes(EOpportunityAction.Publish)) {
      items.push({
        label: 'opportunity.action.publish',
        icon: 'icon-publish',
        command: () => this.onAction.emit({ opportunity: opp, action: EOpportunityAction.Publish })
      });
    }
    
    return items;
  }

  handleViewDetails() {
    this.onViewDetails.emit(this.opportunity());
  }
}

