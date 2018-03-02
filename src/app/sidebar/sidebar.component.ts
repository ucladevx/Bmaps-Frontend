import { Component, OnInit, Input, HostBinding } from '@angular/core';
import { Event } from '../event';
import { EVENTS } from '../mock-events';
import { MapService } from '../map.service';
import { DateService } from '../shared/date.service';

@Component({
    selector: 'app-sidebar',
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.css'],
    providers: [ DateService ]
})
export class SidebarComponent implements OnInit {
    private events;

    selectedEvent: Event;
    show = true;


    constructor(private mapService: MapService, private _dateService: DateService) { }

    ngOnInit() {
        this.getEvents();

    }

    toHTML(input) : any {
        return new DOMParser().parseFromString(input, "text/html").documentElement.textContent;
    }
    
    getEvents(): void {
        this.mapService.getAllEvents().subscribe(events => {
        this.events = events.features;
        for (var event of this.events) {
            this._dateService.formatDateItem(event);
        }
    })
    }

    showSidebar(result: boolean) {
        this.show = true;
    }  


    onSelect(event: Event): void {
        this.selectedEvent = event;
        console.log("selectedEvent");
        this.show = false;
    }
}
