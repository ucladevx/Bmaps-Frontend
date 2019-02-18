import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CategoryBarMapComponent } from './category-bar-map.component';

describe('CategoryBarMapComponent', () => {
  let component: CategoryBarMapComponent;
  let fixture: ComponentFixture<CategoryBarMapComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CategoryBarMapComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CategoryBarMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
