import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WizardStepStateComponent } from './wizard-step-state.component';

describe('WizardStepStateComponent', () => {
  let component: WizardStepStateComponent;
  let fixture: ComponentFixture<WizardStepStateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WizardStepStateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WizardStepStateComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('title', 'Test Step');
    fixture.componentRef.setInput('description', 'Test Description');
    fixture.componentRef.setInput('activeStep', 1);
    fixture.componentRef.setInput('stepNumber', 1);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

