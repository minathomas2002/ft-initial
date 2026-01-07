import { ChangeDetectionStrategy, Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { CardsPageLayout } from 'src/app/shared/components/layout-components/cards-page-layout/cards-page-layout';
import { TranslatePipe } from 'src/app/shared/pipes';
import { AdminOpportunitiesStore } from 'src/app/shared/stores/admin-opportunities/admin-opportunities.store';
import { CreateEditOpportunityDialog } from '../../components/create-edit-opportunity-dialog/create-edit-opportunity-dialog';
import { AdminOpportunityCard } from 'src/app/shared/components/opportunities/admin-opportunity-card/admin-opportunity-card';
import { AdminOpportunitiesFilter } from '../../components/admin-opportunities-filter/admin-opportunities-filter';
import { AdminOpportunitiesCounts } from '../../components/admin-opportunities-counts/admin-opportunities-counts.component';
import { DataCards } from 'src/app/shared/components/layout-components/data-cards/data-cards';
import { CardsSkeleton } from 'src/app/shared/components/skeletons/cards-skeleton/cards-skeleton';
import { IAdminOpportunity } from 'src/app/shared/interfaces/admin-opportunities.interface';
import { EOpportunityAction } from 'src/app/shared/enums/opportunities.enum';
import { Router } from '@angular/router';
import { ERoutes, EViewMode } from 'src/app/shared/enums';
import { AdminOpportunitiesFilterService } from '../../services/admin-opportunities-filter/admin-opportunities-filter-service';
import { GeneralConfirmationDialogComponent } from 'src/app/shared/components/utility-components/general-confirmation-dialog/general-confirmation-dialog.component';
import { take } from 'rxjs';
import { ToasterService } from 'src/app/shared/services/toaster/toaster.service';

@Component({
  selector: 'app-admin-opportunities-view',
  imports: [
    CardsPageLayout,
    ButtonModule,
    TranslatePipe,
    CreateEditOpportunityDialog,
    AdminOpportunityCard,
    AdminOpportunitiesFilter,
    AdminOpportunitiesCounts,
    DataCards,
    CardsSkeleton,
    GeneralConfirmationDialogComponent
  ],
  templateUrl: './admin-opportunities-view.html',
  styleUrl: './admin-opportunities-view.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminOpportunitiesView implements OnInit, OnDestroy {
  protected readonly adminOpportunitiesStore = inject(AdminOpportunitiesStore);
  private readonly router = inject(Router);
  protected createEditOpportunityDialogVisible = signal<boolean>(false);
  protected readonly adminOpportunitiesFilterService = inject(AdminOpportunitiesFilterService);
  protected filter = this.adminOpportunitiesFilterService.filter;
  protected deleteConfirmDialogVisible = signal<boolean>(false);
  protected selectedOpportunity = signal<IAdminOpportunity | null>(null);
  private readonly toasterService = inject(ToasterService);
  protected moveToDraftConfirmDialogVisible = signal<boolean>(false);
  protected publishConfirmDialogVisible = signal<boolean>(false);
  ngOnInit(): void {
    this.applyFilter();
  }

  onViewDetails(opportunity: IAdminOpportunity) {
    this.router.navigate(['/', ERoutes.opportunities, opportunity.id]);
  }

  onAddOpportunity() {
    this.adminOpportunitiesStore.setViewMode(EViewMode.Create);
    this.createEditOpportunityDialogVisible.set(true);
  }

  applyFilter() {
    this.adminOpportunitiesFilterService.applyFilterWithPaging();
  }

  onAction(event: { opportunity: IAdminOpportunity; action: EOpportunityAction }) {
    // Handle actions (Edit, Delete, MoveToDraft, Publish)
    switch (event.action) {
      case EOpportunityAction.Edit:

        // Open edit dialog
        this.adminOpportunitiesStore.setSelectedOpportunityId(event.opportunity.id);
        this.adminOpportunitiesStore.setViewMode(EViewMode.Edit);
        this.createEditOpportunityDialogVisible.set(true);
        break;
      case EOpportunityAction.Delete:
        // Handle delete
        this.handelDeleteOpportunity(event.opportunity);
        break;
      case EOpportunityAction.MoveToDraft:
        // Handle move to draft
        this.handelMoveToDraftOpportunity(event.opportunity);
        break;
      case EOpportunityAction.Publish:
        // Handle publish
        this.handelPublishOpportunity(event.opportunity);
        break;
    }
  }

  handelDeleteOpportunity(opportunity: IAdminOpportunity) {
    this.selectedOpportunity.set(opportunity);
    this.deleteConfirmDialogVisible.set(true);
  }

  deleteOpportunity() {
    if (this.selectedOpportunity()) {
      this.adminOpportunitiesStore.deleteOpportunity(this.selectedOpportunity()!.id)
        .pipe(take(1))
        .subscribe({
          next: () => {
            this.deleteConfirmDialogVisible.set(false);
            this.applyFilter();
            this.toasterService.success('Opportunity deleted successfully');
          },
          error: () => {
            this.deleteConfirmDialogVisible.set(false);
          }
        });
    }
  }

  handelMoveToDraftOpportunity(opportunity: IAdminOpportunity) {
    this.selectedOpportunity.set(opportunity);
    this.moveToDraftConfirmDialogVisible.set(true);
  }

  moveToDraftOpportunity() {
    if (this.selectedOpportunity()) {
      this.adminOpportunitiesStore.moveToDraftOpportunity(this.selectedOpportunity()!.id)
        .pipe(take(1))
        .subscribe({
          next: () => {
            this.toasterService.success('Opportunity moved to draft successfully');
            this.selectedOpportunity.set(null);
            this.moveToDraftConfirmDialogVisible.set(false);
            this.applyFilter();
          },
          error: () => {
            this.moveToDraftConfirmDialogVisible.set(false);
          }
        });
    }
  }

  handelPublishOpportunity(opportunity: IAdminOpportunity) {
    this.selectedOpportunity.set(opportunity);
    this.publishConfirmDialogVisible.set(true);
  }

  publishOpportunity() {
    if (this.selectedOpportunity()) {
      this.adminOpportunitiesStore.publishOpportunity(this.selectedOpportunity()!.id)
        .pipe(take(1))
        .subscribe({
          next: () => {
            this.toasterService.success('Opportunity published successfully');
            this.selectedOpportunity.set(null);
            this.publishConfirmDialogVisible.set(false);
            this.applyFilter();
          }
        });
    }
  }

  ngOnDestroy(): void {
    this.adminOpportunitiesFilterService.clearAllFilters()
  }
}
