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
  i18nService = inject(I18nService);
  holidaysTypeMapper = new HolidaysTypeMapper(this.i18nService);
  holidayTypes = computed(() => this.holidaysTypeMapper.getMappedTypesList());
  today = new Date();

   onSuccess = output<void>();

   ngOnInit(){
    if (this.isEditMode())
      this.loadHolidayDetails();
   }

  loadHolidayDetails(){

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
  }

  resetForm(){
    this.formService.ResetFormFields();
  }
}
