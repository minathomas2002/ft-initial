import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { RoleManagementFilterService } from '../../services/role-management-filter/role-management-filter-service';
import { debounceTime, Subject, switchMap } from 'rxjs';
import { UsersLookupsStore } from 'src/app/shared/stores/users/users-lookups.store';
import { MultiSelectModule } from "primeng/multiselect";
import { ButtonModule } from 'primeng/button';
import { I18nService } from 'src/app/shared/services/i18n/i18n.service';
import { UserRoleMapper } from '../../classes/user-role-mapper';
import { RolesStore } from 'src/app/shared/stores/roles/roles.store';
import { UserStatusMapper } from '../../classes/user-status-mapper';
import { TranslatePipe } from 'src/app/shared/pipes';
import { DatePickerModule } from 'primeng/datepicker';
import { DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-role-management-filters',
  imports: [
    IconFieldModule, 
    InputIconModule, 
    InputTextModule, 
    FormsModule, 
    MultiSelectModule, 
    ButtonModule, 
    TranslatePipe,
    DatePickerModule
  ],
  templateUrl: './role-management-filters.html',
  styleUrl: './role-management-filters.scss',
})
export class RoleManagementFilters implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  filterDrawerVisible = signal<boolean>(false);
  disableFilterInputs = signal(false);
  roleManagementFilterService = inject(RoleManagementFilterService);
  filter = this.roleManagementFilterService.filter;
  userSearchSubject = new Subject<string>();
  usersLookupsStore = inject(UsersLookupsStore);
  i18nService = inject(I18nService);
  roleStore = inject(RolesStore);
  userRoleMapper = new UserRoleMapper(this.i18nService);
  userRoles = computed(() => 
    this.roleStore.list().map(role => ({
      label: this.userRoleMapper.getTranslatedRole(role.code),
      value: role.id
    })).filter(option => option.value !== undefined)
  );
  userStatusMapper = new UserStatusMapper(this.i18nService);
  userStatuses = this.userStatusMapper.getMappedStatusList();

  ngOnInit() {
    this.listenToSearchTextInputs();    
    this.roleStore.getUserRoles().subscribe();
  }

  listenToSearchTextInputs() {
    this.userSearchSubject
      .pipe(
        debounceTime(700),
        switchMap((res) => this.roleManagementFilterService.performFilter$()),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe();
  }

  applyFilter() {
    this.roleManagementFilterService.applyFilter();
  }

  onSearchTextChange(value: string) {
    this.roleManagementFilterService.updateFilterSignal({ searchText: value, pageNumber: 1 });
    this.userSearchSubject.next(value ?? '');
  }

  onPickerChange(value: Date[] | undefined) {
    value = value?.filter((x) => !!x) ?? [];
    if (!!value && (value.length == 2 || value.length == 0)) {
      this.roleManagementFilterService.applyFilterWithPaging();
    }
  }

  onClearFilters() {
    this.roleManagementFilterService.clearAllFilters();
  }
}

