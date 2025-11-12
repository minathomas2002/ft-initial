import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardsPageLayout } from './cards-page-layout';

describe('CardsPageLayout', () => {
  let component: CardsPageLayout;
  let fixture: ComponentFixture<CardsPageLayout>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardsPageLayout]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CardsPageLayout);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
