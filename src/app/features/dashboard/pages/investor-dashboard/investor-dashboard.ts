import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { TableLayoutComponent } from 'src/app/shared/components/layout-components/table-layout/table-layout.component';

@Component({
  selector: 'app-investor-dashboard',
  imports: [
    TableLayoutComponent,
    ButtonModule
  ],
  templateUrl: './investor-dashboard.html',
  styleUrl: './investor-dashboard.scss',
})
export class InvestorDashboard {

}
