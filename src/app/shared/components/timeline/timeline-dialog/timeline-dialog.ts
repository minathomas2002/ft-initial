import { Component, inject, input, model } from '@angular/core';
import { IPlanRecord } from 'src/app/shared/interfaces';
import { TimelineSkeleton } from "../../skeletons/timeline-skeleton/timeline-skeleton";
import { BaseDrawerComponent } from "../../base-components/base-drawer/base-drawer.component";
import { PlanStore } from 'src/app/shared/stores/plan/plan.store';
import { take } from 'rxjs';
import { TimelineComponent } from "../plan-timeline-component/plan-timeline-component";

@Component({
  selector: 'app-timeline-dialog',
  imports: [TimelineSkeleton, BaseDrawerComponent, TimelineComponent],
  templateUrl: './timeline-dialog.html',
  styleUrl: './timeline-dialog.scss',
})
export class TimelineDialog {
  dialogVisible = model<boolean>(false);
  planId = input.required<string | null>()
  planStore = inject(PlanStore);
  timeLineEvents = this.planStore.timeLineList;

  ngOnInit() {
    this.loadTimelineData();
  }

  loadTimelineData() {
    if (this.planId()) {
      this.planStore.getTimelinePlan(this.planId()!)
        .pipe(take(1))
        .subscribe();
    }
  }

}
