import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InvestorsFilter } from './investors-filter';

describe('InvestorsFilter', () => {
  let component: InvestorsFilter;
  let fixture: ComponentFixture<InvestorsFilter>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InvestorsFilter],
    }).compileComponents();

    fixture = TestBed.createComponent(InvestorsFilter);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

