import { Component, output, signal } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { TableLayoutComponent } from 'src/app/shared/components/layout-components/table-layout/table-layout.component';
import { PlanTermsAndConditionsDialog } from 'src/app/shared/components/plans/plan-terms-and-conditions-dialog/plan-terms-and-conditions-dialog';

@Component({
  selector: 'app-investor-dashboard',
  imports: [
    TableLayoutComponent,
    ButtonModule,
    PlanTermsAndConditionsDialog
  ],
  templateUrl: './investor-dashboard.html',
  styleUrl: './investor-dashboard.scss',
})
export class InvestorDashboard {
  planTermsAndConditionsDialogVisibility = signal(false);

  onUserReadAndApproved() {
    console.log('user read and approved');
    this.planTermsAndConditionsDialogVisibility.set(false);
  };

  onUserCancelTermsAndConditionsDialog() {
    console.log('user canceled terms and conditions dialog');
  };
}
