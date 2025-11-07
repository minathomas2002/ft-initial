import { TestBed } from '@angular/core/testing';

import { LoginFormService } from './login-form';

describe('LoginForm', () => {
  let service: LoginFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LoginFormService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
