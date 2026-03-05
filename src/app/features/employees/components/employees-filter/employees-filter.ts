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
import { OverlayBadgeModule } from 'primeng/overlaybadge';
import { BadgeModule } from 'primeng/badge';

@Component({
  selector: 'app-employees-filter',
  imports: [
    IconFieldModule,
    InputIconModule,
    InputTextModule,
    FormsModule,
    MultiSelectModule,
    ButtonModule,
    TranslatePipe,
    OverlayBadgeModule,
    BadgeModule,
  ],
  templateUrl: './employees-filter.html',
  styleUrl: './employees-filter.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmployeesFilter {
  filterDrawerVisible = model<boolean>(false);
  disableFilterInputs = signal(false);
  employeesFilterService = inject(EmployeesFilterService);
  filter = this.employeesFilterService.filter;
  employeeSearchSubject = new Subject<string>();
  systemEmployeesStore = inject(SystemEmployeesStore);
  i18nService = inject(I18nService);
  roleStore = inject(RolesStore);
  employeeRoleMapper = new EmployeeRoleMapper(this.i18nService);
  userStatusMapper = new UserStatusMapper(this.i18nService);
  destroyRef = inject(DestroyRef);
  employeeRoles = computed(() =>
    this.roleStore.systemRoles().map((role: any) => ({
      label: role.name,
      value: role.id
    })).filter((option: any) => option.value !== undefined)
  );

  userStatuses = computed(() => this.userStatusMapper.getMappedStatusList());

  ngOnInit() {
    this.listenToSearchTextInputs();
    this.roleStore.getSystemRoles().pipe(take(1)).subscribe();
  }

  listenToSearchTextInputs() {
    this.employeeSearchSubject
      .pipe(
        debounceTime(700),
        distinctUntilChanged(),
        switchMap((res) => this.employeesFilterService.performFilter$()),
        takeUntilDestroyed(this.destroyRef)
      ).subscribe();
  }

  applyFilter() {
    this.employeesFilterService.applyFilter();
  }

  onSearchTextChange(value: string) {
    this.employeesFilterService.updateFilterSignal({ searchText: value, pageNumber: 1 });
    this.employeeSearchSubject.next(value ?? '');
  }

  onClearFilters() {
    this.onSearchTextChange('');
    this.employeesFilterService.clearAllFilters();
    this.employeesFilterService.updateFilterSignal({ searchText: '' });
  }
}

