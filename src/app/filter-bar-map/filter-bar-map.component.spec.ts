import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FilterBarMapComponent } from './filter-bar-map.component';

describe('FilterBarMapComponent', () => {

  let component: FilterBarMapComponent;
  let fixture: ComponentFixture<FilterBarMapComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FilterBarMapComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FilterBarMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  
});
