import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, model, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { EmployeesFilterService } from '../../services/empolyees-filter/employee-filter-service';
import { debounceTime, distinctUntilChanged, Subject, switchMap, take, tap } from 'rxjs';
import { MultiSelectModule } from "primeng/multiselect";
import { ButtonModule } from 'primeng/button';
import { I18nService } from 'src/app/shared/services/i18n/i18n.service';
import { EmployeeRoleMapper } from '../../classes/employee-role-mapper';
import { RolesStore } from 'src/app/shared/stores/roles/roles.store';
import { TranslatePipe } from 'src/app/shared/pipes';
import { SystemEmployeesStore } from 'src/app/shared/stores/system-employees/system-employees.store';
import { UserStatusMapper } from '../../classes/user-status-mapper';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DelegationFilterService } from '../../services/Delegation-filter/Delegation-filter-service';
import { DatePickerModule } from 'primeng/datepicker';
import { DelegationStatusMapper } from '../../classes/delegation-status-mapper';
import { OverlayBadgeModule } from 'primeng/overlaybadge';
import { BadgeModule } from 'primeng/badge';

@Component({
  selector: 'app-delegation-filter',
   imports: [
    IconFieldModule,
    InputIconModule,
    InputTextModule,
    FormsModule,
    MultiSelectModule,
    ButtonModule,
    TranslatePipe,
    DatePickerModule,
    OverlayBadgeModule,
    BadgeModule,
  ],
  templateUrl: './delegation-filter.html',
  styleUrl: './delegation-filter.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DelegationFilter {
  filterDrawerVisible = model<boolean>(false);
  disableFilterInputs = signal(false);
  delegationFilterService = inject(DelegationFilterService);
  filter = this.delegationFilterService.filter;
  delegationSearchSubject = new Subject<string>();
  i18nService = inject(I18nService);
  delegationStatusMapper = new DelegationStatusMapper(this.i18nService);
  destroyRef = inject(DestroyRef);

  delegationStatuses = computed(() => this.delegationStatusMapper.getMappedStatusList());

  ngOnInit() {
    this.listenToSearchTextInputs();
  }

  listenToSearchTextInputs() {
    this.delegationSearchSubject
      .pipe(
        debounceTime(700),
        distinctUntilChanged(),
        switchMap((res) => this.delegationFilterService.performFilter$()),
        takeUntilDestroyed(this.destroyRef)
      ).subscribe();
  }

   onPickerChange(value: Date[] | undefined) {
    value = value?.filter((x) => !!x) ?? [];
    if (!!value && (value.length == 2 || value.length == 0)) {
      this.filter().delegationDateFrom = value[0] ? new Date(value[0]).toLocaleDateString('en-us') : null;
      this.filter().delegationDateTo = value[1] ? new Date(value[1]).toLocaleDateString('en-us') : null;
      this.delegationFilterService.applyFilterWithPaging();
    }
  }
  applyFilter() {
    this.delegationFilterService.clearAllFilters();
    this.delegationFilterService.updateFilterSignal({ searchText: '' });
    this.delegationFilterService.applyFilter();
  }

  onSearchTextChange(value: string) {
    this.delegationFilterService.updateFilterSignal({ searchText: value, pageNumber: 1 });
    this.delegationSearchSubject.next(value ?? '');
  }

  onClearFilters() {
    this.onSearchTextChange('');
    this.delegationFilterService.clearAllFilters();
    this.delegationFilterService.updateFilterSignal({ searchText: '' });
  }
}

