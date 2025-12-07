import { Component, inject, input, model, OnInit, output } from '@angular/core';
import { TransferRoleService } from '../../services/transfer-role/transfer-role-service';
import { SystemEmployeesStore } from 'src/app/shared/stores/system-employees/system-employees.store';
import { I18nService } from 'src/app/shared/services/i18n/i18n.service';
import { take } from 'rxjs';
import { TranslatePipe } from 'src/app/shared/pipes';
import { Select } from 'primeng/select';
import { ReactiveFormsModule } from '@angular/forms';
import { BaseDialogComponent } from 'src/app/shared/components/base-components/base-dialog/base-dialog.component';
import { BaseLabelComponent } from 'src/app/shared/components/base-components/base-label/base-label.component';
import { BaseErrorComponent } from 'src/app/shared/components/base-components/base-error/base-error.component';
import { RoleManagementStore } from 'src/app/shared/stores/system-employees/role-management-store';

@Component({
  selector: 'app-transfer-role-dialog',
  imports: [
    TranslatePipe,
    Select,
    ReactiveFormsModule,
    BaseDialogComponent,
    BaseLabelComponent,
    BaseErrorComponent,
  ],
  templateUrl: './transfer-role-dialog.html',
  styleUrl: './transfer-role-dialog.scss',
})
export class TransferRoleDialog implements OnInit {
  visible = model<boolean>(false);
  transferRoleService = inject(TransferRoleService);
  onConfirm = output<void>();
  isProcessing = input<boolean>(false);
  systemEmployeesStore = inject(SystemEmployeesStore);
  activeSystemEmployees = this.systemEmployeesStore.activeEmployees
  i18nService = inject(I18nService);
  roleManagementStore = inject(RoleManagementStore);
  isLoading = this.roleManagementStore.isProcessing
  ngOnInit(): void {
    this.systemEmployeesStore.getActiveEmployees()
      .pipe(take(1))
      .subscribe();
  }

  resetForm(): void {
    this.transferRoleService.resetForm();
  }
}
