import { ChangeDetectionStrategy, Component, effect, inject, input, linkedSignal, model, output } from '@angular/core';
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
  mode = input<'fieldSelection' | 'pageComment'>('fieldSelection');
  isResubmitMode = input<boolean>(false);
  hasInvestorComment = input<boolean>(false);

  constructor() {
    effect(() => {
      if (this.commentPhase() === 'viewing') {
        this.commentFormControl().disable();
      }
    });
  }

  onCommentAdded() {
    this.saveComment.emit();
    this.commentPhase.set('viewing');
    this.commentFormControl().disable();
  }

  onDeleteComments() {
    this.deleteComments.emit();
  }

  onStartEditing() {
    this.commentPhase.set('editing');
    this.commentFormControl()!.enable();
    // For employee mode (non-resubmit): enable the textarea below the page, don't open dialog
    // For investor mode (resubmit): open dialog for editing
    if (this.isResubmitMode()) {
      // Open dialog with current comment value (FormControl already holds it).
      this.showCommentDialog.set(true);
    }
    // If not resubmit mode, the textarea below will be enabled via commentPhase === 'editing'
  }

  onStartEditingResubmitMode() {
    // Keep the existing external hook, but also open the dialog for editing.
    this.startEditing.emit();
    this.commentPhase.set('editing');
    this.commentFormControl()!.enable();
    this.showCommentDialog.set(true);
  }

  onSaveComment() {
    this.saveComment.emit();
    this.commentPhase.set('viewing');
    this.commentFormControl().disable();
  }

  onCommentCancelled() {
    // For investors (resubmit mode): Reset phase to 'none' when cancelling dialog
    // This allows them to click "Add Comment" again without being stuck
    if (this.isResubmitMode()) {
      if (this.commentPhase() === 'adding' || this.commentPhase() === 'editing') {
        this.commentPhase.set('none');
      }
    }
    // For employees (non-resubmit mode): Keep phase as 'adding' when cancelling
    // This keeps checkboxes and comment state component visible so they can retry
    // without having to click "Add Comment" again
  }
}
