import { TestBed } from '@angular/core/testing';

import { HolidayManagedFilter } from './holiday-managed-filter';

describe('HolidayManagedFilter', () => {
  let service: HolidayManagedFilter;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HolidayManagedFilter);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
