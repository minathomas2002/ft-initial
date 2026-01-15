import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-page-comment-box',
  imports: [],
  templateUrl: './page-comment-box.html',
  styleUrl: './page-comment-box.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageCommentBox {
  commentTitle = input.required<string>();
  commentText = input.required<string>();
}
