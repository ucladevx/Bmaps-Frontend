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
    mobileSidebarStatus: boolean = false;
    @Output() pressed: EventEmitter<boolean> = new EventEmitter();

    constructor(private eventService: EventService, private _dateService: DateService) { }

    ngOnInit() {
        this.eventService.filteredCurrEvents$.subscribe(eventCollection => {
            this.filteredEvents = eventCollection.features;
        });
        this.eventService.clickedEvent$.subscribe(clickedEventInfo => {
            this.clickedEvent = clickedEventInfo;
            if (this.clickedEvent != null){
              this.hideSidebar(this.clickedEvent);
            }
        });
        this.eventService.hoveredEvent$.subscribe(hoveredEventInfo => {
            this.hoveredEvent = hoveredEventInfo;
            console.log(this.hoveredEvent);
        });
    }

    // Hides sidebar when event on sidebar is clicked to reveal eventDetail.
    // We want to call the function when there is a change to event we're subscribing to
    onSelect(event: GeoJson): void {
        console.log("onSelect");
        console.log()
        this.eventService.updateClickedEvent(event);
        this.hideSidebar(event);
    }

    onHover(event: GeoJson): void {
        console.log('before hovering');
        console.log(this.hoveredEvent);
        this.hoveredEvent = event;
        this.eventService.updateHoveredEvent(event);
    }

    hideSidebar(event: GeoJson){
      this.clickedEvent = event;
      this.show = false;
    }

    //output function to reveal sidebar once we exit out of the event detail
    showSidebar(result: boolean) {
        console.log("output function");
        this.eventService.updateClickedEvent(null);
        this.show = true;
    }

    toggleMobileSidebar() {
      console.log("toggle mobile sidebar");
        this.mobileSidebarStatus = !this.mobileSidebarStatus;
        this.pressed.emit(true);
    }

    formatCategory(category: String): string {
        if (category === '<NONE>') {
            return '';
        }
        return category.charAt(0).toUpperCase() + category.slice(1).toLowerCase();
    }
}
