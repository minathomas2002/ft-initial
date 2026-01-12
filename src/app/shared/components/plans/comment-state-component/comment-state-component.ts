import { ChangeDetectionStrategy, Component, input, linkedSignal, model, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { CommentDialog } from '../comment-dialog/comment-dialog';

@Component({
  selector: 'app-comment-state-component',
  imports: [
    ButtonModule,
    CheckboxModule,
    FormsModule,
    CommentDialog
  ],
  templateUrl: './comment-state-component.html',
  styleUrl: './comment-state-component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CommentStateComponent {
  commentsCount = input<number>(0);
  checked = linkedSignal<boolean>(() => this.commentsCount() > 0);
  showCommentDialog = model<boolean>(false);
  comment = output<string>();
}
