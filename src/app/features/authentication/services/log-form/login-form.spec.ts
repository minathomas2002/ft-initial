import { TestBed } from '@angular/core/testing';

import { LoginForm } from './login-form';

describe('LoginForm', () => {
  let service: LoginForm;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LoginForm);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
