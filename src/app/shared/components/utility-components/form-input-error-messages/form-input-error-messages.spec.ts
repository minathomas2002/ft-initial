import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormInputErrorMessages } from './form-input-error-messages';

describe('FormInputErrorMessages', () => {
  let component: FormInputErrorMessages;
  let fixture: ComponentFixture<FormInputErrorMessages>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormInputErrorMessages]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormInputErrorMessages);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
