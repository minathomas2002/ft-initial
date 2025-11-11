import { TestBed } from '@angular/core/testing';

import { OpportunitiesFilterService } from './opportunities-filter-service';

describe('OpportunitiesFilterService', () => {
  let service: OpportunitiesFilterService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OpportunitiesFilterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
