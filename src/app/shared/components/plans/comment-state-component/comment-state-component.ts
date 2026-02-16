import { ChangeDetectionStrategy, Component, computed, effect, inject, input, linkedSignal, model, output, signal } from '@angular/core';
import { FormControl, FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { CommentDialog } from '../comment-dialog/comment-dialog';
import { TCommentPhase } from 'src/app/shared/types/plan-comments.types';
import { ToasterService } from 'src/app/shared/services/toaster/toaster.service';
import { merge, startWith } from 'rxjs';
import { PlanStore } from 'src/app/shared/stores/plan/plan.store';
import { EInternalUserPlanStatus } from 'src/app/shared/interfaces/dashboard-plans.interface';

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
  saveComment = output<string | undefined>();
  toaster = inject(ToasterService);
  private readonly planStore = inject(PlanStore);
  mode = input<'fieldSelection' | 'pageComment'>('fieldSelection');
  isResubmitMode = input<boolean>(false);
  hasInvestorComment = input<boolean>(false);
  incomingCommentText = input<string>('');
  private readonly initialCommentValue = signal<string>('');
  readonly commentFormControlValue = signal<string>('');
  readonly commentFormControlInvalid = signal<boolean>(true);
  readonly commentInitialValueFromManager = signal<string>('');
  readonly commentWithoutWhiteSpaces = computed(() => (this.commentFormControlValue() ?? '').trim().length > 0);


  constructor() {
    effect((onCleanup) => {
      const control = this.commentFormControl();

      const sub = merge(control.valueChanges, control.statusChanges).pipe(startWith(null)).subscribe(() => {
        this.syncCommentControlState();
      });

      this.syncCommentControlState();
      onCleanup(() => sub.unsubscribe());
    });

    effect(() => {
      if (this.commentPhase() === 'viewing') {
        this.commentFormControl().disable();
        this.syncCommentControlState();
      }
    });
  }

  private syncCommentControlState() {
    const control = this.commentFormControl();
    this.commentFormControlValue.set(control.value ?? '');
    this.commentFormControlInvalid.set(control.invalid);
  }

  openCommentDialog() {
    const status = this.planStore.planStatus();
    const isReturnedByManager = [
      EInternalUserPlanStatus.ReturnedByDV,
      EInternalUserPlanStatus.ReturnedByDEPTManager,
    ].includes(status as EInternalUserPlanStatus);

    const currentComment = this.commentFormControlValue()?.trim() ?? '';
    const incomingComment = this.incomingCommentText()?.trim() ?? '';
    const initialComment = currentComment || incomingComment;
    this.commentInitialValueFromManager.set(isReturnedByManager && initialComment ? initialComment : '');
    this.showCommentDialog.set(true);
  }

  onNewCommentAddedFromDialog(commentValue: string) {
    const sanitizedComment = (commentValue ?? '').trimStart();
    this.saveComment.emit(sanitizedComment);
    this.commentPhase.set('viewing');
    this.initialCommentValue.set(sanitizedComment);
    this.commentFormControl().setValue(sanitizedComment);
    this.commentFormControl().disable({ emitEvent: false });
    this.syncCommentControlState();
  }

  onDeleteComments() {
    this.deleteComments.emit();
  }

  onStartEditing() {
    this.initialCommentValue.set(this.commentFormControl().value ?? '');
    this.commentPhase.set('editing');
    this.commentFormControl()!.enable({ emitEvent: false });
    this.syncCommentControlState();
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
    this.syncCommentControlState();
    // this.showCommentDialog.set(true);
  }

  onSaveComment() {
    if (!this.commentWithoutWhiteSpaces()) {
      return;
    }

    const sanitizedComment = (this.commentFormControl().value ?? '').trimStart();
    this.commentFormControl().setValue(sanitizedComment, { emitEvent: false });
    this.saveComment.emit(undefined);
    this.commentPhase.set('viewing');
    this.initialCommentValue.set(sanitizedComment);
    this.commentFormControl().disable({ emitEvent: false });
    this.syncCommentControlState();
  }

  onCommentCancelled() {
    // For investors (resubmit mode): Reset phase to 'none' when cancelling dialog
    // This allows them to click "Add Comment" again without being stuck
    if (this.isResubmitMode()) {
      if (this.commentPhase() === 'adding' || this.commentPhase() === 'editing') {
        this.commentPhase.set('none');
        this.commentFormControl().disable({ emitEvent: false });
        this.syncCommentControlState();
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
    this.syncCommentControlState();
  }

}
