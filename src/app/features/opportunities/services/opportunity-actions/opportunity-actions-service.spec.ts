import { TestBed } from '@angular/core/testing';

import { OpportunityActionsService } from './opportunity-actions-service';

describe('OpportunityActionsService', () => {
  let service: OpportunityActionsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OpportunityActionsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
