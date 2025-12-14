import { TestBed } from '@angular/core/testing';

import { AddHolidayFormService } from './add-holiday-form-service';

describe('AddHolidayFormService', () => {
  let service: AddHolidayFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AddHolidayFormService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
