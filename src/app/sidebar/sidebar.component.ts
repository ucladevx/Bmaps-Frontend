import { Component, OnInit, Input, Output, HostBinding, EventEmitter } from '@angular/core';
import { Event } from '../event';
import { DateService } from '../shared/date.service';
import { EventService } from '../event.service';
import { AfterViewInit, ViewChild } from '@angular/core';
import { FeatureCollection, GeoJson } from '../map';
import { trigger, state, style, animate, transition } from '@angular/animations';

@Component({
    selector: 'app-sidebar',
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.css'],
    providers: [ DateService ],
    animations: [
        trigger('myAwesomeAnimation', [
            state('inactive', style({
                backgroundColor: '#eee',
                fontSize: '10px'
            })),
            state('active',   style({
                backgroundColor: '#cfd8dc',
                fontSize: '30px'
            })),
            transition('inactive => active', animate('100ms ease-in')),
            transition('active => inactive', animate('100ms ease-out'))
        ])
    ]
})
export class SidebarComponent implements OnInit {
    private filteredEvents: GeoJson[];
    private selectedEvent: Event = null;
    show: boolean = true;
    @Output() pressed: EventEmitter<boolean> = new EventEmitter();

    constructor(private eventService: EventService, private _dateService: DateService) { }

    ngOnInit() {
        this.eventService.filteredCurrEvents$.subscribe(eventCollection => {
            this.filteredEvents = eventCollection.features;
        });
    }

    onSelect(event: Event): void {
        this.selectedEvent = event;
        this.show = false;
    }

    showSidebar(result: boolean) {
        this.show = true;
        this.selectedEvent = null;
    }

    status: boolean = false;
    toggleMobileSidebar() {


        this.status = !this.status;
        this.pressed.emit(true);
        console.log("hello from toggleMobile");
        // console.log(this.state);
        //   this.state = (this.state === 'inactive' ? 'active' : 'inactive');
        //   console.log(this.state);
    }

    formatCategory(category: String): string {
        if (category =="<NONE>"){
            return "";
        }
        else {
            return category.charAt(0).toUpperCase() + category.slice(1).toLowerCase();
        }
    }

}
