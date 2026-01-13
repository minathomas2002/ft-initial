import { ChangeDetectionStrategy, Component, inject, input, linkedSignal, model, output } from '@angular/core';
import { FormControl, FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { CommentDialog } from '../comment-dialog/comment-dialog';
import { TCommentPhase } from '../plan-localization/product-localization-plan-wizard/product-localization-plan-wizard';
import { ToasterService } from 'src/app/shared/services/toaster/toaster.service';

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
  commentAdded = output();
  commentFormControl = input.required<FormControl<string>>();
  commentPhase = model<TCommentPhase>();
  startEditing = output();
  deleteComments = output();
  saveComment = output();
  toaster = inject(ToasterService);

  onCommentAdded() {
    this.commentPhase.set('viewing');
    this.commentFormControl().disable();
  }

  onDeleteComments() {
    this.commentPhase.set('none');
    this.commentFormControl().reset();
    this.toaster.success('Comments deleted successfully');
    this.deleteComments.emit();
  }

  onStartEditing() {
    this.commentPhase.set('editing');
    this.commentFormControl()!.enable();
  }

  onSaveComment() {
    this.saveComment.emit();
    this.commentPhase.set('viewing');
    this.commentFormControl().disable();
    this.toaster.success('Comment saved successfully');
  }
}
