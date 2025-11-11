import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardsSkeleton } from './cards-skeleton';

describe('CardsSkeleton', () => {
  let component: CardsSkeleton;
  let fixture: ComponentFixture<CardsSkeleton>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardsSkeleton]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CardsSkeleton);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
