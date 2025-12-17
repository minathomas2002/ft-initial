import { TestBed } from '@angular/core/testing';

import { AssignReassignFormService } from './assign-reassign-form-service';

describe('AssignReassignFormService', () => {
  let service: AssignReassignFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AssignReassignFormService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
