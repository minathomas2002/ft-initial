import { DatePipe } from '@angular/common';
import { Component, inject, model, signal } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { CardsPageLayout } from 'src/app/shared/components/layout-components/cards-page-layout/cards-page-layout';
import { DataCards } from 'src/app/shared/components/layout-components/data-cards/data-cards';
import { OpportunityCard } from 'src/app/shared/components/opportunities/opportunity-card/opportunity-card';
import { OpportunityDetailItem } from 'src/app/shared/components/opportunities/opportunity-detail-item/opportunity-detail-item';
import { CardsSkeleton } from 'src/app/shared/components/skeletons/cards-skeleton/cards-skeleton';
import { TranslatePipe } from 'src/app/shared/pipes';
import { AdminOpportunitiesStore } from 'src/app/shared/stores/admin-opportunities/admin-opportunities.store';
import { CreateOpportunityDialog } from '../../components/create-opportunity-dialog/create-opportunity-dialog';

@Component({
  selector: 'app-admin-opportunities-view',
  imports: [
    CardsPageLayout,
    ButtonModule,
    TranslatePipe,
    CreateOpportunityDialog
  ],
  templateUrl: './admin-opportunities-view.html',
  styleUrl: './admin-opportunities-view.scss',
})
export class AdminOpportunitiesView {
  private readonly adminOpportunitiesStore = inject(AdminOpportunitiesStore);
  protected createOpportunityDialogVisible = signal<boolean>(false);

  onAddOpportunity() {
    this.createOpportunityDialogVisible.set(true);
  }
}
