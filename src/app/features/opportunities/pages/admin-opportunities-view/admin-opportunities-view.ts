import { Component, inject, model, signal } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { CardsPageLayout } from 'src/app/shared/components/layout-components/cards-page-layout/cards-page-layout';
import { TranslatePipe } from 'src/app/shared/pipes';
import { AdminOpportunitiesStore } from 'src/app/shared/stores/admin-opportunities/admin-opportunities.store';
import { CreateEditOpportunityDialog } from '../../components/create-edit-opportunity-dialog/create-edit-opportunity-dialog';

@Component({
  selector: 'app-admin-opportunities-view',
  imports: [
    CardsPageLayout,
    ButtonModule,
    TranslatePipe,
    CreateEditOpportunityDialog
  ],
  templateUrl: './admin-opportunities-view.html',
  styleUrl: './admin-opportunities-view.scss',
})
export class AdminOpportunitiesView {
  private readonly adminOpportunitiesStore = inject(AdminOpportunitiesStore);
  protected createEditOpportunityDialogVisible = signal<boolean>(false);

  onAddOpportunity() {
    this.createEditOpportunityDialogVisible.set(true);
  }
}
