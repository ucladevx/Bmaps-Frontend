import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FilterBarCalendarComponent } from './filter-bar-calendar.component';

describe('FilterBarCalendarComponent', () => {

  let component: FilterBarCalendarComponent;
  let fixture: ComponentFixture<FilterBarCalendarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FilterBarCalendarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FilterBarCalendarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

});
