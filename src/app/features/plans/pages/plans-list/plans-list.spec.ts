import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlansList } from './plans-list';

describe('PlansList', () => {
  let component: PlansList;
  let fixture: ComponentFixture<PlansList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlansList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlansList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
