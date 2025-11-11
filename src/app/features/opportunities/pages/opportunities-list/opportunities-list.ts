import { Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { PaginatorComponent } from '../../../../shared/components/utility-components/paginator/paginator.component';
import { Pagination } from '../../../../shared/classes/pagination';
import { ESortingOrder } from '../../../../shared/enums';
import type { IFilterBase } from '../../../../shared/interfaces';
import { OpportunitiesStore } from 'src/app/shared/stores/opportunities/opportunities.store';
import { IOpportunityRecord } from 'src/app/shared/interfaces/opportunities.interface';
import { OpportunitiesFilterService } from '../../services/opportunities-filter/opportunities-filter-service';
import { CardsSkeleton } from 'src/app/shared/components/skeletons/cards-skeleton/cards-skeleton';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

export interface IOpportunity {
  id: string;
  icon: string;
  title: string;
  description: string;
}

interface IOpportunityFilter extends IFilterBase<string> {
  searchText?: string;
}

@Component({
  selector: 'app-opportunities-list',
  imports: [
    CommonModule,
    FormsModule,
    IconFieldModule,
    InputIconModule,
    InputTextModule,
    ButtonModule,
    CardModule,
    PaginatorComponent,
    CardsSkeleton
  ],
  templateUrl: './opportunities-list.html',
  styleUrl: './opportunities-list.scss',
})
export class OpportunitiesList {
  opportunitiesStore = inject(OpportunitiesStore)
    
  rows = computed<IOpportunityRecord[]>(() => this.opportunitiesStore.list());
  filterService = inject(OpportunitiesFilterService);
  filter = this.filterService.filter;
  totalRecords = computed(() => this.opportunitiesStore.count());
  //opportunityStatusMapper = new OpportunityStatusMapper();
  selectedRows = signal<IOpportunityRecord[]>([]);
  private searchInput$ = new Subject<string>();
  private destroyRef = inject(DestroyRef);
  
  
  ngOnInit(): void {
    this.filterService.applyFilter()

    this.searchInput$
      .pipe(
        debounceTime(1000),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((search) => {
        this.filterService.updateFilterSignal({ searchText: search });
        this.filterService.applyFilter();
      });
  }

  onViewDetails(opportunity: IOpportunityRecord) {

  }

  onApply(opportunity: IOpportunityRecord) {

  }

  onSearchChange(search: string) {
    this.searchInput$.next(search);
  }
}
