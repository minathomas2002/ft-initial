import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VisitorLayout } from './visitor-layout';

describe('VisitorLayout', () => {
  let component: VisitorLayout;
  let fixture: ComponentFixture<VisitorLayout>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VisitorLayout]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VisitorLayout);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
