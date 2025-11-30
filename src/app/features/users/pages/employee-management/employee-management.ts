import { Component } from '@angular/core';
import { TabsModule } from 'primeng/tabs';
import { EmployeeList } from '../employee-list/employee-list';
import { TranslatePipe } from 'src/app/shared/pipes';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-employee-management',
  imports: [TabsModule, EmployeeList, TranslatePipe, ButtonModule],
  templateUrl: './employee-management.html',
  styleUrl: './employee-management.scss',
})
export class EmployeeManagement {
  onAddEmployee() {
    console.log('add employee');
  }
}
