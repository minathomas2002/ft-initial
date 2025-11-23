import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OpportunityInformationForm } from './opportunity-information-form';

describe('OpportunityInformationForm', () => {
  let component: OpportunityInformationForm;
  let fixture: ComponentFixture<OpportunityInformationForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OpportunityInformationForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OpportunityInformationForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
