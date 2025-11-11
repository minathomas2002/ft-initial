import { TestBed } from '@angular/core/testing';

import { OpportunitiesApiService } from './opportunities-api-service';

describe('OpportunitiesApiService', () => {
  let service: OpportunitiesApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OpportunitiesApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
