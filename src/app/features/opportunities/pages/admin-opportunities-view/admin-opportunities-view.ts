import { Component, inject, OnInit, signal } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { CardsPageLayout } from 'src/app/shared/components/layout-components/cards-page-layout/cards-page-layout';
import { TranslatePipe } from 'src/app/shared/pipes';
import { AdminOpportunitiesStore } from 'src/app/shared/stores/admin-opportunities/admin-opportunities.store';
import { CreateEditOpportunityDialog } from '../../components/create-edit-opportunity-dialog/create-edit-opportunity-dialog';
import { AdminOpportunityCard } from 'src/app/shared/components/opportunities/admin-opportunity-card/admin-opportunity-card';
import { AdminOpportunitiesFilter } from '../../components/admin-opportunities-filter/admin-opportunities-filter';
import { DataCards } from 'src/app/shared/components/layout-components/data-cards/data-cards';
import { CardsSkeleton } from 'src/app/shared/components/skeletons/cards-skeleton/cards-skeleton';
import { IAdminOpportunity } from 'src/app/shared/interfaces/admin-opportunities.interface';
import { EOpportunityAction } from 'src/app/shared/enums/opportunities.enum';
import { Router } from '@angular/router';
import { ERoutes } from 'src/app/shared/enums';
import { AdminOpportunitiesFilterService } from '../../services/admin-opportunities-filter/admin-opportunities-filter-service';

@Component({
  selector: 'app-admin-opportunities-view',
  imports: [
    CardsPageLayout,
    ButtonModule,
    TranslatePipe,
    CreateEditOpportunityDialog,
    AdminOpportunityCard,
    AdminOpportunitiesFilter,
    DataCards,
    CardsSkeleton
  ],
  templateUrl: './admin-opportunities-view.html',
  styleUrl: './admin-opportunities-view.scss',
})
export class AdminOpportunitiesView implements OnInit {
  protected readonly adminOpportunitiesStore = inject(AdminOpportunitiesStore);
  private readonly router = inject(Router);
  protected createEditOpportunityDialogVisible = signal<boolean>(false);
  protected readonly adminOpportunitiesFilterService = inject(AdminOpportunitiesFilterService);
  filter = this.adminOpportunitiesFilterService.filter;
  ngOnInit(): void {
    this.applyFilter();
  }

  onViewDetails(opportunity: IAdminOpportunity) {
    // Navigate to opportunity details page
    this.router.navigate(['/', ERoutes.opportunities, opportunity.id]);
  }

  onAction(event: { opportunity: IAdminOpportunity; action: EOpportunityAction }) {
    // Handle actions (Edit, Delete, MoveToDraft, Publish)
    switch (event.action) {
      case EOpportunityAction.Edit:
        // Open edit dialog
        this.createEditOpportunityDialogVisible.set(true);
        break;
      case EOpportunityAction.Delete:
        // Handle delete
        console.log('Delete opportunity', event.opportunity.id);
        break;
      case EOpportunityAction.MoveToDraft:
        // Handle move to draft
        console.log('Move to draft', event.opportunity.id);
        break;
      case EOpportunityAction.Publish:
        // Handle publish
        console.log('Publish opportunity', event.opportunity.id);
        break;
    }
  }

  onAddOpportunity() {
    this.createEditOpportunityDialogVisible.set(true);
  }

  applyFilter() {
    this.adminOpportunitiesFilterService.applyFilterWithPaging();
  }
}
