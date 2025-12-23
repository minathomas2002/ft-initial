import { Component, model } from '@angular/core';
import { IPlanRecord } from 'src/app/shared/interfaces';
import { BaseDialogComponent } from "../../base-components/base-dialog/base-dialog.component";

@Component({
  selector: 'app-timeline-dialog',
  imports: [BaseDialogComponent],
  templateUrl: './timeline-dialog.html',
  styleUrl: './timeline-dialog.scss',
})
export class TimelineDialog {
  dialogVisible = model<boolean>(false);
  selectedPlan = model<IPlanRecord | null>();

}
