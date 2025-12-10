import { Component, computed, inject, output, signal } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { TableLayoutComponent } from 'src/app/shared/components/layout-components/table-layout/table-layout.component';
import { NewPlanDialog } from 'src/app/shared/components/plans/new-plan-dialog/new-plan-dialog';
import { PlanTermsAndConditionsDialog } from 'src/app/shared/components/plans/plan-terms-and-conditions-dialog/plan-terms-and-conditions-dialog';
import { EOpportunityType } from 'src/app/shared/enums';
import { PlanStore } from 'src/app/shared/stores/plan/plan.store';
import { TranslatePipe } from 'src/app/shared/pipes';

@Component({
  selector: 'app-investor-dashboard',
  imports: [
    TableLayoutComponent,
    ButtonModule,
    PlanTermsAndConditionsDialog,
    NewPlanDialog,
    TranslatePipe
  ],
  templateUrl: './investor-dashboard.html',
  styleUrl: './investor-dashboard.scss',
})
export class InvestorDashboard {
  planTermsAndConditionsDialogVisibility = signal(false);
  newPlanDialogVisibility = signal(false);

  private readonly planStore = inject(PlanStore);
  newPlanOpportunityType = computed(() => this.planStore.newPlanOpportunityType());

  onUserReadAndApproved() {
    this.planTermsAndConditionsDialogVisibility.set(false);
    this.planStore.resetNewPlanOpportunityType();
    this.newPlanDialogVisibility.set(true);
  };


  onUserConfirmNewPlanDialog() {
    this.planStore.getActiveOpportunityLookUps();
    this.newPlanDialogVisibility.set(false);
    if (this.newPlanOpportunityType() && this.newPlanOpportunityType()! === EOpportunityType.MATERIAL) {
      console.log('material');
    } else {
      console.log('service');
    }
  }
}
