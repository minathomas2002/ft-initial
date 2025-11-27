import { Component, computed, inject, model, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { UsersFilterService } from '../../services/users-filter/users-filter-service';
import { debounceTime, Subject, switchMap } from 'rxjs';
import { UsersLookupsStore } from 'src/app/shared/stores/users/users-lookups.store';
import { MultiSelectModule } from "primeng/multiselect";
import { ButtonModule } from 'primeng/button';
import { I18nService } from 'src/app/shared/services/i18n/i18n.service';
import { UserRoleMapper } from '../../classes/user-role-mapper';
import { RolesStore } from 'src/app/shared/stores/roles/roles.store';
import { UserStatusMapper } from '../../classes/user-status-mapper';
import { TranslatePipe } from 'src/app/shared/pipes';

@Component({
  selector: 'app-employees-filter',
  imports: [IconFieldModule, InputIconModule, InputTextModule, FormsModule, MultiSelectModule, ButtonModule, TranslatePipe],
  templateUrl: './employees-filter.html',
  styleUrl: './employees-filter.scss',
})
export class EmployeesFilter {
  filterDrawerVisible = model<boolean>(false);
  disableFilterInputs = signal(false);
  usersFilterService = inject(UsersFilterService);
  filter = this.usersFilterService.filter;
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
        switchMap((res) => this.usersFilterService.performFilter$()),
      )
      .subscribe();
  }

  applyFilter() {
    this.usersFilterService.applyFilter();
  }
}

