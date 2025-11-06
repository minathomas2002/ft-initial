import { TooltipModule } from 'primeng/tooltip';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { take } from 'rxjs';
import { TableLayoutComponent } from 'src/app/shared/components/layout-components/table-layout/table-layout.component';
import { TableSkeletonComponent } from 'src/app/shared/components/skeletons/table-skeleton/table-skeleton.component';
import { UsersLookupsStore } from 'src/app/shared/stores/users/users-lookups.store';
import { UsersFilter } from '../../components/users-filter/users-filter';
import { ITableHeaderItem, IUser, IUserRecord, TUsersSortingKeys } from 'src/app/shared/interfaces';
import { UsersStore } from 'src/app/shared/stores/users/users.store';
import { DataTableComponent } from 'src/app/shared/components/layout-components/data-table/data-table.component';
import { UsersFilterService } from '../../services/users-filter/users-filter-service';
import { EUserStatus } from 'src/app/shared/enums/users.enum';
import { UserStatusMapper } from '../../classes/user-status-mapper';
import { BaseTagComponent } from 'src/app/shared/components/base-components/base-tag/base-tag.component';
import { UsersActionMenu } from '../../components/users-action-menu/users-action-menu';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-users-view',
  imports: [
    TableLayoutComponent,
    TableSkeletonComponent,
    DatePipe,
    UsersFilter, BaseTagComponent, DataTableComponent, TooltipModule,
    UsersActionMenu,
    DatePipe
  ],
  templateUrl: './users-view.html',
  styleUrl: './users-view.scss',
  providers: [UsersFilterService],
})
export class UsersView implements OnInit {
  usersLookupsStore = inject(UsersLookupsStore);
  usersStore = inject(UsersStore);
  headers = computed<ITableHeaderItem<TUsersSortingKeys>[]>(() => [
    {
      label: "ID",
      isSortable: true,
      sortingKey: "id"
    },
    {
      label: "Name",
      isSortable: true,
      sortingKey: "name"
    },
    {
      label: "Email",
      isSortable: true,
      sortingKey: "email"
    },
    {
      label: "Role",
      isSortable: true,
      sortingKey: "role"
    },
    {
      label: "Join Date",
      isSortable: true,
      sortingKey: "joinDate"
    },
    {
      label: "Status",
      isSortable: true,
      sortingKey: "status"
    }
    , {
      label: "Actions",
      isSortable: false,
    }
  ]);
  rows = computed<IUserRecord[]>(() => this.usersStore.list());
  filterService = inject(UsersFilterService);
  filter = this.filterService.filter;
  totalRecords = computed(() => this.usersStore.count());
  userStatusMapper = new UserStatusMapper();
  selectedRows = signal<IUserRecord[]>([]);

  ngOnInit(): void {
    this.usersLookupsStore.getUserTitles()
      .pipe(take(1))
      .subscribe();
    this.filterService.applyFilter()
  }
  getUserStatus(status: EUserStatus) {
    return this.userStatusMapper.mapUserStatusColor()[status];
  }
  onChangeRole(item: IUser) {
    console.log(item);
  }
  onDelete(item: IUser) {
    console.log(item);
  }
}
