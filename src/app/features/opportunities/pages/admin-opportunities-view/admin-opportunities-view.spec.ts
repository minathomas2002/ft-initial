import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminOpportunitiesView } from './admin-opportunities-view';

describe('AdminOpportunitiesView', () => {
  let component: AdminOpportunitiesView;
  let fixture: ComponentFixture<AdminOpportunitiesView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminOpportunitiesView]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminOpportunitiesView);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
