import { DatePipe } from '@angular/common';
import { Component, computed, inject, OnInit } from '@angular/core';
import { TableLayoutComponent } from 'src/app/shared/components/layout-components/table-layout/table-layout.component';
import { TableSkeletonComponent } from 'src/app/shared/components/skeletons/table-skeleton/table-skeleton.component';
import { DataTableComponent } from 'src/app/shared/components/layout-components/data-table/data-table.component';
import { IInvestorRecord, ITableHeaderItem, TInvestorsSortingKeys } from 'src/app/shared/interfaces';
import { InvestorsStore } from 'src/app/shared/stores/investors/investors.store';
import { InvestorsFilterService } from '../../services/investors-filter/investors-filter-service';
import { InvestorsFilter } from '../../components/investors-filter/investors-filter';
import { I18nService } from 'src/app/shared/services/i18n/i18n.service';
import { AvatarModule } from 'primeng/avatar';

@Component({
  selector: 'app-investors-list',
  imports: [
    TableLayoutComponent,
    TableSkeletonComponent,
    DataTableComponent,
    DatePipe,
    InvestorsFilter,
    AvatarModule
  ],
  templateUrl: './investors-list.html',
  styleUrl: './investors-list.scss',
  providers: [InvestorsFilterService],
})
export class InvestorsList implements OnInit {
  private readonly investorsStore = inject(InvestorsStore);
  readonly filterService = inject(InvestorsFilterService);
  private readonly i18nService = inject(I18nService);

  readonly headers = computed<ITableHeaderItem<TInvestorsSortingKeys>[]>(() => [
    { label: this.i18nService.translate('investors.table.name'), isSortable: true, sortingKey: 'fullName' },
    { label: this.i18nService.translate('investors.table.email'), isSortable: false, sortingKey: 'email' },
    { label: this.i18nService.translate('investors.table.phoneNumber'), isSortable: false, sortingKey: 'phoneNumber' },
    { label: this.i18nService.translate('investors.table.otherNumber'), isSortable: false, sortingKey: 'otherPhone' },
    { label: this.i18nService.translate('investors.table.submittedPlans'), isSortable: true, sortingKey: 'numberOfSubmittedPlans' },
    { label: this.i18nService.translate('investors.table.joinDate'), isSortable: true, sortingKey: 'joinDate' },
  ]);

  readonly rows = computed<IInvestorRecord[]>(() => this.investorsStore.list());
  readonly totalRecords = computed(() => this.investorsStore.count());
  readonly isLoading = computed(() => this.investorsStore.loading());

  ngOnInit(): void {
    this.filterService.applyFilter();
  }

}