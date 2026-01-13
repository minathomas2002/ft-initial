import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { IPageComment } from 'src/app/shared/interfaces/plans.interface';

@Component({
  selector: 'app-summary-comments',
  imports: [],
  templateUrl: './summary-comments.html',
  styleUrl: './summary-comments.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SummaryComments {
  pageComments = input.required<IPageComment[]>();

  hasComments = computed(() => {
    return this.pageComments().length > 0 && this.pageComments().some(comment => comment.comment && comment.comment.trim().length > 0);
  });
}
