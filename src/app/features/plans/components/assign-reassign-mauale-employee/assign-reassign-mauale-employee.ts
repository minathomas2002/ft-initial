import { Component, inject, input, model, output } from '@angular/core';
import { IAssignRequest, IPlanRecord } from 'src/app/shared/interfaces';
import { BaseDialogComponent } from "src/app/shared/components/base-components/base-dialog/base-dialog.component";
import { AssignReassignFormService } from '../../services/assign-reassign-form/assign-reassign-form-service';
import { TranslatePipe } from "../../../../shared/pipes/translate.pipe";
import { SystemEmployeesStore } from 'src/app/shared/stores/system-employees/system-employees.store';
import { take, tap } from 'rxjs';
import { BaseLabelComponent } from "src/app/shared/components/base-components/base-label/base-label.component";
import { Select } from "primeng/select";
import { ReactiveFormsModule } from '@angular/forms';
import { BaseErrorComponent } from "src/app/shared/components/base-components/base-error/base-error.component";
import { PlanStore } from 'src/app/shared/stores/plan/plan.store';
import { I18nService } from 'src/app/shared/services/i18n';
import { ToasterService } from 'src/app/shared/services/toaster/toaster.service';

@Component({
  selector: 'app-assign-reassign-mauale-employee',
  imports: [BaseDialogComponent, TranslatePipe, BaseLabelComponent, Select, ReactiveFormsModule, BaseErrorComponent],
  templateUrl: './assign-reassign-mauale-employee.html',
  styleUrl: './assign-reassign-mauale-employee.scss',
})
export class AssignReassignMaualeEmployee {

  dialogVisible = model<boolean>(false);
  onSuccess = output<void>();
  isReassignMode = input<boolean>(false);
  planRecord = model<IPlanRecord|null>(null);
  formService = inject(AssignReassignFormService);
  planStore = inject(PlanStore);
  activeSystemEmployees = this.planStore.activeEmployees;
  i18nService = inject(I18nService);
  toasterService = inject(ToasterService);
  
  

  ngOnInit(){
    this.loadActiveEmployees();
  }

  onConfirm(){
    const employeeName = this.activeSystemEmployees()?.find(x=> x.userId === this.formService.employeeId.value)?.nameEn;
    if(this.isReassignMode())
      this.reAssignEmployee(employeeName!);
    else{
      this.assignEmployee(employeeName!);
    }    
  }

  resetForm(){
    this.formService.resetForm();
  }

  loadActiveEmployees(){
    // To Do change endpoint name 
    this.planStore.getActiveEmployeesForPlans(this.planRecord()?.id!)
          .pipe(take(1))
          .subscribe();

  }

  assignEmployee(employeeName: string)
  {
    const request : IAssignRequest = {
      planId: this.planRecord()?.id!,
      employeeId: this.formService.employeeId.value!
    };
      this.planStore.assignEmployeeToPlan(request).pipe(
        tap((res) => {
          if (res.errors) {
            this.onSuccess.emit()
            this.dialogVisible.set(false);
            return;
          }
        }),
        take(1),
      )
      .subscribe({
        next: (res) => {
          if (res.success) {
            this.toasterService.success(this.i18nService.translate('assign.assignSuccessMsg',{employee: employeeName}));
            this.formService.resetForm();
            this.onSuccess.emit(); // update table
            this.dialogVisible.set(false);
          }
        }
      }
      );

  }
  reAssignEmployee(employeeName: string){
    const request : IAssignRequest = {
      planId: this.planRecord()?.id!,
      employeeId: this.formService.employeeId.value!
    };
      this.planStore.reassignEmployeeToPlan(request).pipe(
        tap((res) => {
          if (res.errors) {
            this.onSuccess.emit()
            this.dialogVisible.set(false);
            return;
          }
        }),
        take(1),
      )
      .subscribe({
        next: (res) => {
          if (res.success) {
            this.toasterService.success(this.i18nService.translate('assign.reassignSuccessMsg',{employee: employeeName}));
            this.formService.resetForm();
            this.onSuccess.emit(); // update table
            this.dialogVisible.set(false);
          }
        }
      }
      );
  }
}
