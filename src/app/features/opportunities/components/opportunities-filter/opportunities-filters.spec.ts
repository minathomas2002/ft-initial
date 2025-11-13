import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OpportunitiesFilters } from './opportunities-filters';

describe('OpportunitiesFilters', () => {
  let component: OpportunitiesFilters;
  let fixture: ComponentFixture<OpportunitiesFilters>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OpportunitiesFilters]
    })
      .compileComponents();

    fixture = TestBed.createComponent(OpportunitiesFilters);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
