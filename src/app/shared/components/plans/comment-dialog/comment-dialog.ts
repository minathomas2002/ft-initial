import { ChangeDetectionStrategy, Component, effect, inject, input, model, OnInit, output, signal } from '@angular/core';
import { BaseDialogComponent } from '../../base-components/base-dialog/base-dialog.component';
import { BaseLabelComponent } from '../../base-components/base-label/base-label.component';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
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
export class CommentDialog implements OnInit {
  visible = model<boolean>(false);
  private readonly fb = inject(FormBuilder);
  private readonly toaster = inject(ToasterService);
  commentFormControl = input.required<FormControl<string | null>>();
  commentAdded = output();
  cancelled = output();
  private commentSubmitted = signal<boolean>(false);
  private initialValue = signal<string>('');

  constructor() {
    let wasVisible = false;
    effect(() => {
      const isVisible = this.visible();
      if (isVisible && !wasVisible) {
        this.initialValue.set(this.commentFormControl()?.value ?? '');
        this.commentSubmitted.set(false);
      }
      wasVisible = isVisible;
    });

  }

  ngOnInit(): void {
    const control = this.commentFormControl();
    if (control) {
      control.addValidators(Validators.required);
    }
  }

  onClose() {
    if (!this.commentSubmitted()) {
      // Restore original value (important for Edit flow).
      const control = this.commentFormControl();
      if (control) {
        control.setValue(this.initialValue());
        control.markAsPristine();
        control.markAsUntouched();
      }
      // Always emit cancelled when dialog is closed without saving
      // The parent component will decide what to do based on the mode (investor vs employee)
      this.cancelled.emit();
    }
  }

  onConfirm(): void {
    if (!this.commentFormControl()?.valid) {
      this.toaster.error('Please enter a comment');
      return;
    }
    // Success message will be shown by parent component
    this.commentSubmitted.set(true);
    this.commentAdded.emit();
    this.visible.set(false);
  }
}
