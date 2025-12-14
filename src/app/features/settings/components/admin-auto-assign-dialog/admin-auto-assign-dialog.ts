import { Component, inject, model } from '@angular/core';
import { BaseLabelComponent } from "src/app/shared/components/base-components/base-label/base-label.component";
import { TranslatePipe } from "../../../../shared/pipes/translate.pipe";
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { adminSettingsStore } from 'src/app/shared/stores/settings/admin-settings.store';
import { BaseDialogComponent } from "src/app/shared/components/base-components/base-dialog/base-dialog.component";
import { FormsModule } from '@angular/forms';
import { I18nService } from 'src/app/shared/services/i18n';
import { ToasterService } from 'src/app/shared/services/toaster/toaster.service';
import { take, tap } from 'rxjs';

@Component({
  selector: 'app-admin-auto-assign-dialog',
  imports: [BaseLabelComponent, TranslatePipe, ToggleSwitchModule, FormsModule, BaseDialogComponent],
  templateUrl: './admin-auto-assign-dialog.html',
  styleUrl: './admin-auto-assign-dialog.scss',
})

export class AdminAutoAssignDialog {

  settingAdminStore = inject(adminSettingsStore);
  dialogVisible = model<boolean>(false);
  i18nService = inject(I18nService);
  toasterService = inject(ToasterService);

  ngOnInit() {
    this.loadAutoAssignDefaultValues();
  }

  onConfirm() {
    const req = this.settingAdminStore.settingAutoAssign()!;
    this.settingAdminStore
      .updateAutoAssignSetting(req)
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
            this.toasterService.success(this.i18nService.translate('setting.adminView.dialog.autoAssignSuccessUpdate'));
            this.dialogVisible.set(false);
          }
        },
      });

  }

  loadAutoAssignDefaultValues() {
    // load data and 
    this.settingAdminStore.getAutoAssignSetting().subscribe();

  }
  onClose() {
    this.dialogVisible.set(false);
  }
}
