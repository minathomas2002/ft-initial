import { TestBed } from '@angular/core/testing';

import { PlanApiService } from './plan-api-service';

describe('PlanApiService', () => {
  let service: PlanApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PlanApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
