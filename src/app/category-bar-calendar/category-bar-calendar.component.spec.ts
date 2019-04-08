import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CategoryBarCalendarComponent } from './category-bar-calendar.component';

describe('CategoryBarCalendarComponent', () => {

  let component: CategoryBarCalendarComponent;
  let fixture: ComponentFixture<CategoryBarCalendarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CategoryBarCalendarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CategoryBarCalendarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  
});
