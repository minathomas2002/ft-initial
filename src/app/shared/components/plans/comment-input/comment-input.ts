import { ChangeDetectionStrategy, Component, DestroyRef, effect, inject, input } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TextareaModule } from 'primeng/textarea';
import { distinctUntilChanged } from 'rxjs';
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
  private readonly destroyRef = inject(DestroyRef);

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

      // Reactively reject whitespace-only input as the user types.
      // If the value is purely whitespace, reset to empty string.
      control.valueChanges
        .pipe(distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
        .subscribe((value) => {
          if (value && value.length > 0 && value.trim().length === 0) {
            control.setValue('', { emitEvent: false });
          }
        });
    });
  }
}
