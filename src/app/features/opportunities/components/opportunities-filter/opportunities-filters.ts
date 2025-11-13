import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { catchError, debounceTime, distinctUntilChanged, of, Subject, switchMap } from 'rxjs';
import { OpportunitiesFilterService } from 'src/app/features/opportunities/services/opportunities-filter/opportunities-filter-service';

@Component({
  selector: 'app-opportunities-filters',
  imports: [IconFieldModule, InputIconModule, FormsModule, InputTextModule],
  templateUrl: './opportunities-filters.html',
  styleUrl: './opportunities-filters.scss',
})
export class OpportunitiesFilters implements OnInit {
  filterService = inject(OpportunitiesFilterService);
  filter = this.filterService.filter;
  searchSubject = new Subject<string>();
  destroyRef = inject(DestroyRef);

  ngOnInit() {
    this.listenToSearchText();
  }

  listenToSearchText() {
    this.searchSubject
      .pipe(
        debounceTime(700),
        distinctUntilChanged(),
        switchMap((res) => this.performFilter$()),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe();
  }

  performFilter$() {
    return this.filterService.performFilter$().pipe(catchError((error) => of(error)));
  }
}
