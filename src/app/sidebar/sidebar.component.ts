import { Component, OnInit } from '@angular/core';
import { Event } from '../event';
import { EVENTS } from '../mock-events';
import { MapService } from '../map.service'
import { AfterViewInit, ViewChild } from '@angular/core';
import { CategoryBarComponent } from '../category-bar/category-bar.component';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {

  private events;
  private filteredEvents;
  @ViewChild(CategoryBarComponent)
  private categoryBar: CategoryBarComponent;

  selectedEvent: Event;


  constructor(private mapService: MapService) { }

  ngOnInit() {
      this.getEvents();
  }

  getEvents(): void {
    // console.log(this.mapService.getAllEvents().features);
    this.mapService.getAllEvents().subscribe(events => {
      this.events = events.features;
      this.filteredEvents = events.features;
      this.initCategoryBar();
    })
  }

  onSelect(event: Event): void {
    this.selectedEvent = event;
  }

  filterByCategory(category: string): void {
    if (category === "all") {
      this.filteredEvents = this.events;
      return;
    }
    var tempEvents = [];
    for (let e of this.events) {
      if (category.toLowerCase() === e.properties.category.toLowerCase()) {
        tempEvents.push(e);
      }
    }
    this.filteredEvents = tempEvents;
  }

  initCategoryBar(): void { this.categoryBar.getCategories(this.events) }
}
