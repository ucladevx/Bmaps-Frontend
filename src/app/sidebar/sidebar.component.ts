import { Component, OnInit } from '@angular/core';
import { Event } from '../event';
import { EVENTS } from '../mock-events';
import { MapService } from '../map.service'

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {

  private events;
  private filteredEvents;

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
    })
  }

  onSelect(event: Event): void {
    this.selectedEvent = event;
  }

  filterByCategory(category: string): void {
    this.filteredEvents = [];
    for (let e of this.events) {
      if (category.toLowerCase() == e.properties.category.toLowerCase()) {
        this.filteredEvents.push(e);
      }
    }
  }
}
