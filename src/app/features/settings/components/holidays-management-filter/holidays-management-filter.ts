import { Component, computed, inject, signal } from '@angular/core';
import { IconField } from "primeng/iconfield";
import { InputIconModule } from "primeng/inputicon";
import { InputTextModule } from "primeng/inputtext";
import { HolidayManagedFilter } from '../../services/holiday-managed-filter';
import { TranslatePipe } from "../../../../shared/pipes/translate.pipe";
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { I18nService } from 'src/app/shared/services/i18n';
import { HolidaysTypeMapper } from '../../classes/holidays-type-mapper';
import { MultiSelectModule } from "primeng/multiselect";
import { DatePicker } from "primeng/datepicker";

@Component({
   selector: 'app-holidays-management-filter',
  imports: [IconField, InputIconModule, TranslatePipe, FormsModule, InputTextModule, MultiSelectModule, DatePicker],
  templateUrl: './holidays-management-filter.html',
  styleUrl: './holidays-management-filter.scss',
})
export class HolidaysManagementFilter {
 disableFilterInputs = signal(false);
  holidaysManagementService = inject(HolidayManagedFilter);
  filter = this.holidaysManagementService.filter;
  holidaySearchSubject = new Subject<string>();
  i18nService = inject(I18nService);
 holidaysTypeMapper = new HolidaysTypeMapper(this.i18nService);
  holidayTypes = computed(() => this.holidaysTypeMapper.getMappedTypesList());
 today = new Date();


}
