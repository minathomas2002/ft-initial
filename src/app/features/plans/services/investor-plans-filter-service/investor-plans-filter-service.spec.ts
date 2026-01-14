import { TestBed } from '@angular/core/testing';

import { InvestorPlansFilterService } from './investor-plans-filter-service';

describe('InvestorPlansFilterService', () => {
  let service: InvestorPlansFilterService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InvestorPlansFilterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
