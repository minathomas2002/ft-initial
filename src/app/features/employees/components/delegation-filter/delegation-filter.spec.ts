import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DelegationFilter } from './delegation-filter';

describe('DelegationFilter', () => {
  let component: DelegationFilter;
  let fixture: ComponentFixture<DelegationFilter>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DelegationFilter]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DelegationFilter);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
