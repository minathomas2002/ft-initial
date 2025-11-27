import { UsersLookupsStore } from 'src/app/shared/stores/users/users-lookups.store';
import { Component, computed, inject, input, model, output } from '@angular/core';
import { ChangeRoleFormService } from '../../services/change-role-form/change-role-form-service';
import { BaseDialogComponent } from 'src/app/shared/components/base-components/base-dialog/base-dialog.component';
import { BaseLabelComponent } from 'src/app/shared/components/base-components/base-label/base-label.component';
import { SelectModule } from 'primeng/select';
import { MessageModule } from 'primeng/message';
import { ReactiveFormsModule } from '@angular/forms';
import { RolesStore } from 'src/app/shared/stores/roles/roles.store';
import { UserRoleMapper } from '../../classes/user-role-mapper';
import { I18nService } from 'src/app/shared/services/i18n/i18n.service';
import { TranslatePipe } from 'src/app/shared/pipes';

@Component({
  selector: 'app-change-role-dialog',
  imports: [BaseDialogComponent, BaseLabelComponent, SelectModule, MessageModule, ReactiveFormsModule, TranslatePipe],
  templateUrl: './change-role-dialog.html',
  styleUrl: './change-role-dialog.scss',
})
export class ChangeRoleDialog {
  visible = model<boolean>(false);
  formService = inject(ChangeRoleFormService);
  onConfirm = output<void>();
  isProcessing = input<boolean>(false);
  usersLookupsStore = inject(UsersLookupsStore);
  resetForm = () => {
    this.formService.form.reset();
  };
  roleStore = inject(RolesStore);
  i18nService = inject(I18nService);
  userRoleMapper = new UserRoleMapper(this.i18nService);
  userRoles = computed(() => 
    this.roleStore.list().map(role => ({
      label: this.userRoleMapper.getTranslatedRole(role.code),
      value: role.id
    })).filter(option => option.value !== undefined)
  );
}
