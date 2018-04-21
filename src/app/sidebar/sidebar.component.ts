import { Component, OnInit, Input, Output, HostBinding, EventEmitter } from '@angular/core';
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
    public filteredEvents: GeoJson[];
    public clickedEvent: GeoJson;
    public hoveredEvent: GeoJson;
    show: boolean = true;
    @Output() pressed: EventEmitter<boolean> = new EventEmitter();

    constructor(private eventService: EventService, private _dateService: DateService) { }

    ngOnInit() {
        this.eventService.filteredCurrEvents$.subscribe(eventCollection => {
            this.filteredEvents = eventCollection.features;
        });
        this.eventService.clickedEvent$.subscribe(clickedEventInfo => {
            this.clickedEvent = clickedEventInfo;
        });
        this.eventService.hoveredEvent$.subscribe(hoveredEventInfo => {
            this.hoveredEvent = hoveredEventInfo;
        })
    }

    onSelect(event: GeoJson): void {
        // console.log("On Select", event);
        this.clickedEvent = event;
        this.show = false;
        this.eventService.updateClickedEvent(event);
    }

    showSidebar(result: boolean) {
        this.show = true;
        this.eventService.updateClickedEvent(null);
    }

    mobileSidebarStatus: boolean = false;
    toggleMobileSidebar() {
        this.mobileSidebarStatus = !this.mobileSidebarStatus;
        this.pressed.emit(true);
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
