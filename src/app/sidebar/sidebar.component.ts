import { Component, OnInit, Input, HostBinding } from '@angular/core';
import { Event } from '../event';
import { DateService } from '../shared/date.service';
import { EventService } from '../event.service';
import { AfterViewInit, ViewChild } from '@angular/core';
import { FeatureCollection, GeoJson } from '../map';

@Component({
    selector: 'app-sidebar',
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.css'],
    providers: [ DateService ],
})
export class SidebarComponent implements OnInit {
    private filteredEvents: GeoJson[];
    private selectedEvent: Event = null;
    show: boolean = true;

    constructor(private eventService: EventService) { }

    ngOnInit() {
      this.eventService.filteredCurrEvents$.subscribe(eventCollection => {
        this.filteredEvents = eventCollection.features;
      });
    }

    toHTML(input) : any {
        return new DOMParser().parseFromString(input, "text/html").documentElement.textContent;
    }

    onSelect(event: Event): void {
        this.selectedEvent = event;
        this.show = false;
    }

    showSidebar(result: boolean) {
        this.show = true;
        this.selectedEvent = null;
    }
}
