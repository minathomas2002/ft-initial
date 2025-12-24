import { TestBed } from '@angular/core/testing';

import { HandlePlanStatusFactory } from './handle-plan-status-factory';

describe('HandlePlanStatusFactory', () => {
  let service: HandlePlanStatusFactory;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HandlePlanStatusFactory);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
