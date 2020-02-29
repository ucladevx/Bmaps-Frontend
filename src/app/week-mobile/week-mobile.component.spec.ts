import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { WeekMobileComponent } from './week-mobile.component';

describe('WeekMobileComponent', () => {

  let component: WeekMobileComponent;
  let fixture: ComponentFixture<WeekMobileComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WeekMobileComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WeekMobileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  
});
