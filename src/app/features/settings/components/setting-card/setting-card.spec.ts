import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingCard } from './setting-card';

describe('SettingCard', () => {
  let component: SettingCard;
  let fixture: ComponentFixture<SettingCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SettingCard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SettingCard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
