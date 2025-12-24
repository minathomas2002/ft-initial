import { TestBed } from '@angular/core/testing';

import { InvestorPlanStatus } from './investor-plan-status';

describe('InvestorPlanStatus', () => {
  let service: InvestorPlanStatus;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InvestorPlanStatus);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
