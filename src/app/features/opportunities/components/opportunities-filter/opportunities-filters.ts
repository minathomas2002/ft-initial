import { Component, DestroyRef, inject, input, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { catchError, debounceTime, distinctUntilChanged, of, Subject, switchMap } from 'rxjs';
import { OpportunitiesFilterService } from 'src/app/features/opportunities/services/opportunities-filter/opportunities-filter-service';

@Component({
  selector: 'app-opportunities-filters',
  imports: [IconFieldModule, InputIconModule, FormsModule, InputTextModule, SelectModule],
  templateUrl: './opportunities-filters.html',
  styleUrl: './opportunities-filters.scss',
})
export class OpportunitiesFilters implements OnInit {
  
  filterService = inject(OpportunitiesFilterService);
  destroyRef = inject(DestroyRef);
  
  isAdminMode = input.required<boolean>()
  
  filter = this.filterService.filter;
  searchSubject = new Subject<string>();
  
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
