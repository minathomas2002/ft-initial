import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { IconField } from "primeng/iconfield";
import { InputIconModule } from "primeng/inputicon";
import { InputTextModule } from "primeng/inputtext";
import { HolidaysFilterService } from '../../services/holidays-filter/holidays-filter-service';
import { TranslatePipe } from "../../../../shared/pipes/translate.pipe";
import { FormsModule } from '@angular/forms';
import { debounceTime, Subject, switchMap } from 'rxjs';
import { I18nService } from 'src/app/shared/services/i18n';
import { HolidaysTypeMapper } from '../../classes/holidays-type-mapper';
import { MultiSelectModule } from "primeng/multiselect";
import { DatePicker } from "primeng/datepicker";
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-holidays-management-filter',
  imports: [IconField, InputIconModule, TranslatePipe, FormsModule, InputTextModule, MultiSelectModule, DatePicker],
  templateUrl: './holidays-management-filter.html',
  styleUrl: './holidays-management-filter.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HolidaysManagementFilter implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  disableFilterInputs = signal(false);
  holidaysFilterService = inject(HolidaysFilterService);
  filter = this.holidaysFilterService.filter;
  holidaySearchSubject = new Subject<string>();
  i18nService = inject(I18nService);
  holidaysTypeMapper = new HolidaysTypeMapper(this.i18nService);
  holidayTypes = computed(() => this.holidaysTypeMapper.getMappedTypesList());
  today = new Date();

  ngOnInit() {
    this.listenToSearchTextInputs();
  }

  listenToSearchTextInputs() {
    this.holidaySearchSubject
      .pipe(
        debounceTime(700),
        switchMap((res) => this.holidaysFilterService.performFilter$()),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe();
  }

  onPickerChange(value: Date[] | undefined) {
    value = value?.filter((x) => !!x) ?? [];
    if (!!value && (value.length == 2 || value.length == 0)) {
      this.holidaysFilterService.applyFilterWithPaging();
    }
  }

  onSearchTextChange(value: string) {
    this.holidaysFilterService.updateFilterSignal({ searchText: value, pageNumber: 1 });
    this.holidaySearchSubject.next(value ?? '');
  }
}
