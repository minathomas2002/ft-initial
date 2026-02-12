import { ChangeDetectionStrategy, Component, computed, DestroyRef, effect, inject, input, linkedSignal, model, output, signal } from '@angular/core';
import { FormControl, FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { CommentDialog } from '../comment-dialog/comment-dialog';
import { TCommentPhase } from 'src/app/shared/types/plan-comments.types';
import { ToasterService } from 'src/app/shared/services/toaster/toaster.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { merge, startWith } from 'rxjs';

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
  private readonly initialCommentValue = signal<string>('');
  private readonly destroyRef = inject(DestroyRef);


  // Track form control validity reactively
  private commentFormControlInvalid = signal<boolean>(true);
  isCommentFormControlInvalid = computed(() => {
    return this.commentFormControlInvalid();
  });

  constructor() {
    effect(() => {
      if (this.commentPhase() === 'viewing') {
        this.commentFormControl().disable();
      }
    });

    // Subscribe to form control status changes to update the signal
    effect(() => {
      const control = this.commentFormControl();
      this.commentFormControlInvalid.set(control.invalid);

      merge(
        control.valueChanges,
        control.statusChanges
      ).pipe(
        startWith(control.invalid),
        takeUntilDestroyed(this.destroyRef)
      )
        .subscribe(() => {
          this.commentFormControlInvalid.set(
            control.invalid
          );
        });
    });
  }

  onCommentAdded() {
    this.saveComment.emit();
    this.commentPhase.set('viewing');
    this.initialCommentValue.set(this.commentFormControl().value ?? '');
    this.commentFormControl().disable({ emitEvent: false });
  }

  onDeleteComments() {
    this.deleteComments.emit();
  }

  onStartEditing() {
    this.initialCommentValue.set(this.commentFormControl().value ?? '');
    this.commentPhase.set('editing');
    this.commentFormControl()!.enable({ emitEvent: false });
    // For employee mode (non-resubmit): enable the textarea below the page, don't open dialog
    // For investor mode (resubmit): open dialog for editing
    // if (this.isResubmitMode()) {
    //   // Open dialog with current comment value (FormControl already holds it).
    //   this.showCommentDialog.set(true);
    // }
    // If not resubmit mode, the textarea below will be enabled via commentPhase === 'editing'
  }

  onStartEditingResubmitMode() {
    // Keep the existing external hook, but also open the dialog for editing.
    this.startEditing.emit();
    this.initialCommentValue.set(this.commentFormControl().value ?? '');
    this.commentPhase.set('editing');
    this.commentFormControl()!.enable({ emitEvent: false });
    // this.showCommentDialog.set(true);
  }

  onSaveComment() {
    this.saveComment.emit();
    this.commentPhase.set('viewing');
    this.initialCommentValue.set(this.commentFormControl().value ?? '');
    this.commentFormControl().disable({ emitEvent: false });
  }

  onCommentCancelled() {
    // For investors (resubmit mode): Reset phase to 'none' when cancelling dialog
    // This allows them to click "Add Comment" again without being stuck
    if (this.isResubmitMode()) {
      if (this.commentPhase() === 'adding' || this.commentPhase() === 'editing') {
        this.commentPhase.set('none');
        this.commentFormControl().disable({ emitEvent: false });
      }
    }
    // For employees (non-resubmit mode): Keep phase as 'adding' when cancelling
    // This keeps checkboxes and comment state component visible so they can retry
    // without having to click "Add Comment" again
  }

  onCancelEditing() {
    // Restore the last saved value and leave edit mode.
    const control = this.commentFormControl();
    control.setValue(this.initialCommentValue(), { emitEvent: true });
    control.markAsPristine();
    control.markAsUntouched();
    this.commentPhase.set('viewing');
    control.disable({ emitEvent: false });
  }

}
