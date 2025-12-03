import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEditEmployeeDialog } from './add-edit-employee-dialog';

describe('AddEditEmployeeDialog', () => {
  let component: AddEditEmployeeDialog;
  let fixture: ComponentFixture<AddEditEmployeeDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddEditEmployeeDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddEditEmployeeDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
