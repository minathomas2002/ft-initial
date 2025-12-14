import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { TooltipModule } from 'primeng/tooltip';
import { ButtonModule } from 'primeng/button';
import { DatePipe } from '@angular/common';
import { IAdminOpportunity } from '../../../interfaces/admin-opportunities.interface';
import { EOpportunityStatus, EOpportunityState, EOpportunityAction } from '../../../enums/opportunities.enum';
import { TranslatePipe } from '../../../pipes';
import { BaseTagComponent } from '../../base-components/base-tag/base-tag.component';
import { OpportunityDetailItem } from '../opportunity-detail-item/opportunity-detail-item';
import { OpportunityActionMenuComponent } from '../opportunity-action-menu/opportunity-action-menu.component';
import { TColors } from 'src/app/shared/interfaces';
import { AdminOpportunitiesStore } from 'src/app/shared/stores/admin-opportunities/admin-opportunities.store';

@Component({
  selector: 'app-admin-opportunity-card',
  imports: [
    TooltipModule,
    ButtonModule,
    DatePipe,
    TranslatePipe,
    BaseTagComponent,
    OpportunityDetailItem,
    OpportunityActionMenuComponent
  ],
  templateUrl: './admin-opportunity-card.html',
  styleUrl: './admin-opportunity-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminOpportunityCard {
  opportunity = input.required<IAdminOpportunity>();
  onViewDetails = output<IAdminOpportunity>();
  onAction = output<{ opportunity: IAdminOpportunity; action: EOpportunityAction }>();
  private readonly adminOpportunitiesStore = inject(AdminOpportunitiesStore);

  EOpportunityStatus = EOpportunityStatus;
  EOpportunityState = EOpportunityState;
  EOpportunityAction = EOpportunityAction;

  getOpportunityIcon(): string {
    return this.adminOpportunitiesStore.getIconByOpportunityCategory(this.opportunity().opportunityCategory?.toString() ?? 1);
  }

  getStatusConfig(): { label: string; color: TColors } {
    const status = this.opportunity().status;
    if (status === EOpportunityStatus.PUBLISHED) {
      return { label: 'opportunity.status.published', color: 'green' as const };
    } else {
      return { label: 'opportunity.status.draft', color: 'gray' as const };
    }
  }

  getStateConfig(): { label: string; color: TColors } {
    const isActive = this.opportunity().isActive;
    if (isActive) {
      return { label: 'opportunity.state.active', color: 'green' as const };
    } else {
      return { label: 'opportunity.state.inactive', color: 'red' as const };
    }
  }

  shouldShowWarning(): boolean {
    return this.opportunity().isActive && this.opportunity().status === EOpportunityStatus.DRAFT;
  }

  handleAction(action: EOpportunityAction) {
    this.onAction.emit({ opportunity: this.opportunity(), action });
  }

  handleViewDetails() {
    this.onViewDetails.emit(this.opportunity());
  }
}

