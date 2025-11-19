import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TranslatePipe } from 'src/app/shared/pipes';

@Component({
  selector: 'app-opportunities-filters',
  imports: [
    IconFieldModule,
    InputIconModule,
    FormsModule,
    InputTextModule,
    SelectModule,
    TranslatePipe,
  ],
  templateUrl: './opportunities-filters.html',
  styleUrl: './opportunities-filters.scss',
})
export class OpportunitiesFilters {
  // filterService = inject(OpportunitiesFilterService);
  // destroyRef = inject(DestroyRef);

  // isAdminMode = input.required<boolean>();

  // filter = this.filterService.filter;
  // searchSubject = new Subject<string>();

  // opportunityStates = [
  //   { label: 'opportunity.state.isActive', value: true },
  //   { label: 'opportunity.state.isNotActive', value: false },
  // ];

  // opportunityTypes = [
  //   { label: 'opportunity.type.material', value: EOpportunityType.MATERIAL },
  //   { label: 'opportunity.type.service', value: EOpportunityType.SERVICES },
  // ];

  // opportunityStatuses = [
  //   { label: 'opportunity.status.published', value: EOpportunityStatus.PUBLISHED },
  //   { label: 'opportunity.status.draft', value: EOpportunityStatus.DRAFT },
  // ];

  // onStatusChange(status: number | null) {
  //   this.filterService.updateFilterSignal({ status: status ?? undefined });
  //   this.filterService.applyFilter();
  // }

  // onTypeChange(type: EOpportunityType | null) {
  //   this.filterService.updateFilterSignal({ type: type ?? undefined });
  //   this.filterService.applyFilter();
  // }

  // onStateChange(state: boolean | null) {
  //   this.filterService.updateFilterSignal({ isActive: state ?? undefined });
  //   this.filterService.applyFilter();
  // }

  // ngOnInit() {
  //   this.listenToSearchText();
  // }

  // listenToSearchText() {
  //   this.searchSubject
  //     .pipe(
  //       debounceTime(700),
  //       distinctUntilChanged(),
  //       switchMap((res) => this.performFilter$()),
  //       takeUntilDestroyed(this.destroyRef)
  //     )
  //     .subscribe();
  // }

  // performFilter$() {
  //   return this.filterService.performFilter$().pipe(catchError((error) => of(error)));
  // }
}
