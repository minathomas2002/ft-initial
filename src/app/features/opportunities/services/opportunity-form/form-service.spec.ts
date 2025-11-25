import { TestBed } from '@angular/core/testing';

import { OpportunityFormService } from './opportunity-form-service';

describe('OpportunityFormService', () => {
  let service: OpportunityFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OpportunityFormService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
