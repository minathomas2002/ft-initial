import { Component, input, model, output } from '@angular/core';
import { IPlanRecord } from 'src/app/shared/interfaces';

@Component({
  selector: 'app-assign-reassign-mauale-employee',
  imports: [],
  templateUrl: './assign-reassign-mauale-employee.html',
  styleUrl: './assign-reassign-mauale-employee.scss',
})
export class AssignReassignMaualeEmployee {

  dialogVisible = model<boolean>(false);
  onSuccess = output<void>();
  isReassignMode = input<boolean>(false);
  planRecord = model<IPlanRecord|null>(null);


  ngOnInit(){
    this.loadActiveEmployees();
  }

  loadActiveEmployees(){
    // load active users by plan id 

  }
}
