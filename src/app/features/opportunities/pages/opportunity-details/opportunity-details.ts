import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Tooltip } from 'primeng/tooltip';
import { ButtonModule } from 'primeng/button';
import { BaseCard } from 'src/app/shared/components/base-components/base-card/base-card';
import { OpportunityDetailsCardInfoItem } from '../../components/opportunity-details-card-info-item/opportunity-details-card-info-item';
import { OpportunitiesStore } from 'src/app/shared/stores/opportunities/opportunities.store';
import { BaseTagComponent } from 'src/app/shared/components/base-components/base-tag/base-tag.component';
import { TranslatePipe } from 'src/app/shared/pipes';
import { getOpportunityTypeConfig } from 'src/app/shared/utils/opportunities.utils';
import { PermissionService } from 'src/app/shared/services/permission/permission-service';
import { AuthStore } from 'src/app/shared/stores/auth/auth.store';
import { ToasterService } from 'src/app/shared/services/toaster/toaster.service';
import { EOpportunityAction, ERoutes, EViewMode, EOpportunityType } from 'src/app/shared/enums';
import { CardsSkeleton } from 'src/app/shared/components/skeletons/cards-skeleton/cards-skeleton';
import { OpportunityActionsService } from '../../services/opportunity-actions/opportunity-actions-service';
import { take } from 'rxjs';
import { OpportunityActionMenuComponent } from 'src/app/shared/components/opportunities/opportunity-action-menu/opportunity-action-menu.component';
import { AdminOpportunitiesStore } from 'src/app/shared/stores/admin-opportunities/admin-opportunities.store';
import { GeneralConfirmationDialogComponent } from 'src/app/shared/components/utility-components/general-confirmation-dialog/general-confirmation-dialog.component';
import { CreateEditOpportunityDialog } from '../../components/create-edit-opportunity-dialog/create-edit-opportunity-dialog';
import { ImageErrorDirective } from 'src/app/shared/directives/image-error.directive';
import { IOpportunity } from 'src/app/shared/interfaces';
import { PlanStore } from 'src/app/shared/stores/plan/plan.store';
import { ProductLocalizationPlanWizard } from 'src/app/shared/components/plans/plan-localization/product-localization-plan-wizard/product-localization-plan-wizard';

@Component({
  selector: 'app-opportunity-details',
  imports: [
    BaseCard,
    OpportunityDetailsCardInfoItem,
    Tooltip,
    BaseTagComponent,
    TranslatePipe,
    ButtonModule,
    CardsSkeleton,
    OpportunityActionMenuComponent,
    GeneralConfirmationDialogComponent,
    CreateEditOpportunityDialog,
    ImageErrorDirective,
    ProductLocalizationPlanWizard
  ],
  templateUrl: './opportunity-details.html',
  styleUrl: './opportunity-details.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OpportunityDetails implements OnInit {
  router = inject(Router);
  route = inject(ActivatedRoute);
  opportunitiesStore = inject(OpportunitiesStore);
  permissionService = inject(PermissionService);
  planStore = inject(PlanStore);
  authStore = inject(AuthStore);
  toast = inject(ToasterService);
  getOpportunityTypeConfig = getOpportunityTypeConfig;
  opportunityActionsService = inject(OpportunityActionsService);
  isAnonymous = computed(() => !this.authStore.authResponse()?.token);
  adminOpportunitiesStore = inject(AdminOpportunitiesStore);
  createEditOpportunityDialogVisible = signal<boolean>(false);
  deleteConfirmDialogVisible = signal<boolean>(false);
  moveToDraftConfirmDialogVisible = signal<boolean>(false);
  publishConfirmDialogVisible = signal<boolean>(false);
  opportunityId = signal<string | null>(null);
  productLocalizationPlanWizardVisibility = signal<boolean>(false);
  get EOpportunityAction() {
    return EOpportunityAction;
  }

  today = new Date();

  forecastedDemand = computed(() => {
    return `Forecasted SEC Demand (${this.today.getFullYear()}–${this.today.getFullYear() + 5})`
  })

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.opportunityId.set(id);
      this.getOpportunityDetails();
    }
  }

  getOpportunityDetails() {
    this.opportunitiesStore.getOpportunityDetails(this.opportunityId()!)
      .pipe(take(1))
      .subscribe();
  }

  onBack() {
    if (this.isAnonymous()) {
      this.router.navigate(['/', ERoutes.anonymous, ERoutes.opportunities]);
    } else if (this.permissionService.canAccessOnOpportunityAdmin()) {
      this.router.navigate(['/', ERoutes.opportunities, ERoutes.admin]);
    } else {
      this.router.navigate(['/', ERoutes.opportunities]);
    }
  }

  onApply() {
    if (this.authStore.isAuthenticated()) {
      this.opportunitiesStore.checkApplyOpportunity(this.opportunityId()!).subscribe((res) => {
        if (res.body) {
          this.applyOpportunity(this.opportunityId()!, this.opportunitiesStore.details()?.title ?? '');
        } else {
          this.toast.warn('Application is not allowed while an in-progress plan exists for the selected opportunity.');
        }
      });

    } else {
      this.router.navigate(['/', ERoutes.auth, ERoutes.login]);
    }
  }


  onAction(action: EOpportunityAction) {
    // Handle actions (Edit, Delete, MoveToDraft, Publish)
    switch (action) {
      case EOpportunityAction.Edit:
        // Open edit dialog
        this.adminOpportunitiesStore.setViewMode(EViewMode.Edit);
        this.adminOpportunitiesStore.setSelectedOpportunityId(this.opportunityId()!);
        this.createEditOpportunityDialogVisible.set(true);
        break;
      case EOpportunityAction.Delete:
        // Handle delete
        this.deleteConfirmDialogVisible.set(true);
        break;
      case EOpportunityAction.MoveToDraft:
        // Handle move to draft
        this.moveToDraftConfirmDialogVisible.set(true);
        break;
      case EOpportunityAction.Publish:
        // Handle publish
        this.publishConfirmDialogVisible.set(true);
        break;
    }
  }

  handelDeleteOpportunity() {
    this.deleteConfirmDialogVisible.set(true);
  }

  deleteOpportunity() {
    this.adminOpportunitiesStore.deleteOpportunity(this.opportunityId()!)
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.deleteConfirmDialogVisible.set(false);
          this.toast.success('Opportunity deleted successfully');
          this.onBack();
        },
        error: () => {
          this.deleteConfirmDialogVisible.set(false);
        }
      });
  }

  moveToDraftOpportunity() {
    this.adminOpportunitiesStore.moveToDraftOpportunity(this.opportunityId()!)
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.toast.success('Opportunity moved to draft successfully');
          this.moveToDraftConfirmDialogVisible.set(false);
          this.getOpportunityDetails();
        }
      });
  }

  publishOpportunity() {
    this.adminOpportunitiesStore.publishOpportunity(this.opportunityId()!)
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.toast.success('Opportunity published successfully');
          this.publishConfirmDialogVisible.set(false);
          this.getOpportunityDetails();
        }
      });
  }

  applyOpportunity(opportunityId: string, opportunityTitle: string) {
    this.planStore.setAvailableOpportunities({ id: opportunityId, name: opportunityTitle });
    this.planStore.setAppliedOpportunity({
      id: opportunityId,
      title: opportunityTitle,
      shortDescription: '',
      opportunityType: this.opportunitiesStore.details()?.opportunityType!,
      isApplied: false,
      isOtherOpportunity: false,
      icon: ''
    });
    this.planStore.setWizardMode('create');
    this.planStore.setSelectedPlanId(null);
    this.productLocalizationPlanWizardVisibility.set(true);
  }
}
