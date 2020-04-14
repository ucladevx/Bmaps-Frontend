import { Component, OnInit, Input, Output, HostBinding, EventEmitter } from '@angular/core';
import { DateService } from '../services/date.service';
import { ViewService } from '../services/view.service';
import { EventService } from '../services/event.service';
import { AfterViewInit, ViewChildren, ElementRef, QueryList, TemplateRef, ViewContainerRef } from '@angular/core';
import { FeatureCollection, GeoJson } from '../map';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { Observable } from 'rxjs/Observable';
import { Router, RouterLinkActive, ActivatedRoute } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import * as moment from 'moment';
import { ICalendar } from 'datebook';
import { ModalComponent } from '../modal/modal.component';
import { ModalService } from '../services/modal.service';

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
    public calendarEvent: GeoJson;
    public fileUrl;
    public mobileSidebarVisible: boolean = false;
    @Input() onPress: () => void;
    @Input() pressed$: Observable<boolean>;
    @ViewChildren('eventList') private eventList: QueryList<ElementRef>;
    @ViewChildren('modal_1') modal_1: TemplateRef<any>;
    @ViewChildren('vc') vc: ViewContainerRef;
    constructor(private sanitizer: DomSanitizer, private router: Router, public _eventService: EventService, private _dateService: DateService, public _viewService: ViewService, private modalService: ModalService) {}

    ngOnInit() {
        // TODO: unsubscribe on destroy
        this.router.navigate( ['', {outlets: {sidebar: ['list']}}]);
        this._viewService.currentView$.subscribe(view => {
          this.updateSidebarEvents(view);
        });
        this._eventService.threeDayEvents$.subscribe(events => {
          this.updateSidebarEvents(this._viewService.getCurrentView());
        });
        this._eventService.weekEvents$.subscribe(events => {
          this.updateSidebarEvents(this._viewService.getCurrentView());
        });
        this._eventService.threeDayEvents$.subscribe(events => {
          this.updateSidebarEvents(this._viewService.getCurrentView());
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
        this._viewService.determineView();
        this.updateSidebarEvents(this._viewService.getCurrentView());
    }

    stop(event: any): void {
        console.log("Child");
        event.stopPropagation();
    }

    updateSidebarEvents(view: string): void {
      switch(view) {
        case 'map':
          this.filteredEvents = this._eventService.getDayEvents().features;
          break;
        case 'month':
          this.filteredEvents = this._eventService.getMonthEvents().features;
          console.log(this.filteredEvents);
          break;
        case 'week':
          this.filteredEvents = this._eventService.getWeekEvents().features;
          break;
        case 'three-day':
          this.filteredEvents = this._eventService.getThreeDayEvents().features;
          break;
      }
      this.filteredEvents.sort(function(a, b) {
        a = a["properties"]["start_time"];
        b = b["properties"]["start_time"];
        return a<b ? -1 : a>b ? 1 : 0;
      });
    }

    // Hides sidebar when event on sidebar is clicked to reveal eventDetail.
    // We want to call the function when there is a change to event we're subscribing to
    onSelect(event: any): void {
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

    getICSname(){
        if (typeof this.calendarEvent !== 'undefined') {
            return this.calendarEvent.properties.name + ".ics";
        } else {
            return "";
        }
    }

    createICS(event: GeoJson){
        const data = this._dateService.formatICS(this.calendarEvent);
        const blob = new Blob([data], { type: 'application/octet-stream' });
        this.fileUrl = this.sanitizer.bypassSecurityTrustResourceUrl(window.URL.createObjectURL(blob));
        this.closeModal('custom-modal-1');
    }

    openModal(event: any, geoEvent: GeoJson, id: string) {
        event.stopPropagation();
        this.modalService.open(id);
        this.calendarEvent = <GeoJson> geoEvent;
    }

    closeModal(id: string) {
        this.modalService.close(id);
    }

}
