import { TestBed } from '@angular/core/testing';

import { AddEmployeeFormService } from './add-employee-form-service';

describe('AddEmployeeFormService', () => {
  let service: AddEmployeeFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AddEmployeeFormService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
