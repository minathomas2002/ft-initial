import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateOpportunityDialog } from './create-opportunity-dialog';

describe('CreateOpportunityDialog', () => {
  let component: CreateOpportunityDialog;
  let fixture: ComponentFixture<CreateOpportunityDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateOpportunityDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateOpportunityDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
