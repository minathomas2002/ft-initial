import { Component, model } from '@angular/core';
import { IPlanRecord } from 'src/app/shared/interfaces';
import { BaseDialogComponent } from "../../base-components/base-dialog/base-dialog.component";
import { TimelineSkeleton } from "../../skeletons/timeline-skeleton/timeline-skeleton";
import { Timeline } from 'primeng/timeline';
import { Card } from "primeng/card";

interface EventItem {
    status?: string;
    date?: string;
    icon?: string;
    color?: string;
    image?: string;
}


@Component({
  selector: 'app-timeline-dialog',
  imports: [BaseDialogComponent, TimelineSkeleton, Timeline, Card],
  templateUrl: './timeline-dialog.html',
  styleUrl: './timeline-dialog.scss',
})
export class TimelineDialog {
  dialogVisible = model<boolean>(false);
  selectedPlan = model<IPlanRecord | null>();


  events: EventItem[];

    constructor() {
        this.events = [
            { status: 'Ordered', date: '15/10/2020 10:30', icon: 'pi pi-shopping-cart', color: '#9C27B0', image: 'game-controller.jpg' },
            { status: 'Processing', date: '15/10/2020 14:00', icon: 'pi pi-cog', color: '#673AB7' },
            { status: 'Shipped', date: '15/10/2020 16:15', icon: 'pi pi-shopping-cart', color: '#FF9800' },
            { status: 'Delivered', date: '16/10/2020 10:00', icon: 'pi pi-check', color: '#607D8B' }
        ];
    }

}
