import { Component, inject, model } from '@angular/core';
import { BaseLabelComponent } from "src/app/shared/components/base-components/base-label/base-label.component";
import { TranslatePipe } from "../../../../shared/pipes/translate.pipe";
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { adminSettingsStore } from 'src/app/shared/stores/settings/admin-settings.store';
import { BaseDialogComponent } from "src/app/shared/components/base-components/base-dialog/base-dialog.component";
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin-auto-assign-dialog',
  imports: [BaseLabelComponent, TranslatePipe, ToggleSwitchModule,FormsModule, BaseDialogComponent],
  templateUrl: './admin-auto-assign-dialog.html',
  styleUrl: './admin-auto-assign-dialog.scss',
})

export class AdminAutoAssignDialog {

  settingAdminStore = inject(adminSettingsStore);
   dialogVisible = model<boolean>(false);


   onConfirm(){
    this.dialogVisible.set(false);
   }

   onClose(){
    this.dialogVisible.set(false);
   }
}
