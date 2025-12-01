import { TestBed } from '@angular/core/testing';

import { UsersFilterService } from './employee-filter-service';

describe('UsersFilterService', () => {
  let service: UsersFilterService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UsersFilterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
