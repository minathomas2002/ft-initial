import { Component, computed, inject, OnInit, signal } from '@angular/core';
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
import { ERoutes } from 'src/app/shared/enums';
import { CardsSkeleton } from 'src/app/shared/components/skeletons/cards-skeleton/cards-skeleton';
import { OpportunityActionsService } from '../../services/opportunity-actions/opportunity-actions-service';

@Component({
  selector: 'app-opportunity-details',
  imports: [BaseCard, OpportunityDetailsCardInfoItem, Tooltip, BaseTagComponent, TranslatePipe, ButtonModule, CardsSkeleton],
  templateUrl: './opportunity-details.html',
  styleUrl: './opportunity-details.scss',
})
export class OpportunityDetails implements OnInit {
  router = inject(Router);
  route = inject(ActivatedRoute);
  opportunitiesStore = inject(OpportunitiesStore);
  permissionService = inject(PermissionService);
  authStore = inject(AuthStore);
  toast = inject(ToasterService);
  getOpportunityTypeConfig = getOpportunityTypeConfig;
  opportunityActionsService = inject(OpportunityActionsService);
  isAnonymous = computed(() => !this.authStore.authResponse()?.token);
  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.opportunitiesStore.getOpportunityDetails(id).subscribe({
        next: (data) => {
          //after data load
        }
      });
    }
  }

  onBack() {
    if(this.isAnonymous()) {
      this.router.navigate(['/', ERoutes.anonymous, ERoutes.opportunities]);
    } else if(this.permissionService.canAccessOnOpportunityAdmin()) {
      this.router.navigate(['/', ERoutes.admin, ERoutes.opportunities]);
    }else {
      this.router.navigate(['/', ERoutes.opportunities]);
    }
  }

  onApply() {
    if (this.authStore.isAuthenticated()) {
      this.toast.success('Not implemented in this sprint');
    } else {
      this.router.navigate(['/', ERoutes.auth, ERoutes.login]);
    }
  }
}
