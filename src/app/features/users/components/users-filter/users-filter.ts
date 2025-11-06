import { Component, computed, inject, model, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { UsersFilterService } from '../../services/users-filter/users-filter-service';
import { debounceTime, Subject, switchMap } from 'rxjs';
import { UsersLookupsStore } from 'src/app/shared/stores/users/users-lookups.store';

import { MultiSelectModule } from "primeng/multiselect";
import { ClearAllComponent } from 'src/app/shared/components/utility-components/clear-all/clear-all.component';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-users-filter',
  imports: [IconFieldModule, InputIconModule, InputTextModule, FormsModule, MultiSelectModule, ClearAllComponent, ButtonModule],
  templateUrl: './users-filter.html',
  styleUrl: './users-filter.scss',
})
export class UsersFilter {
  filterDrawerVisible = model<boolean>(false);
  disableFilterInputs = signal(false);
  usersFilterService = inject(UsersFilterService);
  filter = this.usersFilterService.filter;
  userSearchSubject = new Subject<string>();
  usersLookupsStore = inject(UsersLookupsStore);
  userTitles = computed(() => this.usersLookupsStore.userTitles());


  ngOnInit() {
    this.listenToSearchTextInputs();
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
