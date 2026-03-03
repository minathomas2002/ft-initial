import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddContactUsDialog } from './add-contact-us-dialog';

describe('AddContactUsDialog', () => {
  let component: AddContactUsDialog;
  let fixture: ComponentFixture<AddContactUsDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddContactUsDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddContactUsDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
