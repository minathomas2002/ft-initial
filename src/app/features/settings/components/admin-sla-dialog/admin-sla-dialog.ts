import { ChangeDetectionStrategy, Component, inject, model } from '@angular/core';
import { SlaForm } from '../../services/sla-form/sla-form';
import { BaseDialogComponent } from "src/app/shared/components/base-components/base-dialog/base-dialog.component";
import { TranslatePipe } from "../../../../shared/pipes/translate.pipe";
import { BaseLabelComponent } from "src/app/shared/components/base-components/base-label/base-label.component";
import { BaseErrorComponent } from "src/app/shared/components/base-components/base-error/base-error.component";
import { ReactiveFormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { adminSettingsStore } from 'src/app/shared/stores/settings/admin-settings.store';
import { filter, take, tap } from 'rxjs';
import { ISettingSla, ISettingSlaReq } from 'src/app/shared/interfaces/ISetting';
import { I18nService } from 'src/app/shared/services/i18n';
import { ToasterService } from 'src/app/shared/services/toaster/toaster.service';

@Component({
  selector: 'app-admin-sla-dialog',
  imports: [BaseDialogComponent, TranslatePipe, BaseLabelComponent, BaseErrorComponent, ReactiveFormsModule, InputTextModule],
  templateUrl: './admin-sla-dialog.html',
  styleUrl: './admin-sla-dialog.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminSlaDialog {

  dialogVisible = model<boolean>(false);
  formService = inject(SlaForm);
  settingAdminStore = inject(adminSettingsStore);
  i18nService = inject(I18nService);
  toasterService = inject(ToasterService);

  ngOnInit() {

    this.loadSlaSetting();
  }

  loadSlaSetting() {
    // load data and patch it into form
    this.settingAdminStore.getSlaSetting().pipe(
      filter(() => !!this.settingAdminStore.settingSla()),
      tap(() => {
        this.formService.patchForm(this.settingAdminStore.settingSla()!);
      })
    ).subscribe();

  }

  onClose() {
    this.formService.ResetFormFields();
    this.dialogVisible.set(false);
  }

  onConfirm() {
    const form = this.formService.form;
    const req: ISettingSlaReq = {
      internalCycle: form.controls.internalCycle.value!,
      investorReply: form.controls.investorReply.value!,

    };
    this.settingAdminStore
      .updateSlaSetting(req)
      .pipe(
        tap((res) => {
          if (res.errors) {
            this.dialogVisible.set(false);
            return;
          }
        }),
        take(1),
      )
      .subscribe({
        next: (res) => {
          if (res.success) {
            this.toasterService.success(this.i18nService.translate('setting.adminView.dialog.slaSuccessUpdate'));
            this.formService.ResetFormFields();
            this.dialogVisible.set(false);
          }
        },
      });
  }
}
