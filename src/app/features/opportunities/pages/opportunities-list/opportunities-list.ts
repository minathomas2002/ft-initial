import { ChangeDetectionStrategy, Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { ChipModule } from 'primeng/chip';
import { OpportunitiesFilterService } from '../../services/opportunities-filter/investor-opportunities-filter-service';
import { DataCards } from 'src/app/shared/components/layout-components/data-cards/data-cards';
import { OpportunityCard } from 'src/app/shared/components/opportunities/opportunity-card/opportunity-card';
import { CardsPageLayout } from 'src/app/shared/components/layout-components/cards-page-layout/cards-page-layout';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthStore } from 'src/app/shared/stores/auth/auth.store';
import { EOpportunityType, ERoutes } from 'src/app/shared/enums';
import { CardsSkeleton } from 'src/app/shared/components/skeletons/cards-skeleton/cards-skeleton';
import { TranslatePipe } from 'src/app/shared/pipes';
import { PermissionService } from 'src/app/shared/services/permission/permission-service';
import { IOpportunity } from 'src/app/shared/interfaces';
import { ToasterService } from 'src/app/shared/services/toaster/toaster.service';
import { BaseTagComponent } from 'src/app/shared/components/base-components/base-tag/base-tag.component';
import { OpportunitiesFilters } from '../../components/opportunities-filter/opportunities-filters';
import { getOpportunityTypeConfig } from 'src/app/shared/utils/opportunities.utils';
import { ProductLocalizationPlanWizard } from 'src/app/shared/components/plans/plan-localization/product-localization-plan-wizard/product-localization-plan-wizard';
import { PlanStore } from 'src/app/shared/stores/plan/plan.store';
import { PlanTermsAndConditionsDialog } from 'src/app/shared/components/plans/plan-terms-and-conditions-dialog/plan-terms-and-conditions-dialog';
import { NewPlanDialog } from 'src/app/shared/components/plans/new-plan-dialog/new-plan-dialog';

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
    OpportunitiesFilters,
    ProductLocalizationPlanWizard,
    PlanTermsAndConditionsDialog,
    NewPlanDialog
  ],
  templateUrl: './opportunities-list.html',
  styleUrl: './opportunities-list.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OpportunitiesList implements OnInit, OnDestroy {
  readonly permissionService = inject(PermissionService);
  filterService = inject(OpportunitiesFilterService);
  private readonly planStore = inject(PlanStore);
  router = inject(Router);
  authStore = inject(AuthStore);
  route = inject(ActivatedRoute);
  toast = inject(ToasterService);

  totalRecords = signal<number>(10);
  filter = this.filterService.filter;
  opportunitiesStore = this.filterService.store;
  isAnonymous = signal<boolean>(false);

  productLocalizationPlanWizardVisibility = signal<boolean>(false);
  planTermsAndConditionsDialogVisibility = signal<boolean>(false);
  newPlanDialogVisibility = signal<boolean>(false);

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
      this.opportunitiesStore.checkApplyOpportunity(opportunity.id).subscribe((res) => {
        if (res.body) {
          this.applyOpportunity(opportunity);
        } else {
          this.toast.warn('Application is not allowed while an in-progress plan exists for the selected opportunity.');
        }
      });

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

  applyOpportunity(opportunity: IOpportunity) {
    if (opportunity.opportunityType === EOpportunityType.SERVICES) {
      this.toast.warn('Apply for services opportunity will be available soon');
      return;
    }
    if (!opportunity.isOtherOpportunity) {
      this.planStore.setIsPresetSelected(true);
    }
    this.planStore.setAvailableOpportunities({ id: opportunity.id, name: opportunity.title });
    this.planStore.setAppliedOpportunity(opportunity);
    this.planStore.setWizardMode('create');
    this.planTermsAndConditionsDialogVisibility.set(true);
    this.planStore.setNewPlanOpportunityType(opportunity.opportunityType);
  }

  onUserReadAndApproved() {
    this.planTermsAndConditionsDialogVisibility.set(false);
    this.newPlanDialogVisibility.set(true);
  }

  onUserConfirmNewPlanDialog() {
    if (this.planStore.newPlanOpportunityType() === EOpportunityType.SERVICES) {
      this.toast.warn('Apply for services opportunity will be available soon');
      return;
    }
    this.newPlanDialogVisibility.set(false);
    this.productLocalizationPlanWizardVisibility.set(true);
  }

  ngOnDestroy(): void {
    this.planStore.resetIsPresetSelected();
    this.planStore.resetNewPlanOpportunityType();
    this.planStore.resetNewPlanTitle();
    this.planStore.resetAppliedOpportunity();
  }
}
