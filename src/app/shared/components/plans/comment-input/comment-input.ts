import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TextareaModule } from 'primeng/textarea';
import { BaseLabelComponent } from 'src/app/shared/components/base-components/base-label/base-label.component';
import { BaseErrorMessages } from 'src/app/shared/components/base-components/base-error-messages/base-error-messages';
import { TCommentPhase } from '../plan-localization/product-localization-plan-wizard/product-localization-plan-wizard';

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
}
