import { Component, computed, inject, input, model, output } from '@angular/core';
import { AddHolidayFormService } from '../../services/add-holiday-form/add-holiday-form-service';
import { I18nService } from 'src/app/shared/services/i18n';
import { HolidaysTypeMapper } from '../../classes/holidays-type-mapper';
import { BaseDialogComponent } from "src/app/shared/components/base-components/base-dialog/base-dialog.component";
import { TranslatePipe } from "../../../../shared/pipes/translate.pipe";
import { BaseLabelComponent } from "src/app/shared/components/base-components/base-label/base-label.component";
import { InputTextModule } from 'primeng/inputtext';
import { ReactiveFormsModule } from '@angular/forms';
import { BaseErrorComponent } from "src/app/shared/components/base-components/base-error/base-error.component";
import { Select } from "primeng/select";
import { DatePicker } from "primeng/datepicker";
import { AdminSettingsStore } from 'src/app/shared/stores/settings/admin-settings.store';
import { IHolidayCreating, IHolidaysManagementRecord } from 'src/app/shared/interfaces/ISetting';
import { take, tap } from 'rxjs';
import { ToasterService } from 'src/app/shared/services/toaster/toaster.service';
import { item } from '@primeuix/themes/aura/breadcrumb';

@Component({
  selector: 'app-add-edit-holiday-dialog',
  imports: [BaseDialogComponent, TranslatePipe, BaseLabelComponent, InputTextModule, ReactiveFormsModule, BaseErrorComponent, Select, DatePicker],
  templateUrl: './add-edit-holiday-dialog.html',
  styleUrl: './add-edit-holiday-dialog.scss',
})
export class AddEditHolidayDialog {
  dialogVisible = model<boolean>(false);
  isEditMode = input<boolean>(false);
  formService = inject(AddHolidayFormService);
  adminSettingsStore = inject(AdminSettingsStore);
  i18nService = inject(I18nService);
  holidaysTypeMapper = new HolidaysTypeMapper(this.i18nService);
  holidayTypes = computed(() => this.holidaysTypeMapper.getMappedTypesList());
  toasterService = inject(ToasterService);
  today = new Date();
  onSuccess = output<void>();
  holidayRecord = model<IHolidaysManagementRecord|null>(null);

   ngOnInit(){
    this.formService.listenToFormChanges();
    if (this.isEditMode())
      this.loadHolidayDetails();
   }

  loadHolidayDetails(){
    const holidayRecordToPatch : IHolidayCreating ={
      id: this.holidayRecord()?.id!,
      name : this.holidayRecord()?.name!,
      dateFrom : this.holidayRecord()?.dateFrom!,
      dateTo: this.holidayRecord()?.dateTo!,
      typeId: this.holidayRecord()?.typeId!
    };
    this.formService.patchForm(holidayRecordToPatch);
  }

  onConfirm() {
    // check if create or edit 
    if (this.isEditMode())
      this.UpdateExistingHoliday();
    else
      this.SubmitNewHoliday();
  }

  UpdateExistingHoliday(){
    // remeber to add id into object
  }
  
  SubmitNewHoliday(){
    const request = this.formService.loadData() as unknown as IHolidayCreating;
     this.adminSettingsStore
          .createHoliday(request)
          .pipe(
            tap((res) => {
              if (res.errors) {
                this.onSuccess.emit()
                //this.toasterService.error(res.message[0]);
                this.dialogVisible.set(false);
                return;
              }
            }),
            take(1),
          )
          .subscribe({
            next: (res) => {
              if (res.success) {
                this.toasterService.success(this.i18nService.translate('setting.adminView.holidays.dialog.createdSuccessfully'));
                this.formService.ResetFormFields();
                this.onSuccess.emit(); // update table
                this.dialogVisible.set(false);
              }
            }
          }
          );
  }


  resetForm(){
    this.formService.ResetFormFields();
  }
}
