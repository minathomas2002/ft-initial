import { ChangeDetectionStrategy, Component, effect, input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TextareaModule } from 'primeng/textarea';
import { BaseLabelComponent } from 'src/app/shared/components/base-components/base-label/base-label.component';
import { BaseErrorMessages } from 'src/app/shared/components/base-components/base-error-messages/base-error-messages';
import { TCommentPhase } from 'src/app/shared/types/plan-comments.types';

@Component({
  selector: 'app-comment-input',
  imports: [
    ReactiveFormsModule,
    TextareaModule,
    BaseLabelComponent,
    BaseErrorMessages,
  ],
  templateUrl: './comment-input.html',
  styleUrl: './comment-input.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CommentInputComponent {
  commentFormControl = input.required<FormControl<string>>();
  commentPhase = input.required<TCommentPhase>();

  constructor() {
    effect(() => {
      const control = this.commentFormControl();

      // Clear any leftover validators to ensure the control
      // never taints the parent FormGroup's validity.
      if (control.validator) {
        control.clearValidators();
        control.updateValueAndValidity({ emitEvent: false });
      }

      // Whitespace-only comments are rejected at save time in the parent
      // flow via trim() checks (no subscription needed here).
    });
  }
}
