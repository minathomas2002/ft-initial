import { Component, inject, input, model, output } from '@angular/core';
import { IPlanRecord } from 'src/app/shared/interfaces';
import { BaseDialogComponent } from "src/app/shared/components/base-components/base-dialog/base-dialog.component";
import { AssignReassignFormService } from '../../services/assign-reassign-form/assign-reassign-form-service';
import { TranslatePipe } from "../../../../shared/pipes/translate.pipe";
import { SystemEmployeesStore } from 'src/app/shared/stores/system-employees/system-employees.store';
import { take } from 'rxjs';
import { BaseLabelComponent } from "src/app/shared/components/base-components/base-label/base-label.component";
import { Select } from "primeng/select";
import { ReactiveFormsModule } from '@angular/forms';
import { BaseErrorComponent } from "src/app/shared/components/base-components/base-error/base-error.component";

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
  systemEmployeesStore = inject(SystemEmployeesStore);
  activeSystemEmployees = this.systemEmployeesStore.activeEmployees;

  ngOnInit(){
    this.loadActiveEmployees();
  }

  onConfirm(){
    console.log("apply assign / reassign ");
    
  }

  resetForm(){
    this.formService.resetForm();
  }

  loadActiveEmployees(){
    // To Do change endpoint name 
    this.systemEmployeesStore.getActiveEmployeesForPlans(this.planRecord()?.id!)
          .pipe(take(1))
          .subscribe();

  }
}
