import { Component, inject, output } from '@angular/core';
import { TranslatePipe } from 'src/app/shared/pipes';
import { AdminOpportunitiesStore } from 'src/app/shared/stores/admin-opportunities/admin-opportunities.store';

@Component({
  selector: 'app-admin-opportunities-counts',
  imports: [TranslatePipe],
  templateUrl: './admin-opportunities-counts.component.html',
  styleUrl: './admin-opportunities-counts.component.scss',
})
export class AdminOpportunitiesCounts {
  protected readonly adminOpportunitiesStore = inject(AdminOpportunitiesStore);
  onFilterClick = output<{ type: 'all' | 'active' | 'inactive' | 'draft' }>();

  counts = this.adminOpportunitiesStore.counts;

  onCardClick(type: 'all' | 'active' | 'inactive' | 'draft') {
    this.onFilterClick.emit({ type });
  }
}

