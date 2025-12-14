import { Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { AbstractServiceFilter } from 'src/app/shared/classes/abstract-service-filter';
import { IHolidayManagementFilter } from 'src/app/shared/interfaces/ISetting';
import { HolidaysFilter } from '../../classes/holidays-filter';


@Injectable({
  providedIn: 'root',
})
export class HolidayManagedFilter  extends AbstractServiceFilter<IHolidayManagementFilter> {
  filterClass = new HolidaysFilter();
  filter = signal(this.filterClass.filter);
  
   clearAllFilters(): void {
    throw new Error('Method not implemented.');
  }
   applyFilterWithPaging(): void {
    throw new Error('Method not implemented.');
  }
   performFilter$(): Observable<unknown> {
    throw new Error('Method not implemented.');
  }

 




  
}
