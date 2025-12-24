import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimelineSkeleton } from './timeline-skeleton';

describe('TimelineSkeleton', () => {
  let component: TimelineSkeleton;
  let fixture: ComponentFixture<TimelineSkeleton>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TimelineSkeleton]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TimelineSkeleton);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
