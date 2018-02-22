import { Component, OnInit } from '@angular/core';
import { Event } from '../events';
import { EVENTS } from '../mock-events'


@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {

    events = EVENTS;

    selectedEvent: Event;

  constructor() { }

  ngOnInit() {
  }

  onSelect(event: Event): void {
      this.selectedEvent = event;
  }

}
