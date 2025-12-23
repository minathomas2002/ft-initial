import { Component, input } from '@angular/core';
import { Skeleton } from "primeng/skeleton";

@Component({
  selector: 'app-timeline-skeleton',
  imports: [Skeleton],
  templateUrl: './timeline-skeleton.html',
  styleUrl: './timeline-skeleton.scss',
})
export class TimelineSkeleton {

  isLoading = input<boolean>(false);
	items = Array.from({ length: 3 });
}
