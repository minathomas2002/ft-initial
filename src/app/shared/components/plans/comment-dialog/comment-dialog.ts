import { ChangeDetectionStrategy, Component, inject, model, output } from '@angular/core';
import { BaseDialogComponent } from '../../base-components/base-dialog/base-dialog.component';
import { BaseLabelComponent } from '../../base-components/base-label/base-label.component';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TextareaModule } from 'primeng/textarea';
import { TrimOnBlurDirective } from 'src/app/shared/directives';
import { BaseErrorMessages } from '../../base-components/base-error-messages/base-error-messages';
import { ToasterService } from 'src/app/shared/services/toaster/toaster.service';

@Component({
  selector: 'app-comment-dialog',
  imports: [
    BaseDialogComponent,
    BaseLabelComponent,
    ReactiveFormsModule,
    TextareaModule,
    TrimOnBlurDirective,
    BaseErrorMessages
  ],
  templateUrl: './comment-dialog.html',
  styleUrl: './comment-dialog.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CommentDialog {
  visible = model<boolean>(false);
  private readonly fb = inject(FormBuilder);
  private readonly toaster = inject(ToasterService);
  commentFormControl = this.fb.control('', [Validators.required, Validators.maxLength(255)]);
  comment = output<string>();

  onConfirm(): void {
    if (this.commentFormControl.valid) {
      this.toaster.success('Comment added successfully');
      this.comment.emit(this.commentFormControl.value ?? '');
      this.visible.set(false);
    }
  }
}
