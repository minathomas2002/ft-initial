import { Component, DestroyRef, inject, input, model, output } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { TranslatePipe } from 'src/app/shared/pipes';
import { IAdminOpportunitiesFilterRequest } from 'src/app/shared/interfaces/admin-opportunities.interface';
import { AdminOpportunitiesStore } from 'src/app/shared/stores/admin-opportunities/admin-opportunities.store';

@Component({
  selector: 'app-admin-opportunities-filter',
  imports: [
    IconFieldModule,
    InputIconModule,
    FormsModule,
    InputTextModule,
    SelectModule,
    TranslatePipe
  ],
  templateUrl: './admin-opportunities-filter.html',
  styleUrl: './admin-opportunities-filter.scss',
})
export class AdminOpportunitiesFilter {
  filter = model.required<IAdminOpportunitiesFilterRequest>();
  destroyRef = inject(DestroyRef);
  searchSubject = new Subject<string>();
  protected readonly adminOpportunitiesStore = inject(AdminOpportunitiesStore);

  onFilterChange = output<void>();

  ngOnInit() {
    this.listenToSearchText();
  }

  listenToSearchText() {
    this.searchSubject
      .pipe(
        debounceTime(700),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => {
        this.onFilterChange.emit();
      });
  }

  onSearchChange(value: string) {
    this.filter.update(f => ({ ...f, SearchText: value || undefined }));
    this.searchSubject.next(value);
  }

  onStatusChange(value: string | null) {
    this.filter.update(f => ({ ...f, Status: value ? +value : undefined }));
    this.onFilterChange.emit();
  }

  onOpportunityTypeChange(value: string | null) {
    this.filter.update(f => ({ ...f, OpportunityType: value ? +value : undefined }));
    this.onFilterChange.emit();
  }

  onIsActiveChange(value: string | null) {
    let isActiveValue: boolean | undefined;
    if (value === 'true') {
      isActiveValue = true;
    } else if (value === 'false') {
      isActiveValue = false;
    } else {
      isActiveValue = undefined;
    }
    this.filter.update(f => ({ ...f, IsActive: isActiveValue }));
    this.onFilterChange.emit();
  }
}

