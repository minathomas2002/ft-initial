import { Component, OnInit } from '@angular/core';
import { TabsModule } from 'primeng/tabs';
import { EmployeeList } from '../employee-list/employee-list';
import { RoleManagement } from '../role-management/role-management';
import { TranslatePipe } from 'src/app/shared/pipes';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-employee-management',
  imports: [CommonModule, TabsModule, EmployeeList, RoleManagement, TranslatePipe, ButtonModule],
  templateUrl: './employee-management.html',
  styleUrl: './employee-management.scss',
})
export class EmployeeManagement {
  onAddEmployee() {
    console.log('add employee');
  }
}
