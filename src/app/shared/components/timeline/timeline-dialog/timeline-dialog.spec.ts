import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimelineDialog } from './timeline-dialog';

describe('TimelineDialog', () => {
  let component: TimelineDialog;
  let fixture: ComponentFixture<TimelineDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TimelineDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TimelineDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
