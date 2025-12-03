import { TestBed } from '@angular/core/testing';

import { ChangeRoleFormService } from './change-role-form-service';

describe('ChangeRoleFormService', () => {
  let service: ChangeRoleFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ChangeRoleFormService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
