import { ChangeDetectionStrategy, Component, DestroyRef, inject, input } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { Subject, debounceTime, distinctUntilChanged, switchMap, catchError, of } from 'rxjs';
import { OpportunitiesFilterService } from '../../services/opportunities-filter/investor-opportunities-filter-service';
import { TranslatePipe } from 'src/app/shared/pipes';


@Component({
  selector: 'app-opportunities-filters',
  imports: [
    IconFieldModule,
    InputIconModule,
    FormsModule,
    InputTextModule,
    SelectModule,
    TranslatePipe
  ],
  templateUrl: './opportunities-filters.html',
  styleUrl: './opportunities-filters.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OpportunitiesFilters {
  filterService = inject(OpportunitiesFilterService);
  destroyRef = inject(DestroyRef);


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
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe();
  }

  performFilter$() {
    return this.filterService.performFilter$().pipe(catchError((error) => of(error)));
  }
}
