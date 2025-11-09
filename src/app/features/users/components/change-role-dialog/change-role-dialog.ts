import { UsersLookupsStore } from 'src/app/shared/stores/users/users-lookups.store';
import { Component, computed, inject, input, model, output } from '@angular/core';
import { ChangeRoleFormService } from '../../services/change-role-form/change-role-form-service';
import { BaseDialogComponent } from 'src/app/shared/components/base-components/base-dialog/base-dialog.component';
import { BaseLabelComponent } from 'src/app/shared/components/base-components/base-label/base-label.component';
import { SelectModule } from 'primeng/select';
import { MessageModule } from 'primeng/message';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-change-role-dialog',
  imports: [BaseDialogComponent, BaseLabelComponent, SelectModule, MessageModule, ReactiveFormsModule],
  templateUrl: './change-role-dialog.html',
  styleUrl: './change-role-dialog.scss',
})
export class ChangeRoleDialog {
  visible = model<boolean>(false);
  formService = inject(ChangeRoleFormService);
  onConfirm = output<void>();
  isProcessing = input<boolean>(false);
  usersLookupsStore = inject(UsersLookupsStore);
  roles = computed(() => this.usersLookupsStore.userTitles());
  resetForm = () => {
    this.formService.form.reset();
  };
}
