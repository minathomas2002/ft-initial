import { Component, inject, signal } from '@angular/core';
import { IconField } from "primeng/iconfield";
import { InputIcon } from "primeng/inputicon";
import { HolidayManagedFilter } from '../../services/holiday-managed-filter';
import { TranslatePipe } from "../../../../shared/pipes/translate.pipe";
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-holidays-management-filter',
  imports: [IconField, InputIcon, TranslatePipe, FormsModule],
  templateUrl: './holidays-management-filter.html',
  styleUrl: './holidays-management-filter.scss',
})
export class HolidaysManagementFilter {
 disableFilterInputs = signal(false);
  holidaysManagementService = inject(HolidayManagedFilter);
  filter = this.holidaysManagementService.filter;
 holidaySearchSubject = new Subject<string>();


}
