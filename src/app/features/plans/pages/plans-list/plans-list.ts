import { Component, OnInit, signal, Signal } from '@angular/core';
import { Button } from "primeng/button";
import { TranslatePipe } from "../../../../shared/pipes/translate.pipe";
import { EPlanStatus, IPlanRecord } from 'src/app/shared/interfaces';
import { EOpportunityType } from 'src/app/shared/enums';
import { AssignReassignManualEmployee } from "../../components/assign-reassign-manual-employee/assign-reassign-manual-employee";

@Component({
  selector: 'app-plans-list',
  imports: [Button, TranslatePipe, AssignReassignManualEmployee],
  templateUrl: './plans-list.html',
  styleUrl: './plans-list.scss',
})
export class PlansList implements OnInit {
  planItem: IPlanRecord = {
    id: '',
    planId: '',
    planCode: '#334',
    title: 'plan B',
    planType: EOpportunityType.PRODUCT,
    submissionDate: '2025-12-31',
    slaCountDown: 10, // days remaining
    status: EPlanStatus.PENDING,
  };
  viewAssignDialog = signal<boolean>(false);

  ngOnInit() {
  }


  onAssign(item: IPlanRecord) {
    this.viewAssignDialog.set(true);
    this.planItem = item;
  }

  ApplyFilter() {

  }
}
