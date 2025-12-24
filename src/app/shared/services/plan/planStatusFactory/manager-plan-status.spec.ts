import { TestBed } from '@angular/core/testing';

import { ManagerPlanStatus } from './manager-plan-status';

describe('ManagerPlanStatus', () => {
  let service: ManagerPlanStatus;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ManagerPlanStatus);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
