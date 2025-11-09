import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GeneralConfirmationDialogComponent } from './general-confirmation-dialog.component';

describe('GeneralConfirmationDialogComponent', () => {
  let component: GeneralConfirmationDialogComponent;
  let fixture: ComponentFixture<GeneralConfirmationDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GeneralConfirmationDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GeneralConfirmationDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
