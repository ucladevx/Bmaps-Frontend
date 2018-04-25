import { Component, OnInit, Input, Output, HostBinding, EventEmitter } from '@angular/core';
import { DateService } from '../shared/date.service';
import { EventService } from '../event.service';
import { AfterViewInit, ViewChildren, ElementRef, QueryList } from '@angular/core';
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
    @ViewChildren('eventList') private eventList: QueryList<ElementRef>;

    constructor(private eventService: EventService, private _dateService: DateService) { }

    ngOnInit() {
        this.eventService.filteredCurrEvents$.subscribe(eventCollection => {
            this.filteredEvents = eventCollection.features;
        });
        this.eventService.clickedEvent$.subscribe(clickedEventInfo => {
            this.clickedEvent = clickedEventInfo;
            this.scrollToEvent(selectedEventInfo);
        });
        this.eventService.hoveredEvent$.subscribe(hoveredEventInfo => {
            this.hoveredEvent = hoveredEventInfo;
            this.scrollToEvent(hoveredEventInfo);
        });
    }

    onSelect(event: GeoJson): void {
        // console.log("On Select", event);
        this.clickedEvent = event;
        this.show = false;
        this.eventService.updateClickedEvent(event);
    }

    onHover(event: GeoJson): void {
        console.log('before hovering');
        console.log(this.hoveredEvent);
        this.hoveredEvent = event;
        this.eventService.updateHoveredEvent(event);
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

    // scroll to the DOM element for event
    scrollToEvent(event: GeoJson): void {
      if (event) {
        const index: number = this.filteredEvents.findIndex((e: GeoJson) => e.id == event.id);
        const element: ElementRef = this.eventList.find((e: ElementRef, i: number) => index == i);
        if (element) {
          element.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }
    }
}
