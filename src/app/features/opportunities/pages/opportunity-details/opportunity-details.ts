import { Component, inject, OnInit, signal } from '@angular/core';
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

@Component({
  selector: 'app-opportunity-details',
  imports: [BaseCard, OpportunityDetailsCardInfoItem, Tooltip, BaseTagComponent, TranslatePipe, ButtonModule],
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
  isAnonymous = signal<boolean>(false);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    const isAnonymousData = this.route.snapshot.data['isAnonymous'];
    if (isAnonymousData !== undefined) {
      this.isAnonymous.set(isAnonymousData);
    }
    if (id) {
      this.opportunitiesStore.getOpportunityDetails(id).subscribe({
        next: (data) => {
          //after data load
        }
      });
    }
  }

  onBack() {
    this.router.navigate(['../']);
  }

  onApply() {
    if (this.authStore.isAuthenticated()) {
      this.toast.success('Not implemented in this sprint');
    } else {
      this.router.navigate(['/', ERoutes.auth, ERoutes.login]);
    }
  }
}
