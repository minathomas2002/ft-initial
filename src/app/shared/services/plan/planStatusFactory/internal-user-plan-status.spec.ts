import { TestBed } from '@angular/core/testing';

import { InternalUserPlanStatus } from './internal-user-plan-status';

describe('ManagerPlanStatus', () => {
  let service: InternalUserPlanStatus;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InternalUserPlanStatus);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
