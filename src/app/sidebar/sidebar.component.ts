import { Component, OnInit, Input, Output, HostBinding, EventEmitter } from '@angular/core';
import { AfterViewInit, ViewChildren, ElementRef, QueryList, TemplateRef, ViewContainerRef } from '@angular/core';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { Router, RouterLinkActive, ActivatedRoute } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { Observable } from 'rxjs/Observable';
import { ICalendar } from 'datebook';
import { FeatureCollection, GeoJson } from '../map';
import { DateService } from '../services/date.service';
import { EventService } from '../services/event.service';
import { ModalComponent } from '../modal/modal.component';
import { ModalService } from '../services/modal.service';
import { ViewState } from '../view-enum';
import * as moment from 'moment';

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

  // current view
  public view: ViewState;
  // events to display in sidebar
  public filteredEvents: GeoJson[] = [];
  public clickedEvent: GeoJson;
  public hoveredEvent: GeoJson;
  // add to calendar event
  public calendarEvent: GeoJson;
  public fileUrl;
  // mobile checker
  public mobileSidebarVisible: boolean = false;

  @Input() onPress: () => void;
  @Input() pressed$: Observable<boolean>;
  @ViewChildren('eventList') private eventList: QueryList<ElementRef>;
  @ViewChildren('modal_1') modal_1: TemplateRef<any>;
  @ViewChildren('vc') vc: ViewContainerRef;

  constructor(private sanitizer: DomSanitizer, private router: Router, public _eventService: EventService, private _dateService: DateService, private modalService: ModalService) {}

  ngOnInit() {

    this.router.navigate( ['', {outlets: {sidebar: ['list']}}]);

    // whenever current view changes, update view and sidebar events
    this._eventService.currentView$.subscribe(view => {
      this.view = view;
      this.updateSidebarEvents();
    });

    // whenever filtered day events changes, if in map view, update view and sidebar events
    this._eventService.filteredDayEvents$.subscribe(events => {
      if(this._eventService.isMapView())
        this.view = ViewState.map; this.updateSidebarEvents();
    });

    // whenever filtered three day events changes, if in three day view, update view and sidebar events
    this._eventService.filteredThreeDayEvents$.subscribe(events => {
      if(this._eventService.isThreeDayView())
        this.view = ViewState.threeday; this.updateSidebarEvents();
    });

    // whenever filtered week events changes, if in week view, update view and sidebar events
    this._eventService.filteredWeekEvents$.subscribe(events => {
      if(this._eventService.isWeekView())
        this.view = ViewState.week; this.updateSidebarEvents();
    });

    // whenever filtered month events changes, if in month view, update view and sidebar events
    this._eventService.filteredMonthEvents$.subscribe(events => {
      if(this._eventService.isMonthView()) {
        this.view = ViewState.month; this.updateSidebarEvents();
      }
    });

    // whenever clicked event changes, scroll to event
    this._eventService.clickedEvent$.subscribe(clickedEventInfo => {
      this.clickedEvent = clickedEventInfo;
      this.scrollToEvent(clickedEventInfo,'nearest');
      if(!clickedEventInfo) {
        let _this = this;
        setTimeout(function(){
          _this.scrollToFirstEventOf(_this._eventService.getSelectedDate())
        }, 0.1);
      }
    });

    // whenever hovered event changes, scroll to event
    this._eventService.hoveredEvent$.subscribe(hoveredEventInfo => {
      this.hoveredEvent = hoveredEventInfo;
      this.scrollToEvent(hoveredEventInfo,'nearest');
    });

    // whenever selected date changes, scroll to first event in day
    this._eventService.selectedDate$.subscribe(date => {
      this.endHover();
      this.scrollToFirstEventOf(date);
    });

    // mobile sidebar visibility
    this.pressed$.subscribe(pressed => this.mobileSidebarVisible = pressed);

    // initialize sidebar events
    this.updateSidebarEvents();

  }

  // update events to display in sidebar
  updateSidebarEvents(): void {
    // update events
    switch(this.view) {
      case ViewState.map:
      case ViewState.day:
        this.filteredEvents = this._eventService.getFilteredDayEvents().features; break;
      case ViewState.month:
        this.filteredEvents = this._eventService.getFilteredMonthEvents().features; break;
      case ViewState.week:
        this.filteredEvents = this._eventService.getFilteredWeekEvents().features; break;
      case ViewState.threeday:
        this.filteredEvents = this._eventService.getFilteredThreeDayEvents().features; break;
    }
    // scroll to first event of selected day
    let _this = this;
    setTimeout(function(){
      _this.scrollToFirstEventOf(_this._eventService.getSelectedDate())
    }, 0.1);
  }

  // hides sidebar when event on sidebar is clicked to expand event details
  onSelect(event: any): void {
    this._eventService.updateClickedEvent(event);
    this._eventService.updateSidebarEvent(event);
    this.router.navigate(['', {outlets: {sidebar: ['detail', event.id]}}]);
    this._eventService.setSelectedDate(moment(event.properties.start_time).toDate());
  }

  // highlight event on hover
  onHover(event: GeoJson): void {
    this.hoveredEvent = event;
    this._eventService.updateHoveredEvent(event);
  }

  // end all event highlights
  endHover(): void {
    this.hoveredEvent = null;
    this.clickedEvent = null;
    this._eventService.updateHoveredEvent(null);
  }

  // format categories
  printCategories(categories: string[]) {
    if (categories) {
      let categStr: string = '';
      for (let category of categories)
        categStr += category.charAt(0).toUpperCase() + category.slice(1).toLowerCase() + ', ';
      return categStr.slice(0, categStr.length - 2).replace('_',' ');
    }
  }

  // scroll to first event in the given date
  // if no events for the given date, scroll to first event of the nearest prior day with events
  scrollToFirstEventOf(date: Date) {
    if(!this.clickedEvent && this.filteredEvents.length > 0) {
      let _this = this;
      let scrollEv;
      let searchDate = moment(date);
      while(scrollEv == undefined && searchDate.isSameOrAfter(moment(this.filteredEvents[0].properties.start_time).startOf('d'))) {
        scrollEv = this.filteredEvents.find(function(e) {
          return _this._dateService.equalDates(e.properties.start_time, searchDate);
        });
        searchDate = searchDate.clone().add(-1,'d');
      }
      if(scrollEv != undefined) this.scrollToEvent(scrollEv,'start');
      else this.scrollToEvent(this.filteredEvents[0],'start');
    }
  }

  // scroll to the DOM element for event
  scrollToEvent(event: GeoJson, scroll: string): void {
    if (event) {
      const index: number = this.filteredEvents.findIndex((e: GeoJson) => e.id == event.id);
      const element: ElementRef = this.eventList.find((e: ElementRef, i: number) => index == i);
      if (element) element.nativeElement.scrollIntoView({ block: scroll, behavior: 'smooth' });
    }
  }

  // format date subheaders
  eventDateHeader(event: GeoJson){
    let start: string = event.properties.start_time;
    return moment(start).format("MMM D");
  }

  // toggle visibility of mobile sidebar
  toggleMobileSidebar() {
    this.onPress();
  }

  // handle adding event to personal calendarEvent //

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
