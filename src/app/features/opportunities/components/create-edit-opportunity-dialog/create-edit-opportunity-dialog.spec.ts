import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateEditOpportunityDialog } from './create-edit-opportunity-dialog';

describe('CreateEditOpportunityDialog', () => {
  let component: CreateEditOpportunityDialog;
  let fixture: ComponentFixture<CreateEditOpportunityDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateEditOpportunityDialog]
    })
      .compileComponents();

    fixture = TestBed.createComponent(CreateEditOpportunityDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
