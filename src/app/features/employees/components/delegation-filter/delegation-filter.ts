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
        switchMap((res) => this.delegationFilterService.performFilter$()),
        takeUntilDestroyed(this.destroyRef)
      ).subscribe();
  }

  applyFilter() {
    this.delegationFilterService.applyFilter();
  }
}

