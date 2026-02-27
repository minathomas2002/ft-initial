import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEditDelegationDialog } from './add-edit-delegation-dialog';

describe('AddEditDelegationDialog', () => {
  let component: AddEditDelegationDialog;
  let fixture: ComponentFixture<AddEditDelegationDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddEditDelegationDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddEditDelegationDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
