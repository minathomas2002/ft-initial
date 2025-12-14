import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { ChipModule } from 'primeng/chip';
import { OpportunitiesFilterService } from '../../services/opportunities-filter/investor-opportunities-filter-service';
import { DataCards } from 'src/app/shared/components/layout-components/data-cards/data-cards';
import { OpportunityCard } from 'src/app/shared/components/opportunities/opportunity-card/opportunity-card';
import { CardsPageLayout } from 'src/app/shared/components/layout-components/cards-page-layout/cards-page-layout';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthStore } from 'src/app/shared/stores/auth/auth.store';
import { ERoutes } from 'src/app/shared/enums';
import { CardsSkeleton } from 'src/app/shared/components/skeletons/cards-skeleton/cards-skeleton';
import { TranslatePipe } from 'src/app/shared/pipes';
import { PermissionService } from 'src/app/shared/services/permission/permission-service';
import { IOpportunity } from 'src/app/shared/interfaces';
import { ToasterService } from 'src/app/shared/services/toaster/toaster.service';
import { BaseTagComponent } from 'src/app/shared/components/base-components/base-tag/base-tag.component';
import { OpportunitiesFilters } from '../../components/opportunities-filter/opportunities-filters';
import { getOpportunityTypeConfig } from 'src/app/shared/utils/opportunities.utils';

@Component({
  selector: 'app-opportunities-list',
  imports: [
    CardsPageLayout,
    OpportunityCard,
    ButtonModule,
    ChipModule,
    DataCards,
    CardsSkeleton,
    TranslatePipe,
    BaseTagComponent,
    OpportunitiesFilters
  ],
  templateUrl: './opportunities-list.html',
  styleUrl: './opportunities-list.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OpportunitiesList implements OnInit {
  readonly permissionService = inject(PermissionService);
  filterService = inject(OpportunitiesFilterService);
  router = inject(Router);
  authStore = inject(AuthStore);
  route = inject(ActivatedRoute);
  toast = inject(ToasterService);

  totalRecords = signal<number>(10);
  filter = this.filterService.filter;
  opportunitiesStore = this.filterService.store;
  isAnonymous = signal<boolean>(false);

  ngOnInit(): void {
    const isAnonymousData = this.route.snapshot.data['isAnonymous'];
    if (isAnonymousData !== undefined) {
      this.isAnonymous.set(isAnonymousData);
    }
    this.filterService.applyFilter();
  }

  onViewDetails(opportunity: IOpportunity) {
    if (this.isAnonymous()) {
      this.router.navigate(['/', ERoutes.anonymous, ERoutes.opportunities, opportunity.id], {
        queryParams: { from: 'list' }
      });
    } else {
      this.router.navigate(['/', ERoutes.opportunities, opportunity.id], {
        queryParams: { from: 'list' }
      });
    }
  }

  onApply(opportunity: IOpportunity) {
    if (this.authStore.isAuthenticated()) {
      this.toast.success('Not implemented in this sprint');
    } else {
      this.router.navigate(['/', ERoutes.auth, ERoutes.login]);
    }
  }

  getOpportunityIcon(opportunity: IOpportunity) {
    switch (opportunity.opportunityType) {
      case 1:
        return 'icon-flag';
      case 2:
        return 'icon-idea';
      default:
        return 'icon-search';
    }
  }

  getOpportunityTypeConfig = getOpportunityTypeConfig;
}
