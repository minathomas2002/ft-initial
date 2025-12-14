import { TestBed } from '@angular/core/testing';

import { SlaForm } from './sla-form';

describe('SlaForm', () => {
  let service: SlaForm;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SlaForm);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
