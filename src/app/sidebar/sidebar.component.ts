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

  selectedEvent: Event;


  constructor(private mapService: MapService) { }

  ngOnInit() {
      this.getEvents();
  }
  
  getEvents(): void {
      //console.log(this.mapService.getAllEvents().features);
      this.mapService.getAllEvents().subscribe(events => this.events = events.features)
  }

  onSelect(event: Event): void {
    this.selectedEvent = event;
  }
}