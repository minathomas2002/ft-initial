import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormArrayInput } from './form-array-input';

describe('FormArrayInput', () => {
  let component: FormArrayInput;
  let fixture: ComponentFixture<FormArrayInput>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormArrayInput]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormArrayInput);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
