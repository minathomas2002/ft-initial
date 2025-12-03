import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InvestorsList } from './investors-list';

describe('InvestorsList', () => {
  let component: InvestorsList;
  let fixture: ComponentFixture<InvestorsList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InvestorsList, HttpClientTestingModule],
    }).compileComponents();

    fixture = TestBed.createComponent(InvestorsList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

