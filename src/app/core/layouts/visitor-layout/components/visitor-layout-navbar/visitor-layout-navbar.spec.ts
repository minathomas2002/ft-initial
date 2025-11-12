import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VisitorLayoutNavbar } from './visitor-layout-navbar';

describe('VisitorLayoutNavbar', () => {
  let component: VisitorLayoutNavbar;
  let fixture: ComponentFixture<VisitorLayoutNavbar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VisitorLayoutNavbar]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VisitorLayoutNavbar);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
