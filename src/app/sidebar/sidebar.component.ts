import { Component, OnInit, Input, Output, HostBinding, EventEmitter } from '@angular/core';
import { DateService } from '../services/date.service';
import { ViewService } from '../services/view.service';
import { EventService } from '../services/event.service';
import { AfterViewInit, ViewChildren, ElementRef, QueryList } from '@angular/core';
import { FeatureCollection, GeoJson } from '../map';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { Observable } from 'rxjs/Observable';
import { Router, RouterLinkActive, ActivatedRoute } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import * as moment from 'moment';
import { ICalendar } from 'datebook';

@Component({
    selector: 'app-sidebar',
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.scss'],
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
    fileUrl;
    msgData1 = "wow";
    msgData2 = "woe";
    msgData3 = "hee";
    public mobileSidebarVisible: boolean = false;
    @Input() onPress: () => void;
    @Input() pressed$: Observable<boolean>;
    @ViewChildren('eventList') private eventList: QueryList<ElementRef>;

    constructor(private sanitizer: DomSanitizer, private router: Router, public _eventService: EventService, private _dateService: DateService, public _viewService: ViewService) {}

    ngOnInit() {
        // TODO: unsubscribe on destroy
        this.router.navigate( ['', {outlets: {sidebar: ['list']}}]);
        this._eventService.dayEvents$.subscribe(eventCollection => {
          eventCollection.features.sort(function(a,b){
              return moment(a.properties.start_time).diff(moment(b.properties.start_time),'seconds');
          });
          this.filteredEvents = eventCollection.features;
        });
        this._eventService.filteredDayEvents$.subscribe(eventCollection => {
            this.filteredEvents = eventCollection.features;
        });
        this._eventService.clickedEvent$.subscribe(clickedEventInfo => {
            this.clickedEvent = clickedEventInfo;
            this.scrollToEvent(clickedEventInfo);
        });
        this._eventService.hoveredEvent$.subscribe(hoveredEventInfo => {
            this.hoveredEvent = hoveredEventInfo;
            this.scrollToEvent(hoveredEventInfo);
        });
        this.pressed$.subscribe(pressed => this.mobileSidebarVisible = pressed);
    }

    // Hides sidebar when event on sidebar is clicked to reveal eventDetail.
    // We want to call the function when there is a change to event we're subscribing to
    onSelect(event: GeoJson): void {
        this._eventService.updateClickedEvent(event);
        this.router.navigate(['', {outlets: {sidebar: ['detail', event.id]}}]);
        this._eventService.updateExpandedEvent(event);
    }

    onHover(event: GeoJson): void {
        this.hoveredEvent = event;
        this._eventService.updateHoveredEvent(event);
    }

    toggleMobileSidebar() { this.onPress(); }

    printCategories(categories: string[]) {
      if (categories){
        let categStr: string = '';
        for (let category of categories)
          categStr += category.charAt(0).toUpperCase() + category.slice(1).toLowerCase() + ', ';
        return categStr.slice(0, categStr.length - 2).replace('_',' ');
      }
    }

    // scroll to the DOM element for event
    scrollToEvent(event: GeoJson): void {
      if (event) {
        const index: number = this.filteredEvents.findIndex((e: GeoJson) => e.id == event.id);
        const element: ElementRef = this.eventList.find((e: ElementRef, i: number) => index == i);
        if (element)
          element.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }

  // check whether an image source exists
  checkImage(imageSrc) {
      let img = new Image();
      try {
        img.src = imageSrc;
        return true;
      } catch(err) {
        return false;
      }
    }

    createICS(event: GeoJson){
        const data = `BEGIN:VCALENDAR
VERSION:2.0
X-WR-CALNAME:BMaps Events
NAME:BMaps Events
CALSCALE:GREGORIAN
BEGIN:VTIMEZONE
TZID:America/Los_Angeles
TZURL:http://tzurl.org/zoneinfo-outlook/America/Los_Angeles
X-LIC-LOCATION:America/Los_Angeles
BEGIN:DAYLIGHT
TZOFFSETFROM:-0800
TZOFFSETTO:-0700
TZNAME:PDT
DTSTART:19700308T020000
RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=2SU
END:DAYLIGHT
BEGIN:STANDARD
TZOFFSETFROM:-0700
TZOFFSETTO:-0800
TZNAME:PST
DTSTART:19701101T020000
RRULE:FREQ=YEARLY;BYMONTH=11;BYDAY=1SU
END:STANDARD
END:VTIMEZONE
BEGIN:VEVENT
DTSTAMP:20200207T225053Z
DTSTART;TZID=America/Los_Angeles:` + this._dateService.formatEventCalendarStart(event) +
`\nDTEND;TZID=America/Los_Angeles:` + this._dateService.formatEventCalendarEnd(event) +
`\nSUMMARY:` + event.properties.name +
`\nDESCRIPTION:` + event.properties.description +
`\nLOCATION:` + event.properties.place.location.street + //loc??
`\nEND:VEVENT
END:VCALENDAR`
        const blob = new Blob([data], { type: 'application/octet-stream' });
        this.fileUrl = this.sanitizer.bypassSecurityTrustResourceUrl(window.URL.createObjectURL(blob));
    }

}
