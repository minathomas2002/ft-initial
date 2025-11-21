import { TestBed } from '@angular/core/testing';

import { InvestorOpportunitiesFilterService } from './investor-opportunities-filter-service';

describe('OpportunitiesFilterService', () => {
  let service: InvestorOpportunitiesFilterService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InvestorOpportunitiesFilterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
