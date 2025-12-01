import { Component, computed, effect, inject, input, model, output } from '@angular/core';
import { BaseDialogComponent } from "src/app/shared/components/base-components/base-dialog/base-dialog.component";
import { TranslatePipe } from "../../../../shared/pipes/translate.pipe";
import { AddEmployeeFormService } from '../../services/add-employee-form/add-employee-form-service';
import { BaseLabelComponent } from "src/app/shared/components/base-components/base-label/base-label.component";
import { RolesStore } from 'src/app/shared/stores/roles/roles.store';
import { UserRoleMapper } from '../../classes/user-role-mapper';
import { I18nService } from 'src/app/shared/services/i18n';
import { Select } from "primeng/select";
import { Message } from "primeng/message";
import { ReactiveFormsModule } from '@angular/forms';
import { IUser, IUserCreate, IUserEdit, IUserRecord } from 'src/app/shared/interfaces';
import { UsersStore } from 'src/app/shared/stores/users/users.store';
import { filter, skip, take, tap } from 'rxjs';
import { ToasterService } from 'src/app/shared/services/toaster/toaster.service';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-add-edit-employee-dialog',
  imports: [BaseDialogComponent, TranslatePipe, ReactiveFormsModule, Select, Message, BaseLabelComponent,InputTextModule],
  templateUrl: './add-edit-employee-dialog.html',
  styleUrl: './add-edit-employee-dialog.scss',
})
export class AddEditEmployeeDialog {

  dialogVisible = model<boolean>(false);
  isEditMode = input<boolean>(false);
  formService = inject(AddEmployeeFormService);
  roleStore = inject(RolesStore);
  userStore = inject(UsersStore);
  i18nService = inject(I18nService);
  toasterService = inject(ToasterService);
  userRoleMapper = new UserRoleMapper(this.i18nService);
  SelectedItem = model<IUserRecord |null>();
  onSuccess =  output<void>();
  userRoles = computed(() => {
    const roles = this.roleStore.list();
    const selected = this.SelectedItem();
    let list = roles.map(role => ({
      label: role.name, //this.userRoleMapper.getTranslatedRole(role.code),
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
        .pipe(filter(jobId => !!jobId))
        .subscribe(() => this.GetUserByJobId());
    }else {
      this.LoadEmployeeDetails();
    }
  }


  onConfirm(){
 // check if create or edit 
    if(this.isEditMode())
      this.UpdateExisitingEmployee();
    else
      this.SubmitNEwEmployee();
 
  }

  // case Create New User
  SubmitNEwEmployee() {
    const form = this.formService.form;
    const req: IUserCreate = {
      employeeID: form.controls.employeeID.value!,
      nameAr: form.controls.nameAr.value!,
      nameEn: form.controls.nameEn.value!,
      email: form.controls.email.getRawValue()?? '',  // since it's disabled
      phoneNumber: form.controls.phoneNumber.value!,
      roleId: String(form.controls.roleId.value!),  // convert enum/number to string
      job: form.controls.job.value!,
    };
  	this.userStore
			.CreateEmployee(req)
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
        this.toasterService.success(res.message[0]);
        this.resetForm();
        this.dialogVisible.set(false);
       this.onSuccess.emit(); // update table
        },
      } 
    );
  }

  UpdateExisitingEmployee() {
    const form = this.formService.form;
    const req: IUserEdit = {
      id: this.SelectedItem()?.id?? '',
      name_Ar: form.controls.nameAr.value!,
      name_En: form.controls.nameEn.value!,
      phoneNumber: form.controls.phoneNumber.value!,
      roleId: String(form.controls.roleId.value!),  
    };
  	this.userStore
			.updateEmployee(req)
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
        this.toasterService.success(res.message[0]);
        this.resetForm();
        this.dialogVisible.set(false);
       this.onSuccess.emit(); // update table
      },
    });
  }

  LoadEmployeeDetails(){
   const selectedId = this.SelectedItem()?.id;
   if (!selectedId) return;
   this.userStore.getUserDetails(selectedId).subscribe({
    next: () => {
      const user = this.userStore.user(); 
      if (user) this.formService.patchForm(user, this.isEditMode());
    }
  });

  }

  GetUserByJobId(){
    const form = this.formService.form;
  	this.userStore
			.getUserByID(form.controls.job.value!)
      .subscribe({
      next: (res) => {
        this.formService.form.patchValue(res.body);
      },
    });
  }

 resetForm = () => {
    this.formService.ResetFormFields();
  };

  isProcessing():boolean{
   return this.roleStore.loading();
  }
}
