import { ChangeDetectionStrategy, Component, effect, inject, input, model, OnInit, output } from '@angular/core';
import { BaseDialogComponent } from '../../base-components/base-dialog/base-dialog.component';
import { BaseLabelComponent } from '../../base-components/base-label/base-label.component';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { TextareaModule } from 'primeng/textarea';
import { HidePlaceholderWhenDisabledEmptyDirective, TrimOnBlurDirective } from 'src/app/shared/directives';
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
    HidePlaceholderWhenDisabledEmptyDirective,
    BaseErrorMessages
  ],
  templateUrl: './comment-dialog.html',
  styleUrl: './comment-dialog.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CommentDialog {
  visible = model<boolean>(false);
  commentInitialValueFromManager = input<string>('');
  commentAdded = output<string>();
  cancelled = output();

  protected formControl = new FormControl('', [Validators.required, Validators.maxLength(255)])

  constructor() {
    effect(() => {
      if (!this.visible()) return;

      const initialValue = this.commentInitialValueFromManager() ?? '';
      this.formControl.setValue(initialValue, { emitEvent: false });
      this.formControl.markAsPristine();
      this.formControl.markAsUntouched();
    });

  }

  onClose() {
    this.cancelled.emit();
    this.formControl.reset();
  }

  onConfirm(): void {
    if (this.formControl?.invalid) {
      return;
    }

    this.commentAdded.emit(this.formControl?.value || '');
    this.visible.set(false);
    this.formControl.reset()
  }
}
