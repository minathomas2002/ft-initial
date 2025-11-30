import { Component, computed, inject, input, model } from '@angular/core';
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
import { IUserCreate } from 'src/app/shared/interfaces';
import { UsersStore } from 'src/app/shared/stores/users/users.store';
import { take, tap } from 'rxjs';
import { ToasterService } from 'src/app/shared/services/toaster/toaster.service';

@Component({
  selector: 'app-add-edit-employee-dialog',
  imports: [BaseDialogComponent, TranslatePipe, ReactiveFormsModule, Select, Message, BaseLabelComponent],
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
   userRoles = computed(() => 
    this.roleStore.list().map(role => ({
      label: this.userRoleMapper.getTranslatedRole(role.code),
      value: role.id
    })).filter(option => option.value !== undefined)
  );


   ngOnInit() {    
   this.roleStore.getFilteredRoles().subscribe();
   if(this.isEditMode())
    this.LoadEmployeeDetails();
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
           this.toasterService.success('Employee Added Successfully');
        this.resetForm();
        this.dialogVisible.set(false);
       // this.onSuccess.emit(); update table

				}),
				take(1),
			)
			.subscribe();

  console.log(req); // test output
    
  }

  UpdateExisitingEmployee() {
    console.log(this.formService.form.getRawValue());
  }

  LoadEmployeeDetails(){
    //patch form values
  }

 resetForm = () => {
    this.formService.form.reset();
  };

isProcessing():boolean{

 return false;

}
}
