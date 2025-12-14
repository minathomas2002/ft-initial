import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEditHolidayDialog } from './add-edit-holiday-dialog';

describe('AddEditHolidayDialog', () => {
  let component: AddEditHolidayDialog;
  let fixture: ComponentFixture<AddEditHolidayDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddEditHolidayDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddEditHolidayDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
