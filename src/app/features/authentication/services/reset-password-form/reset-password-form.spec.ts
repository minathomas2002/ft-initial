import { TestBed } from '@angular/core/testing';

import { ResetPasswordFormService } from './reset-password-form';

describe('ResetPasswordFormService', () => {
  let service: ResetPasswordFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ResetPasswordFormService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

