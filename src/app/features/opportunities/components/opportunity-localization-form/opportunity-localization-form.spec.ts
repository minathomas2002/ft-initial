import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OpportunityLocalizationForm } from './opportunity-localization-form';

describe('OpportunityLocalizationForm', () => {
  let component: OpportunityLocalizationForm;
  let fixture: ComponentFixture<OpportunityLocalizationForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OpportunityLocalizationForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OpportunityLocalizationForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
