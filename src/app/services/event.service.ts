import { Injectable, EventEmitter, Output } from '@angular/core';
import { Router, RouterLinkActive, ActivatedRoute } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { FeatureCollection, GeoJson } from '../map';
import { LocationService } from './location.service';
import { DateService } from './date.service';
import { ViewState } from '../view-enum';
import * as moment from 'moment';
import { Moment } from 'moment';

// Calendar Day Interface
export interface CalendarDay {
  date: Date;                         // full date
  month: number;                      // month number
  year: number;                       // year number
  dayOfMonth: number;                 // day of month (number)
  dayOfWeek: string;                  // day of week (string)
  events: GeoJson[];                  // events on day
  isToday: boolean;                   // is day today
  isSelected: boolean;                // is day currently selected
  inCurrentMonth: boolean;            // is day in the current month
}

@Injectable()
export class EventService {

  // USEFUL URLS
  private eventsUrl = "api/events";
  private allEvents;
  private categoriesUrl = "api/events/categories";
  private categs;

  // VIEW VARIABLES
  private _currentView;             // ('three-day', month', 'week', 'map')
  private _lastView;                // ('three-day', month', 'week', 'map')

  // DATE VARIABLES
  private _visibleDays;              // currently displayed days in CalendarDay format
  private _selectedDate;             // currently selected day in Date format

  // EVENT STORAGE VARIABLES
  private _monthEvents;               // events for current month view
  private _filteredMonthEvents;       // events for current month view (filters applied)
  private _weekEvents;                // events for current week view
  private _filteredWeekEvents;        // events for current week view (filters applied)
  private _threeDayEvents;            // events for current three-day view
  private _filteredThreeDayEvents;    // events for current three-day view (filters applied)
  private _dayEvents;                 // events for current single day map view
  private _filteredDayEvents;         // events for current single day map view (filters applied)

  // SOLO EVENT VARIABLES
  private _hoveredEvent;              // current hovered event
  private _clickedEvent;              // current clicked event
  private _sidebarEvent;              // current sidebar event (event expanded in sidebar)

  // FILTER VARIABLES
  private _categHash;                 // maps event categories to selection status
  private _tagHash;                   // maps filter tags to selection status
  private _locFilter;                 // location string being applied as filter
  private _dateFilter;                // range of dates being applied as filter
  private _timeFilter;                // range of times being applied as filter

  // SOURCES
  private currentViewSource: Subject <ViewState>;
  private lastViewSource: Subject <ViewState>;
  private visibleDaysSource: Subject <any>;
  private selectedDateSource: BehaviorSubject <Date>;
  private monthEventsSource: BehaviorSubject <FeatureCollection>;
  private filteredMonthEventsSource: BehaviorSubject <FeatureCollection>;
  private weekEventsSource: BehaviorSubject <FeatureCollection>;
  private filteredWeekEventsSource: BehaviorSubject <FeatureCollection>;
  private threeDayEventsSource: BehaviorSubject <FeatureCollection>;
  private filteredThreeDayEventsSource: BehaviorSubject <FeatureCollection>;
  private dayEventsSource: BehaviorSubject <FeatureCollection>;
  private filteredDayEventsSource: BehaviorSubject <FeatureCollection>;
  private hoveredEventSource: Subject <GeoJson>;
  private clickedEventSource: Subject <GeoJson>;
  private sidebarEventSource: Subject <GeoJson>;
  private categHashSource: BehaviorSubject <any>;
  private tagHashSource: BehaviorSubject <any>;
  private locFilterSource: Subject <string>;
  private dateFilterSource: Subject <any>;
  private timeFilterSource: Subject <any>;

  // OBSERVABLES
  currentView$; lastView$;
  visibleDays$; selectedDate$;
  monthEvents$; filteredMonthEvents$;
  weekEvents$; filteredWeekEvents$;
  threeDayEvents$; filteredThreeDayEvents$;
  dayEvents$; filteredDayEvents$;
  hoveredEvent$; clickedEvent$; sidebarEvent$;
  categHash$; tagHash$;
  locFilter$; dateFilter$; timeFilter$;

  // Constructor
  constructor(private router: Router, private http: HttpClient, private _dateService: DateService, private _locationService: LocationService) {

    // For each of the following variables:
    // observable string source, observable string stream, self-subscribed local value

    // currentView
    this.currentViewSource = new Subject <ViewState> ();
    this.currentView$ = this.currentViewSource.asObservable();
    this.currentView$.subscribe(view => this._currentView = view);

    // lastView
    this.lastViewSource = new Subject <ViewState> ();
    this.lastView$ = this.lastViewSource.asObservable();
    this.lastView$.subscribe(view => this._lastView = view);

    // visibleDays
    this.visibleDaysSource = new Subject <CalendarDay[]> ();
    this.visibleDays$ = this.visibleDaysSource.asObservable();
    this.visibleDays$.subscribe(days => this._visibleDays = days);

    // selectedDate
    this.selectedDateSource = new BehaviorSubject <Date> (new Date());
    this.selectedDate$ = this.selectedDateSource.asObservable();
    this.selectedDate$.subscribe(date => this._selectedDate = date);

    // filteredMonthEvents
    this.filteredMonthEventsSource = new BehaviorSubject <FeatureCollection> (new FeatureCollection([]));
    this.filteredMonthEvents$  = this.filteredMonthEventsSource.asObservable();
    this.filteredMonthEvents$.subscribe(filteredMonthEvents => this._filteredMonthEvents = filteredMonthEvents);

    // monthEvents
    this.monthEventsSource = new BehaviorSubject <FeatureCollection> (new FeatureCollection([]));
    this.monthEvents$  = this.monthEventsSource.asObservable();
    this.monthEvents$.subscribe(monthEvents => {
      this._monthEvents = monthEvents;
      this.filteredMonthEventsSource.next(monthEvents);
    });

    // filteredWeekEvents
    this.filteredWeekEventsSource = new BehaviorSubject <FeatureCollection> (new FeatureCollection([]));
    this.filteredWeekEvents$ = this.filteredWeekEventsSource.asObservable();
    this.filteredWeekEvents$.subscribe(filteredWeekEvents => this._filteredWeekEvents = filteredWeekEvents);

    // weekEvents
    this.weekEventsSource = new BehaviorSubject <FeatureCollection> (new FeatureCollection([]));
    this.weekEvents$  = this.weekEventsSource.asObservable();
    this.weekEvents$.subscribe(weekEvents => {
      this._weekEvents = weekEvents;
      this.filteredWeekEventsSource.next(weekEvents);
    });

    // filteredThreeDayEvents
    this.filteredThreeDayEventsSource = new BehaviorSubject <FeatureCollection> (new FeatureCollection([]));
    this.filteredThreeDayEvents$ = this.filteredThreeDayEventsSource.asObservable();
    this.filteredThreeDayEvents$.subscribe(filteredThreeDayEvents => this._filteredThreeDayEvents = filteredThreeDayEvents);

    // threeDayEvents
    this.threeDayEventsSource = new BehaviorSubject <FeatureCollection> (new FeatureCollection([]));
    this.threeDayEvents$ = this.threeDayEventsSource.asObservable();
    this.threeDayEvents$.subscribe(threeDayEvents => {
      this._threeDayEvents = threeDayEvents;
      this.filteredThreeDayEventsSource.next(threeDayEvents);
    });

    // filteredDayEvents
    this.filteredDayEventsSource = new BehaviorSubject <FeatureCollection> (new FeatureCollection([]));
    this.filteredDayEvents$ = this.filteredDayEventsSource.asObservable();
    this.filteredDayEvents$.subscribe(filteredDayEvents => this._filteredDayEvents = filteredDayEvents);

    // dayEvents
    this.dayEventsSource = new BehaviorSubject <FeatureCollection> (new FeatureCollection([]));
    this.dayEvents$ = this.dayEventsSource.asObservable();
    this.dayEvents$.subscribe(dayEvents => {
      this._dayEvents = dayEvents;
      this.filteredDayEventsSource.next(dayEvents);
    });

    // hoveredEvent
    this.hoveredEventSource = new Subject <GeoJson> ();
    this.hoveredEvent$ = this.hoveredEventSource.asObservable();
    this.hoveredEvent$.subscribe(hoveredEventInfo => this._hoveredEvent = hoveredEventInfo);

    // clickedEvent
    this.clickedEventSource = new Subject <GeoJson> ();
    this.clickedEvent$ = this.clickedEventSource.asObservable();
    this.clickedEvent$.subscribe(clickedEventInfo => this._clickedEvent = clickedEventInfo);

    // sidebarEvent
    this.sidebarEventSource = new Subject <GeoJson> ();
    this.sidebarEvent$ = this.sidebarEventSource.asObservable();
    this.sidebarEvent$.subscribe(sidebarEventInfo => this._sidebarEvent = sidebarEventInfo);

    // categHash
    this.categHashSource = new BehaviorSubject <any> ({});
    this.categHash$ = this.categHashSource.asObservable();
    this.categHash$.subscribe(categHash => { this._categHash = categHash; this.applyAllFilters(); });

    // tagHash
    this.tagHashSource = new BehaviorSubject <any> ({});
    this.tagHash$ = this.tagHashSource.asObservable();
    this.tagHash$.subscribe(filterHash => { this._tagHash = filterHash; this.applyAllFilters(); });

    // locFilter
    this.locFilterSource = new Subject <string> ();
    this.locFilter$ = this.locFilterSource.asObservable();
    this.locFilter$.subscribe(locSearch => { this._locFilter = locSearch; this.applyAllFilters(); });

    // dateFilter
    this.dateFilterSource = new Subject <any> ();
    this.dateFilter$ = this.dateFilterSource.asObservable();
    this.dateFilter$.subscribe(dateHash => { this._dateFilter = dateHash; this.applyAllFilters(); });

    // timeFilter
    this.timeFilterSource = new Subject <any> ();
    this.timeFilter$ = this.timeFilterSource.asObservable();
    this.timeFilter$.subscribe(timeHash => { this._timeFilter = timeHash; this.applyAllFilters(); });

    // Initialize variables
    this.http.get <FeatureCollection> (this.getEventsURL()).subscribe(allEvents => {
      this.allEvents = allEvents;
      this.getCategories().subscribe(categs => {
        // initialize filters
        this.categs = categs;
        this.initCategories();
        this.resetFilters();
        // populate event containers
        this.updateEvents(new Date(),true,true,true);
        // set current date
        this.setSelectedDate(new Date());
        // initiailize view variables
        let view; if(this.isMapView()) { view = ViewState.map; }
        else if(this.isMonthView()) { view = ViewState.month; }
        else if(this.isWeekView()) { view = ViewState.week; }
        else if(this.isThreeDayView()) { view = ViewState.threeday; }
        this.setCurrentView(view);
        this.storeLastView(ViewState.month);
      });
    });

  }

  // View Getters and Setters //

  isMapView() { return this.router.url.startsWith("/map") }
  isCalendarView() { return this.router.url.startsWith("/calendar") }
  isMonthView() { return this.router.url.startsWith("/calendar/month") }
  isWeekView() { return this.router.url.startsWith("/calendar/week") }
  isThreeDayView() { return this.router.url.startsWith("/calendar/three-day") }

  setCurrentView(view: ViewState) {
    this.currentViewSource.next(view);
  } getCurrentView() { return this._currentView; }

  storeLastView(view: ViewState){
    this.lastViewSource.next(view);
  } retrieveLastView(){ return this._lastView; }

  // Day Getters and Setters //

  setVisibleDays(visibleDays: CalendarDay[]){
    this.visibleDaysSource.next(visibleDays);
  } getVisibleDays(){ return this._visibleDays; }

  setSelectedDate(date: Date){
    this.selectedDateSource.next(date);
  } getSelectedDate() { return this._selectedDate; }

  // Event Collection Getters and Setters //

  getMonthEvents() { return this._monthEvents; }
  getFilteredMonthEvents() { return this._filteredMonthEvents; }

  getWeekEvents() { return this._weekEvents; }
  getFilteredWeekEvents() { return this._filteredWeekEvents; }

  getThreeDayEvents() { return this._threeDayEvents; }
  getFilteredThreeDayEvents() { return this._filteredThreeDayEvents; }

  getDayEvents() { return this._dayEvents; }
  getFilteredDayEvents() { return this._filteredDayEvents; }

  // Event Getters and Setters //

  updateHoveredEvent(event: GeoJson): void {
    this.hoveredEventSource.next(event);
  } getHoveredEvent() { return this._hoveredEvent; }

  updateClickedEvent(event: GeoJson): void {
    this.clickedEventSource.next(event);
  } getClickedEvent(){ return this._clickedEvent; }

  updateSidebarEvent(event: GeoJson): void {
    this.sidebarEventSource.next(event);
  } getSidebarEvent(){ return this._sidebarEvent; }

  resetEventSelection() {
    this.updateHoveredEvent(null);
    this.updateClickedEvent(null);
    this.updateSidebarEvent(null);
    this.router.navigate(['', {outlets: {sidebar: ['list']}}]);
  }

  // UPDATE DATE SPAN - Call whenever the visible days change!! //

  // Change the span of visible dates (provide post-update date and view)
  changeDateSpan(newDate: Date, newView : ViewState) {
    // if date changed
    if(newDate != this._selectedDate) {
      // determine whether new date is in the same view spans as current date
      let sameMonth = this._dateService.inSameMonth(newDate,this._selectedDate);
      let sameWeek = this._dateService.inSameWeek(newDate,this._selectedDate);
      let sameThreeDay = this._dateService.inSameThreeDay(newDate,this._selectedDate);
      // update the event collections (only if new event collections are needed)
      this.updateEvents(newDate, !sameMonth, !sameWeek, !sameThreeDay);
      // update current date
      this.setSelectedDate(newDate);
      // reset date span filters
      if(newView == ViewState.map
        || (newView == ViewState.month && !sameMonth)
        || (newView == ViewState.week && !sameWeek)
        || (newView == ViewState.threeday && !sameThreeDay))
          this.resetDateFilter();
    }
    // if view changed
    if(newView != this._currentView) {
      // update view variables
      this.storeLastView(this._currentView);
      this.setCurrentView(newView);
      // reset all filters
      this.resetDateFilter();
      if(newView == ViewState.map)
        this.resetCalendarFilters();
    }
  }

  // EVENT RETRIEVAL //

  // Retrieve eventsURL
  private getEventsURL(): string { return `${this.eventsUrl}/`; }

  // Retrieve events by date
  private getEventsByDate(date: Date): string {
    let dt = moment(date);
    const d = dt.format('D'), m = dt.format('MMM'), y = dt.format('YYYY');
    return `${this.eventsUrl}/search?date=${d}%20${m}%20${y}`;
  }

  // Retrieve events by event id
  getEventById(id: string): GeoJson { return this._monthEvents.features.find((e: GeoJson) => e.id == id); }

  // EVENT UPDATES //

  // Update all event containers
  private updateEvents(date: Date, updateMonth: boolean, updateWeek: boolean, updateThreeDay): void {
    if(this.allEvents && this.allEvents.features.length > 0) {
      // update all events
      this.dayEventsSource.next(this.filterByDateSpan(this.allEvents, moment(date).startOf('d'), moment(date).endOf('d')));
      if(updateMonth) this.monthEventsSource.next(this.filterByMonth(this.allEvents, date));
      if(updateWeek) this.weekEventsSource.next(this.filterByWeek(this.allEvents, date));
      if(updateThreeDay) this.threeDayEventsSource.next(this.filterByThreeDays(this.allEvents, date));
      this.updateCategories();
    }
  }

  // check if two event spans are equal
  equalEventLists(e1: FeatureCollection, e2: FeatureCollection) {
    if(!e1 || !e1.features) { if(!e2 || !e2.features) return true; else return false; }
    if (e1.features.length != e2.features.length) return false;
    return JSON.stringify(e1.features) == JSON.stringify(e2.features);
  }

  // Filter events by a date span
  private filterByDateSpan(allEvents: FeatureCollection, startDate: Moment, endDate: Moment) {
    // filter according to start and end dates
    let filteredEvents = new FeatureCollection([]);
    allEvents.features.forEach(el => {
      let d = moment(el.properties.start_time);
      if (this._dateService.isBetween(d,startDate,endDate))
        filteredEvents.features.push(el);
    });
    // sort filtered events by start time
    filteredEvents.features.sort(function(a, b) {
      let timeA = +new Date(a.properties.start_time);
      let timeB = +new Date(b.properties.start_time);
      if(timeA-timeB == 0){
        let timeAA = +new Date(a.properties.end_time);
        let timeBB = +new Date(b.properties.end_time);
        return timeBB - timeAA;
      } return timeA - timeB;
    });
    return filteredEvents;
  }

  // Filter events by month
  private filterByMonth(allEvents: FeatureCollection, date: Date){
    // determine first day and last day to start displaying events
    let firstDay = moment(date).startOf('month').startOf('week');
    let lastDay = moment(date).endOf('month').endOf('week');
    if(new Date() > firstDay.toDate()) { firstDay = moment(new Date()); }
    // filter by day span
    return this.filterByDateSpan(allEvents, firstDay, lastDay);
  }

  // Filter events by week
  private filterByWeek(allEvents: FeatureCollection, date: Date){
    // determine first day and last day to start displaying events
    let firstDay = moment(date).startOf('week');
    let lastDay = moment(date).endOf('week');
    if(new Date() > firstDay.toDate()){ firstDay = moment(new Date()); }
    // filter by day span
    return this.filterByDateSpan(allEvents, firstDay, lastDay);
  }

  // Filter events by three days
  private filterByThreeDays(allEvents: FeatureCollection, date: Date){
    // determine first and last day to start displaying events
    let bounds = this._dateService.getViewBounds(date, ViewState.threeday);
    let firstDay = bounds.startDate, lastDay = bounds.endDate;
    if(new Date() > firstDay.toDate()){ firstDay = moment(new Date()); }
    // filter by day span
    return this.filterByDateSpan(allEvents, firstDay, lastDay);
  }

  // Helper function to validate images //

  // validate image
  checkImage(imageSrc) {
    if(imageSrc.includes("undefined"))
      return false;
    var img = new Image();
    try {
      img.src = imageSrc;
      return true;
    } catch(err) {
      return false;
    }
  }

  // REST OF THIS FILE HANDLES FILTERS //

  // Hard-Coded Filter Objects //

  // tags in same group should be mutually exclusive
  private _tagGroups = [
    ['happening now', 'upcoming', 'morning', 'afternoon', 'evening'],
    ['on-campus', 'off-campus', 'nearby'],
    ['morning', 'happening now', 'upcoming'],
    ['afternoon', 'happening now', 'upcoming'],
    ['evening', 'happening now', 'upcoming'],
    ['free food'] ];

  // maps tags to tagsGroups indices for quick access
  private _tagGroupMap = {
    'happening now': 0, 'upcoming': 0,
    'on-campus': 1, 'off-campus': 1, 'nearby': 1,
    'morning': 2, 'afternoon': 3, 'evening': 4, 'free food': 5 };

  // tags in same group OR'ed, every group AND'ed
  private _tagLists = [
    ['happening now'], ['upcoming'],
    ['on-campus'], ['off-campus'], ['nearby'],
    ['morning', 'afternoon', 'evening'], ['free food'] ];

  // words excluded from location search matching
  private _excludedSearchWords = [
    'a','all','an','and','any','area','areas','at','here',
    'in','it','its','place','places','room','rooms','that',
    'the','hall','building','ucla', '•', '-' ];

  // get categories from the server
  private getCategories(): Observable<any> {
    return this.http.get<any>(this.categoriesUrl);
  }

  // Filter Getters and Setters //

  // reset to defaults
  resetFilters(){
    this.clearTags();
    this.clearCategories();
    this.resetCalendarFilters();
  }

  private resetCalendarFilters(){
    this.setLocationFilter("");
    // 12:00 AM - 11:59 PM
    this.setTimeFilter(0,1439);
    this.resetDateFilter();
  }

  // Update category hash
  private initCategories() {
    this._categHash = { 'all': {
      formattedCategory: 'all',
      numEventsDay: 0,
      numEventsThreeDay: 0,
      numEventsWeek: 0,
      numEventsMonth: 0,
      selected: true
    }};
    // initialize all other category containers iteratively
    for (let categ of this.categs.categories) {
      let categName = categ.toLowerCase();
      let categStr = categName.replace('_', ' ');
      categStr = categStr.charAt(0).toUpperCase() + categStr.slice(1).toLowerCase();
      this._categHash[categName] = {
        formattedCategory: categStr,
        numEventsDay: 0,
        numEventsThreeDay: 0,
        numEventsMonth: 0,
        numEventsWeek: 0,
        selected: false
      }
    }
    // update category hash
    this.categHashSource.next(this._categHash);
  }

  // Update category hash
  private updateCategories() {
    // maps store counts of events that fulfill each category
    let dayMap = this.getCategoryMap(this._dayEvents.features, this.categs.categories);
    let threeDayMap = this.getCategoryMap(this._threeDayEvents.features, this.categs.categories);
    let weekMap = this.getCategoryMap(this._weekEvents.features, this.categs.categories);
    let monthMap = this.getCategoryMap(this._monthEvents.features, this.categs.categories);
    // initialize tempHash by building the all category container
    let categAll = this._categHash['all'];
    categAll.numEventsDay = dayMap['all'];
    categAll.numEventsThreeDay = threeDayMap['all'];
    categAll.numEventsWeek = weekMap['all'];
    categAll.numEventsMonth = monthMap['all'];
    // initialize all other category containers iteratively
    for (let categ of this.categs.categories) {
      let categName = categ.toLowerCase();
      let categCurrent = this._categHash[categName];
      categCurrent.numEventsDay = dayMap[categName];
      categCurrent.numEventsThreeDay = threeDayMap[categName];
      categCurrent.numEventsWeek = weekMap[categName];
      categCurrent.numEventsMonth = monthMap[categName];
    }
    // update category hash
    this.categHashSource.next(this._categHash);
  }

  // Map categories to number of events in input featuresList
  private getCategoryMap(featuresList: GeoJson[], categs: String[]) {
    // initialize map
    let eventMap = {}; let totalEvents = 0;
    for (let categ of categs) { eventMap[categ.toLowerCase()] = 0; }
    // iterate through events
    eventMap['all'] = featuresList.length;
    for (let event of featuresList) {
      if(event.properties.categories){
        for (let categ of event.properties.categories) {
          if (eventMap.hasOwnProperty(categ.toLowerCase())) {
            eventMap[categ.toLowerCase()]++;
    }}}}
    return eventMap;
  }

  // reset all categories to be false
  clearCategories() {
    this._categHash["all"].selected = true
    for (let categ of this.categs.categories) {
      if(this._categHash.hasOwnProperty(categ.toLowerCase()))
        this._categHash[categ.toLowerCase()].selected = false;
    }
    this.categHashSource.next(this._categHash);
  }

  // Toggle category
  toggleCategory(categ: string) {
    if (this._categHash[categ] == undefined)
      return
    // apply the category
    this._categHash[categ].selected = !this._categHash[categ].selected;
    this._categHash['all'].selected = true;
    for (let categ of this.categs.categories) {
      if(this._categHash.hasOwnProperty(categ.toLowerCase()) && this._categHash[categ.toLowerCase()].selected) {
        this._categHash['all'].selected = false;
        break;
      }
    }
    // update category hash
    this.categHashSource.next(this._categHash);
  }

  // reset all tags to be false
  clearTags() {
    this._tagHash = {
      'happening now': false, 'upcoming': false,
      'on-campus': false, 'off-campus': false, 'nearby': false,
      'morning': false, 'afternoon': false, 'evening': false, 'free food': false };
    this.tagHashSource.next(this._tagHash);
  }

  // Toggle filter tags
  toggleTag(tag: string) {
    if (this._tagHash[tag] == undefined)
      return
    // apply the tag
    this._tagHash[tag] = !this._tagHash[tag];
    // unselect tags in the same group
    for (let t of this._tagGroups[this._tagGroupMap[tag]]) {
    if (t != tag && this._tagHash[t]) { this._tagHash[t] = false; } }
    // update tag hash
    this.tagHashSource.next(this._tagHash)
  }

  // Date Filter //

  setDateFilter(lowerBound: Date, upperBound: Date){
    this._dateFilter = {start: lowerBound, end: upperBound};
    this.dateFilterSource.next(this._dateFilter);
  } getDateFilter(){ return this._dateFilter; }

  // reset date filter on date change
  private resetDateFilter() {
    let bounds = this._dateService.getViewBounds(this._selectedDate, this._currentView);
    this.setDateFilter(bounds.startDate.toDate(), bounds.endDate.toDate());
  }

  // Time Filter //

  setTimeFilter(lowerBound: number, upperBound: number){
    this._timeFilter = {start: lowerBound, end: upperBound};
    this.timeFilterSource.next(this._timeFilter);
  } getTimeFilter(){ return this._timeFilter; }

  // Location Filter //

  setLocationFilter(searchString: string){
    this._locFilter = searchString;
    this.locFilterSource.next(searchString);
  } getLocationFilter(){ return this._locFilter; }

  // Filter Application //

  // Apply filters to day, week, three day, or month
  private applyAllFilters() {
    switch(this._currentView){
      case ViewState.map:
        this.applyFiltersToSelection(this._dayEvents.features, this.filteredDayEventsSource); break;
      case ViewState.threeday:
        this.applyFiltersToSelection(this._threeDayEvents.features, this.filteredThreeDayEventsSource); break;
      case ViewState.week:
        this.applyFiltersToSelection(this._weekEvents.features, this.filteredWeekEventsSource); break;
      case ViewState.month:
        this.applyFiltersToSelection(this._monthEvents.features, this.filteredMonthEventsSource); break;
    }
  }

  // Apply filters to inputFeatures
  private applyFiltersToSelection(inputFeatures: GeoJson[], outputSource: BehaviorSubject <FeatureCollection>){
    // start filtered events collection
    let tempEvents = new FeatureCollection([]);
    // iterate through events
    for (let event of inputFeatures) {
      // both map and calendar view check tags and categories
      let passesTags = this.passesTags(event);
      let passesCategories = this.passesCategories(event);
      // calendar view checks date, time, location
      let passesDate = true, passesTime = true, passesLocation = true;
      if(this._currentView != ViewState.map) {
        if(this._dateFilter) passesDate = this.passesDate(event);
        if(this._timeFilter) passesTime = this.passesTime(event);
        if(this._locFilter) passesLocation = this.passesLocation(event);
      }
      // ensure event has passed all checks
      if (passesTags && passesCategories && passesDate && passesTime && passesLocation)
        tempEvents.features.push(event);
    }
    // add a property checking whether event is first on a given day
    let prevDate = null;
    tempEvents.features.forEach(el => {
      let d = moment(el.properties.start_time);
      el.properties.firstOfDay = !(d.isSame(prevDate,'d'));
      prevDate = d;
    });
    // update provided outputSource
    outputSource.next(tempEvents);
  }

  // Filter Check: categories
  private passesCategories(event: GeoJson): boolean {
    let categoryCheck = false;
    if(this._categHash && this._categHash['all'].selected)
      return true;
    if(event.properties.categories){
      for (let categ of event.properties.categories) {
        let categObject = this._categHash[categ.toLowerCase()];
        if (categObject && categObject.selected) {
          categoryCheck = true;
          break;
    }}}
    return categoryCheck;
  }

  // Filter Check: tag buttons
  private passesTags(event: GeoJson): boolean {
    let tagCheck = true;
    for (let tagList of this._tagLists) {
      let passesTag = false, tagUsed = false;
      for (let tag of tagList) {
        if (this._tagHash[tag]) tagUsed = true;
        if (this._tagHash[tag] && this.checkTag(tag, event)) passesTag = true; break;
      }
      if (tagUsed && !passesTag) { tagCheck = false; break; }
    }
    return tagCheck;
  }

  // Filter Check: date
  private passesDate(event: GeoJson): boolean {
    // compare event date to the date filter being applied
    let eventDate = moment(event.properties.start_time);
    return this._dateService.isBetween(eventDate, moment(this._dateFilter.start).startOf('day'), moment(this._dateFilter.end).add(1,'days'));
  }

  // Filter Check: time
  private passesTime(event: GeoJson): boolean {
    // compare event time to the time filter being applied
    let eventTime = moment(event.properties.start_time);
    let minCount = eventTime.hour()*60 + eventTime.minutes();
    return (minCount >= this._timeFilter.start && minCount <= this._timeFilter.end);
  }

  // Filter Check: location
  private passesLocation(event: GeoJson): boolean {
    let properLocation = false;
    if(this._locFilter != ""){
      // retrieve event location
      let eventLocation = event.properties.place.name;
      if(eventLocation){
        // target words are those in the actual event location string
        let targetWords = eventLocation.toLowerCase().split(" ");
        // search words are those in the location search string
        let searchWords = this._locFilter.toLowerCase().split(" ");
        // iterate through and check for substring matches
        for(let searchString of searchWords){
          for(let matchString of targetWords){
            if(matchString.indexOf(searchString) != -1 && !this._excludedSearchWords.includes(searchString)){
              properLocation = true; break;
    }}}}}
    return properLocation;
  }

  // Returns true if event has the given tag
  private checkTag(tag: string, event): boolean {
    if (tag == 'happening now')
      return this._dateService.isHappeningNow(event.properties.start_time);
    else if (tag == 'upcoming')
      return this._dateService.isUpcoming(event.properties.start_time);
    else if (tag == 'on-campus')
      return this._locationService.isOnCampus(event.geometry.coordinates[1], event.geometry.coordinates[0]);
    else if (tag == 'off-campus')
      return !this._locationService.isOnCampus(event.geometry.coordinates[1], event.geometry.coordinates[0]);
    else if (tag == 'nearby')
      return this._locationService.isNearby(event.geometry.coordinates[1], event.geometry.coordinates[0]);
    else if (tag == 'morning')
      return this._dateService.isMorning(event.properties.start_time);
    else if (tag == 'afternoon')
      return this._dateService.isAfternoon(event.properties.start_time);
    else if (tag == 'evening')
      return this._dateService.isEvening(event.properties.start_time);
    else if (tag == 'free food')
      return event.properties.free_food == 1;
    return true;
  }

}
