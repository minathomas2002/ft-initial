import { Component, computed, inject, output, signal } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { take } from 'rxjs';
import { TableLayoutComponent } from 'src/app/shared/components/layout-components/table-layout/table-layout.component';
import { MaterialsSourcingPlanWizard } from 'src/app/shared/components/plans/materials-sourcing-plan-wizard/materials-sourcing-plan-wizzard/materials-sourcing-plan-wizard';
import { NewPlanDialog } from 'src/app/shared/components/plans/new-plan-dialog/new-plan-dialog';
import { PlanTermsAndConditionsDialog } from 'src/app/shared/components/plans/plan-terms-and-conditions-dialog/plan-terms-and-conditions-dialog';
import { EOpportunityType } from 'src/app/shared/enums';
import { PlanStore } from 'src/app/shared/stores/plan/plan.store';

@Component({
  selector: 'app-investor-dashboard',
  imports: [
    TableLayoutComponent,
    ButtonModule,
    PlanTermsAndConditionsDialog,
    NewPlanDialog,
    MaterialsSourcingPlanWizard
  ],
  templateUrl: './investor-dashboard.html',
  styleUrl: './investor-dashboard.scss',
})
export class InvestorDashboard {
  planTermsAndConditionsDialogVisibility = signal(false);
  newPlanDialogVisibility = signal(false);
  materialsSourcingPlanWizardVisibility = signal(false);

  private readonly planStore = inject(PlanStore);
  newPlanOpportunityType = computed(() => this.planStore.newPlanOpportunityType());

  onUserReadAndApproved() {
    this.planTermsAndConditionsDialogVisibility.set(false);
    this.planStore.resetNewPlanOpportunityType();
    this.newPlanDialogVisibility.set(true);
  };


  onUserConfirmNewPlanDialog() {
    this.planStore.getActiveOpportunityLookUps().pipe(take(1)).subscribe();
    this.newPlanDialogVisibility.set(false);
    if (this.newPlanOpportunityType() && this.newPlanOpportunityType()! === EOpportunityType.MATERIAL) {
      this.materialsSourcingPlanWizardVisibility.set(true);
    } else {
      console.log('service');
    }
  }
}
