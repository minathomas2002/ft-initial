import { TestBed } from '@angular/core/testing';
import { SystemEmployeesApiService } from './system-employees-api-service';

describe('SystemEmployeesApiService', () => {
  let service: SystemEmployeesApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SystemEmployeesApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
