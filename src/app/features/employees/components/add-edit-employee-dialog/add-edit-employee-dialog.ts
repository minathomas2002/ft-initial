import { Component, computed, DestroyRef, inject, input, model, OnInit, output, signal } from '@angular/core';
import { BaseDialogComponent } from "src/app/shared/components/base-components/base-dialog/base-dialog.component";
import { TranslatePipe } from "../../../../shared/pipes/translate.pipe";
import { AddEmployeeFormService } from '../../services/add-employee-form/add-employee-form-service';
import { BaseLabelComponent } from "src/app/shared/components/base-components/base-label/base-label.component";
import { RolesStore } from 'src/app/shared/stores/roles/roles.store'
import { I18nService } from 'src/app/shared/services/i18n';
import { Select } from "primeng/select";
import { Message } from "primeng/message";
import { ReactiveFormsModule } from '@angular/forms';
import { catchError, debounceTime, distinctUntilChanged, filter, forkJoin, of, skip, switchMap, take, tap } from 'rxjs';
import { ToasterService } from 'src/app/shared/services/toaster/toaster.service';
import { InputTextModule } from 'primeng/inputtext';
import { SystemEmployeesStore } from 'src/app/shared/stores/system-employees/system-employees.store';
import { EmployeeRoleMapper } from '../../classes/employee-role-mapper';
import { ICreateSystemEmployeeRequest, IRole, ISystemEmployeeRecord, IUpdateSystemEmployeeRequest } from 'src/app/shared/interfaces';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

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
    IconFieldModule,
    InputIconModule
  ],
  templateUrl: './add-edit-employee-dialog.html',
  styleUrl: './add-edit-employee-dialog.scss',
})
export class AddEditEmployeeDialog implements OnInit {

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
  destroyRef = inject(DestroyRef);
  isProcessing = this.employeeStore.isProcessing;
  isLoadingDetails = this.employeeStore.isLoadingDetails;
  jobIdErrorMessage = signal<string | null>(null);


  userRoles = this.roleStore.filteredRoles;

  ngOnInit() {
    forkJoin(
      [this.roleStore.getFilteredRoles(),
      this.roleStore.getSystemRoles()])
      .pipe(take(1)).subscribe();

    this.formService.ResetFormFields();
    if (!this.isEditMode()) {
      this.listenToJobIdChanges();
    } else {
      this.LoadEmployeeDetails();
    }
  }

  resetForm() {
    this.formService.ResetFormFields();
  }

  listenToJobIdChanges() {
    this.formService.job.valueChanges.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      takeUntilDestroyed(this.destroyRef),
      tap(() => {
        this.jobIdErrorMessage.set(null);
      }), // Clear error when new value is entered
      switchMap(() => {
        if (!this.formService.job.value) {
          return of(null);
        }
        return this.employeeStore.getEmployeeDateFromHR(this.formService.job.value!).pipe(
          catchError((error) => {
            // Handle error gracefully without crashing
            this.jobIdErrorMessage.set(this.i18nService.translate('users.dialog.Add.invalidJobNo'));
            this.formService.form.patchValue({
              nameAr: null,
              nameEn: null,
              email: null,
              phoneNumber: null,
              roleId: null,
            })
            return of(null);
          })
        )
      }
      )
    ).subscribe({
      next: (res) => {
        if (res?.body) {
          this.jobIdErrorMessage.set(null); // Clear error on success
          this.formService.form.patchValue({
            nameAr: res.body.nameAr,
            nameEn: res.body.nameEn,
            email: res.body.email,
            phoneNumber: res.body.phoneNumber,
          });
        }
      },
    });
  }

  handelEmployFilterList(roleId: string) {
    const roles = this.roleStore.filteredRoles();
    const filteredRole = roles.find((r: IRole) => r.id === roleId);
    if (!filteredRole) {
      const role = this.roleStore.systemRoles().find((r: IRole) => r.id === roleId);
      this.roleStore.addRoleToFilteredRoles(role!);
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
      employeeID: form.controls.job.value!,
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
            this.onSuccess.emit()
            this.dialogVisible.set(false);
            return;
          }
        }),
        take(1),
      )
      .subscribe({
        next: (res) => {
          if (res.success) {
            this.toasterService.success(this.i18nService.translate('users.messages.employeeAddedSuccess'));
            this.formService.ResetFormFields();
            this.onSuccess.emit(); // update table
            this.dialogVisible.set(false);
          }
        }
      }
      );
  }

  UpdateExistingEmployee() {
    const form = this.formService.form;
    const req: IUpdateSystemEmployeeRequest = {
      id: this.SelectedItem()?.id ?? '',
      name_Ar: form.controls.nameAr.value!,
      name_En: form.controls.nameEn.value!,
      phoneNumber: form.controls.phoneNumber.value!,
      roleId: String(form.controls.roleId.value!),
    };
    this.employeeStore
      .updateSystemEmployee(req)
      .pipe(
        tap((res) => {
          if (res.errors) {
            this.onSuccess.emit();
            this.dialogVisible.set(false);
            return;
          }
        }),
        take(1),
      )
      .subscribe({
        next: (res) => {
          if (res.success) {
            this.toasterService.success(this.i18nService.translate('users.messages.employeeUpdatedSuccess'));
            this.formService.ResetFormFields();
            this.dialogVisible.set(false);
            this.onSuccess.emit(); // update table
          }
        },
      });
  }

  LoadEmployeeDetails() {
    const selectedId = this.SelectedItem()?.id;
    if (!selectedId) return;
    this.employeeStore.getSystemEmployeeDetails(selectedId).subscribe({
      next: (res) => {
        const employee = res.body;
        if (employee) {
          this.handelEmployFilterList(employee.roleId);
          this.formService.patchForm(employee, this.isEditMode());
        }
      },
    });
  }

}
