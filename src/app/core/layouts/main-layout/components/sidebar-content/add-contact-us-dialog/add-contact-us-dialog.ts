
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  model,
  OnInit,
  output,
} from '@angular/core';
import { BaseDialogComponent } from 'src/app/shared/components/base-components/base-dialog/base-dialog.component';
import { I18nService } from 'src/app/shared/services/i18n';
import { ToasterService } from 'src/app/shared/services/toaster/toaster.service';
import { SelectModule } from 'primeng/select';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslatePipe } from 'src/app/shared/pipes';
import { ContactUsStore } from 'src/app/shared/stores/contact-us/contact-us-store';
import { ContactUsFormService } from 'src/app/features/employees/services/contect-us-form/contect-us-form-service';
import { IAddContactUsRequest } from 'src/app/shared/interfaces/contact-us.interface';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { BaseErrorMessages } from "src/app/shared/components/base-components/base-error-messages/base-error-messages";
@Component({
  selector: 'app-add-contact-us-dialog',
  imports: [
    BaseDialogComponent,
    TranslatePipe,
    SelectModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextModule,
    TextareaModule,
    BaseErrorMessages
],
  templateUrl: './add-contact-us-dialog.html',
  styleUrl: './add-contact-us-dialog.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddContactUsDialog implements OnInit {
   onSuccess = output<void>();
  destroyRef = inject(DestroyRef);
  dialogVisible = model<boolean>(false);
  formService = inject(ContactUsFormService);
  contactUsStore = inject(ContactUsStore);
  isProcessing = this.contactUsStore.isProcessing;
  isLoadingDetails = this.contactUsStore.isLoadingDetails;
  toasterService = inject(ToasterService);

  i18nService = inject(I18nService);

  ngOnInit() {}

  onConfirm() {
    const form = this.formService.form;
    const req: IAddContactUsRequest = {
      title: form.controls.title.value!,
      description: form.controls.description.value!,
    };

    this.contactUsStore
    .addContactUsMessage(req)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.toasterService.success(
            this.i18nService.translate('contactUs.messages.addedSuccess'),
          );
          this.onSuccess.emit();
          this.dialogVisible.set(false);
          this.formService.ResetFormFields();
        },
        error: (error: any) => {},
      });
  }
  resetForm() {
    this.formService.ResetFormFields();
  }

  getControl(controlName: string): FormControl {
    return this.formService.form.get(controlName) as FormControl;
  }
}
