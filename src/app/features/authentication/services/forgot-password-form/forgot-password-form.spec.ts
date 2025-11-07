import { TestBed } from '@angular/core/testing';

import { ForgotPasswordFormService } from './forgot-password-form';

describe('ForgotPasswordForm', () => {
  let service: ForgotPasswordFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ForgotPasswordFormService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
