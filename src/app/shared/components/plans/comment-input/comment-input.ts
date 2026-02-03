import { ChangeDetectionStrategy, Component, effect, input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TextareaModule } from 'primeng/textarea';
import { BaseLabelComponent } from 'src/app/shared/components/base-components/base-label/base-label.component';
import { BaseErrorMessages } from 'src/app/shared/components/base-components/base-error-messages/base-error-messages';
import { TCommentPhase } from '../plan-localization/product-localization-plan-wizard/product-localization-plan-wizard';
import { trimmedRequiredValidator } from 'src/app/shared/validators/trimmed-required-validator';

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
    // Add trimmedRequired validator when editing, remove when not editing
    effect(() => {
      const control = this.commentFormControl();
      const phase = this.commentPhase();
    
      const validators =
        phase === 'editing' || phase === 'adding'
          ? [trimmedRequiredValidator]
          : [];
    
      control.setValidators(validators);
      control.updateValueAndValidity({ emitEvent: false });
    });
  }
}