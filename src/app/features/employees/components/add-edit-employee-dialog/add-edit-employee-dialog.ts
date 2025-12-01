import { Component, computed, inject, input, model, output } from '@angular/core';
import { BaseDialogComponent } from "src/app/shared/components/base-components/base-dialog/base-dialog.component";
import { TranslatePipe } from "../../../../shared/pipes/translate.pipe";
import { AddEmployeeFormService } from '../../services/add-employee-form/add-employee-form-service';
import { BaseLabelComponent } from "src/app/shared/components/base-components/base-label/base-label.component";
import { RolesStore } from 'src/app/shared/stores/roles/roles.store'
import { I18nService } from 'src/app/shared/services/i18n';
import { Select } from "primeng/select";
import { Message } from "primeng/message";
import { ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, filter, skip, switchMap, take, tap } from 'rxjs';
import { ToasterService } from 'src/app/shared/services/toaster/toaster.service';
import { InputTextModule } from 'primeng/inputtext';
import { SystemEmployeesStore } from 'src/app/shared/stores/system-employees/system-employees.store';
import { EmployeeRoleMapper } from '../../classes/employee-role-mapper';
import { ICreateSystemEmployeeRequest, ISystemEmployeeRecord, IUpdateSystemEmployeeRequest } from 'src/app/shared/interfaces';
import { EUserStatus } from 'src/app/shared/enums';

@Component({
  selector: 'app-add-edit-employee-dialog',
  imports: [
    BaseDialogComponent,
    TranslatePipe,
    ReactiveFormsModule,
    Select,
    Message,
    BaseLabelComponent,
    InputTextModule,
    RolesStore
  ],
  templateUrl: './add-edit-employee-dialog.html',
  styleUrl: './add-edit-employee-dialog.scss',
})
export class AddEditEmployeeDialog {

  dialogVisible = model<boolean>(false);
  isEditMode = input<boolean>(false);
  formService = inject(AddEmployeeFormService);
  roleStore = inject(RolesStore);
  employeeStore = inject(SystemEmployeesStore);
  i18nService = inject(I18nService);
  toasterService = inject(ToasterService);
  employeeRoleMapper = new EmployeeRoleMapper(this.i18nService);
  SelectedItem = model<ISystemEmployeeRecord | null>();
  onSuccess = output<void>();
  employeeRoles = computed(() => {
    const roles = this.roleStore.allRoles();
    const selected = this.SelectedItem();
    let list = roles.map(role => ({
      label: role.name, //this.employeeRoleMapper.getTranslatedRole(role.code),
      value: role.id
    }));
    // If user exists AND their role is not in the list → add it
    // if (selected && selected?.roleId && !list.some(r => r.value === selected?.roleId)) {
    //   list = [
    //     ...list,
    //     {
    //       label: selected?.roleName ?? 'Unknown Role', // fallback name
    //       value: selected?.roleId ?? ''
    //     }
    //   ];
    // }
    return list;
  }
  );


  ngOnInit() {
    this.formService.ResetFormFields();
    if (!this.isEditMode()) {
      this.formService.job.valueChanges
        .pipe(
          debounceTime(500),
          distinctUntilChanged(),
          switchMap(() => this.employeeStore.getEmployeeDateFromHR(this.formService.employeeID.value!))
        )
        .subscribe();
    } else {
      this.LoadEmployeeDetails();
    }
  }


  onConfirm() {
    // check if create or edit 
    if (this.isEditMode())
      this.UpdateExistingEmployee();
    else
      this.SubmitNEwEmployee();

  }

  // case Create New User
  SubmitNEwEmployee() {
    const form = this.formService.form;
    const req: ICreateSystemEmployeeRequest = {
      employeeID: form.controls.employeeID.value!,
      nameAr: form.controls.nameAr.value!,
      nameEn: form.controls.nameEn.value!,
      email: form.controls.email.getRawValue() ?? '',  // since it's disabled
      phoneNumber: form.controls.phoneNumber.value!,
      roleId: String(form.controls.roleId.value!),  // convert enum/number to string
    };
    this.employeeStore
      .createSystemEmployee(req)
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
          this.toasterService.success('Employee Added Successfully');
          this.formService.ResetFormFields();
          this.dialogVisible.set(false);
          this.onSuccess.emit(); // update table
        },
      }
      );
  }

  UpdateExistingEmployee() {
    const form = this.formService.form;
    const req: IUpdateSystemEmployeeRequest = {
      id: this.SelectedItem()?.id ?? '',
      nameAr: form.controls.nameAr.value!,
      nameEn: form.controls.nameEn.value!,
      phoneNumber: form.controls.phoneNumber.value!,
      roleId: String(form.controls.roleId.value!),
    };
    this.employeeStore
      .updateSystemEmployee(req)
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
          this.toasterService.success('Employee Updated Successfully');
          this.formService.ResetFormFields();
          this.dialogVisible.set(false);
          this.onSuccess.emit(); // update table
        },
      });
  }

  LoadEmployeeDetails() {
    const selectedId = this.SelectedItem()?.id;
    if (!selectedId) return;
    this.employeeStore.getSystemEmployeeDetails(selectedId).subscribe({
      next: (res) => {
        const employee = res.body;
        if (employee) this.formService.patchForm(employee, this.isEditMode());
      }
    });

  }

  GetEmployeeDateFromHR() {
    const form = this.formService.form;
    this.employeeStore
      .getEmployeeDateFromHR(form.controls.employeeID.value!)
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
          this.formService.form.patchValue(res.body);
        },
      });
  }
}
