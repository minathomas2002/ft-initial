import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataCards } from './data-cards';

describe('DataCards', () => {
  let component: DataCards;
  let fixture: ComponentFixture<DataCards>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DataCards]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DataCards);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
