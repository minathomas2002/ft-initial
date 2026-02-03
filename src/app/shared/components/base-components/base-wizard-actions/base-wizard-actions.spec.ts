import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BaseWizardActions } from './base-wizard-actions';

describe('BaseWizardActions', () => {
  let component: BaseWizardActions;
  let fixture: ComponentFixture<BaseWizardActions>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BaseWizardActions]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BaseWizardActions);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
