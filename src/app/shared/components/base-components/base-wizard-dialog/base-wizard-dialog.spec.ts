import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BaseWizardDialog } from './base-wizard-dialog';

describe('BaseWizardDialog', () => {
  let component: BaseWizardDialog;
  let fixture: ComponentFixture<BaseWizardDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BaseWizardDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BaseWizardDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
