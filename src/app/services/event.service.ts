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
  private _sidebarEvent;              // current sidebar event (details expanded)

  // FILTER STORAGE VARIABLES
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
  categHash$; tagHash$; locFilter$; dateFilter$; timeFilter$;

  // Constructor
  constructor(private router: Router, private http: HttpClient, private _dateService: DateService, private _locationService: LocationService) {
    // Observable string sources (BehaviorSubjects have intial state)
    this.currentViewSource = new Subject <ViewState> ();
    this.lastViewSource = new Subject <ViewState> ();
    this.visibleDaysSource = new Subject <CalendarDay[]> ();
    this.selectedDateSource = new BehaviorSubject <Date> (new Date());
    this.monthEventsSource = new BehaviorSubject <FeatureCollection> (new FeatureCollection([]));
    this.filteredMonthEventsSource = new BehaviorSubject <FeatureCollection> (new FeatureCollection([]));
    this.weekEventsSource = new BehaviorSubject <FeatureCollection> (new FeatureCollection([]));
    this.filteredWeekEventsSource = new BehaviorSubject <FeatureCollection> (new FeatureCollection([]));
    this.threeDayEventsSource = new BehaviorSubject <FeatureCollection> (new FeatureCollection([]));
    this.filteredThreeDayEventsSource = new BehaviorSubject <FeatureCollection> (new FeatureCollection([]));
    this.dayEventsSource = new BehaviorSubject <FeatureCollection> (new FeatureCollection([]));
    this.filteredDayEventsSource = new BehaviorSubject <FeatureCollection> (new FeatureCollection([]));
    this.hoveredEventSource = new Subject <GeoJson> ();
    this.clickedEventSource = new Subject <GeoJson> ();
    this.sidebarEventSource = new Subject <GeoJson> ();
    this.categHashSource = new BehaviorSubject <any> ({});
    this.tagHashSource = new BehaviorSubject <any> ({});
    this.locFilterSource = new Subject <string> ();
    this.dateFilterSource = new Subject <any> ();
    this.timeFilterSource = new Subject <any> ();
    // Observable string streams
    this.currentView$ = this.currentViewSource.asObservable();
    this.lastView$ = this.lastViewSource.asObservable();
    this.visibleDays$ = this.visibleDaysSource.asObservable();
    this.selectedDate$ = this.selectedDateSource.asObservable();
    this.monthEvents$  = this.monthEventsSource.asObservable();
    this.filteredMonthEvents$  = this.filteredMonthEventsSource.asObservable();
    this.weekEvents$  = this.weekEventsSource.asObservable();
    this.filteredWeekEvents$ = this.filteredWeekEventsSource.asObservable();
    this.threeDayEvents$ = this.threeDayEventsSource.asObservable();
    this.filteredThreeDayEvents$ = this.filteredThreeDayEventsSource.asObservable();
    this.dayEvents$ = this.dayEventsSource.asObservable();
    this.filteredDayEvents$ = this.filteredDayEventsSource.asObservable();
    this.hoveredEvent$ = this.hoveredEventSource.asObservable();
    this.clickedEvent$ = this.clickedEventSource.asObservable();
    this.sidebarEvent$ = this.sidebarEventSource.asObservable();
    this.categHash$ = this.categHashSource.asObservable();
    this.tagHash$ = this.tagHashSource.asObservable();
    this.locFilter$ = this.locFilterSource.asObservable();
    this.dateFilter$ = this.dateFilterSource.asObservable();
    this.timeFilter$ = this.timeFilterSource.asObservable();
    // Maintain a set of self-subscribed local values
    this.currentView$.subscribe(view => {
      this._currentView = view;
    });
    this.lastView$.subscribe(view =>
      this._lastView = view
    );
    this.visibleDays$.subscribe(days => {
      this._visibleDays = days;
    });
    this.selectedDate$.subscribe(date =>
      this._selectedDate = date
    );
    this.monthEvents$.subscribe(monthEvents => {
      this._monthEvents = monthEvents;
      this.filteredMonthEventsSource.next(monthEvents);
    });
    this.filteredMonthEvents$.subscribe(filteredMonthEvents =>
      this._filteredMonthEvents = filteredMonthEvents
    );
    this.weekEvents$.subscribe(weekEvents => {
      this._weekEvents = weekEvents;
      this.filteredWeekEventsSource.next(weekEvents);
    });
    this.filteredWeekEvents$.subscribe(filteredWeekEvents =>
      this._filteredWeekEvents = filteredWeekEvents
    );
    this.threeDayEvents$.subscribe(threeDayEvents => {
      this._threeDayEvents = threeDayEvents;
      this.filteredThreeDayEventsSource.next(threeDayEvents);
    });
    this.filteredThreeDayEvents$.subscribe(filteredThreeDayEvents =>
      this._filteredThreeDayEvents = filteredThreeDayEvents
    );
    this.dayEvents$.subscribe(dayEvents => {
      this._dayEvents = dayEvents;
      this.filteredDayEventsSource.next(dayEvents);
    });
    this.filteredDayEvents$.subscribe(filteredDayEvents =>
      this._filteredDayEvents = filteredDayEvents
    );
    this.hoveredEvent$.subscribe(hoveredEventInfo =>
      this._hoveredEvent = hoveredEventInfo
    );
    this.clickedEvent$.subscribe(clickedEventInfo =>
      this._clickedEvent = clickedEventInfo
    );
    this.sidebarEvent$.subscribe(sidebarEventInfo =>
      this._sidebarEvent = sidebarEventInfo
    );
    this.categHash$.subscribe(categHash => {
      this._categHash = categHash;
      this.applyAllFilters();
    });
    this.tagHash$.subscribe(filterHash => {
      this._tagHash = filterHash;
      this.applyAllFilters();
    });
    this.locFilter$.subscribe(locSearch => {
      this._locFilter = locSearch;
      this.applyAllFilters();
    });
    this.dateFilter$.subscribe(dateHash => {
      this._dateFilter = dateHash;
      this.applyAllFilters();
    });
    this.timeFilter$.subscribe(timeHash => {
      this._timeFilter = timeHash;
      this.applyAllFilters();
    });
    // Initialize filters
    this.getCategories().subscribe(categs => {
      // initialize categories
      this.categs = categs;
      this.resetFilters();
      // Populate event containers
      this.updateEvents(new Date(),[true,true,true]);
      this.setSelectedDate(new Date());
      // Initiailize view variables
      this.determineView();
      this.storeLastView(ViewState.month);
    });
  }

  // View Getters and Setters //

  determineView() {
    let prev = this._currentView;
    let next = this._currentView;
    if(this.router.url.startsWith("/map"))
      { next = ViewState.map; }
    else if(this.router.url.startsWith("/calendar/month"))
      { next = ViewState.month; }
    else if(this.router.url.startsWith("/calendar/week"))
      { next = ViewState.week; }
    else if(this.router.url.startsWith("/calendar/three-day"))
      { next = ViewState.threeday; }
    this._currentView = next;
    this.setCurrentView(next);
    if(next != prev) {
      this._lastView = prev
      this.storeLastView(prev);
    }
  }

  isMapView() {
    return this.router.url.startsWith("/map")
  }
  isCalendarView() {
    return this.router.url.startsWith("/calendar")
  }
  isMonthView() {
    return this.router.url.startsWith("/calendar/month")
  }
  isWeekView() {
    return this.router.url.startsWith("/calendar/week")
  }
  isThreeDayView() {
    return this.router.url.startsWith("/calendar/three-day")
  }

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

  // UPDATE DATE SPAN //

  // Call whenever date span of view is changed
  changeDateSpan(newDate: Date, newView : ViewState) {
    if(newDate != this._selectedDate) {
      // month
      let sameMonth = moment(this._selectedDate).isSame(moment(newDate),'month');
      // week
      let sameWeek = moment(this._selectedDate).isSame(moment(newDate),'week');
      // three day
      let prevDate = moment(this._selectedDate).startOf('day');
      let numDaysDiff = prevDate.diff(moment().startOf('day'), 'days') % 3;
      let threeDayStart = prevDate.clone().subtract(numDaysDiff,'d');
      let threeDayEnd = threeDayStart.clone().add(3,'d');
      let sameThreeDay = moment(newDate).isSameOrAfter(threeDayStart) && moment(newDate).isBefore(threeDayEnd);
      // updates
      this.updateEvents(newDate,[!sameMonth,!sameWeek,!sameThreeDay]);
      this.setSelectedDate(newDate);
      this.resetDateFilter();
    }
    if(newView != this._currentView) {
      this.storeLastView(this._currentView);
      this.setCurrentView(newView);
      this.resetFilters();
    }
  }

  // EVENT RETRIEVAL //

  // Retrieve eventsURL
  private getEventsURL(): string {
    return `${this.eventsUrl}/`;
  }

  // Retrieve events by event id
  getEventById(id: string): GeoJson {
    return this._monthEvents.features.find((e: GeoJson) => e.id == id);
  }

  // Retrieve events by date
  getEventsByDate(date: Date): string {
    let dt = moment(date);
    const d = dt.format('D'), m = dt.format('MMM'), y = dt.format('YYYY');
    return `${this.eventsUrl}/search?date=${d}%20${m}%20${y}`;
  }

  // EVENT UPDATES //

  // Update all event containers
  updateEvents(date: Date, calendarOpts: boolean[]): void {
    // reset calendar events
    if(calendarOpts[0]) this.monthEventsSource.next(new FeatureCollection([]));
    if(calendarOpts[1]) this.weekEventsSource.next(new FeatureCollection([]));
    if(calendarOpts[2]) this.threeDayEventsSource.next(new FeatureCollection([]));
    // update day events
    this.http.get <FeatureCollection> (this.getEventsByDate(date)).subscribe(dayEvents => {
      this.dayEventsSource.next(dayEvents);
      // categories
      this.initCategories();
      this.allCategories();
    });
    // update other event collections
    this.http.get <FeatureCollection> (this.getEventsURL()).subscribe(allEvents => {
      if(calendarOpts[0]) this.monthEventsSource.next(this.filterByMonth(allEvents, date));
      if(calendarOpts[1]) this.weekEventsSource.next(this.filterByWeek(allEvents, date));
      if(calendarOpts[2]) this.threeDayEventsSource.next(this.filterByThreeDays(allEvents, date));
      // categories
      this.initCategories();
      this.allCategories();
    });
  }

  // Filter events by a date span
  private filterByDateSpan(allEvents: FeatureCollection, startDate: Date, endDate: Date) {
    let filteredEvents = new FeatureCollection([]);
    allEvents.features.forEach(el => {
      let d = moment(el.properties.start_time).toDate();
      if (d >= startDate && d <= endDate)
        filteredEvents.features.push(el);
    });
    filteredEvents.features.sort(function(a, b) {
      a = a["properties"]["start_time"];
      b = b["properties"]["start_time"];
      return a<b ? -1 : a>b ? 1 : 0;
    });
    let prevDate = null;
    filteredEvents.features.forEach(el => {
      let d = moment(el.properties.start_time);
      el.properties.firstOfDay = !(d.isSame(prevDate,'d'));
      prevDate = d;
    });
    return filteredEvents;
  }

  // Filter events by month
  private filterByMonth(allEvents: FeatureCollection, date: Date){
    // determine first day and last day to start displaying events
    let firstDay = moment(date).startOf('month').startOf('week');
    if(new Date() > firstDay.toDate()) { firstDay = moment(new Date()); }
    let lastDay = moment(date).endOf('month').endOf('week');
    // filter by day span
    return this.filterByDateSpan(allEvents, firstDay.toDate(), lastDay.toDate());
  }

  // Filter events by week
  private filterByWeek(allEvents: FeatureCollection, date: Date){
    // determine first day and last day to start displaying events
    let firstDay = moment(date).startOf('week');
    if(new Date() > firstDay.toDate()){ firstDay = moment(new Date()); }
    let lastDay = moment(date).endOf('week');
    // filter by day span
    return this.filterByDateSpan(allEvents, firstDay.toDate(), lastDay.toDate());
  }

  // Filter events by three days
  private filterByThreeDays(allEvents: FeatureCollection, date: Date){
    // determine first and last day to start displaying events
    let numDaysDiff = moment(date).startOf('day').diff(moment().startOf('day'), 'days');
    let dayOfGroup = (numDaysDiff % 3 == 0) ? 0 : ((numDaysDiff % 3 == 1) ? 1 : 2);
    let firstDay = moment(date).clone().startOf('day').add(-1*dayOfGroup, 'days');
    let lastDay = firstDay.clone().add(3, 'days');
    if(new Date() > firstDay.toDate()){ firstDay = moment(new Date()); }
    // filter by day span
    return this.filterByDateSpan(allEvents, firstDay.toDate(), lastDay.toDate());
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

  // Filter Getters and Setters //

  // reset to defaults
  resetFilters(){
    this.clearTags();
    this.initCategories();
    this.allCategories();
    this.setTimeFilter(0,1439);
    this.setLocationFilter("");
    // date filter
    this.resetDateFilter();
  }

  resetDateFilter() {
    let start = new Date(), end = new Date();
    switch(this._currentView){
      case ViewState.month:
        start = moment(this._selectedDate).startOf('month').startOf('week').toDate();
        end = moment(this._selectedDate).endOf('month').endOf('week').toDate();
        break;
      case ViewState.week:
        start = moment(this._selectedDate).startOf('week').toDate();
        end = moment(this._selectedDate).endOf('week').toDate();
        break;
      case ViewState.threeday:
        let date = moment(this._selectedDate).startOf('day');
        let numDaysDiff = date.diff(moment().startOf('day'), 'days') % 3;
        start = date.clone().subtract(numDaysDiff,'d').toDate();
        end = moment(start).clone().add(2,'d').toDate();
        break;
    }
    this.setDateFilter(start, end);
  }

  // GET categories from the server
  getCategories(): Observable<any> { return this.http.get<any>(this.categoriesUrl); }

  // Initialize category hash (all selected)
  private initCategories() {
    // maps store counts of events that fulfill each category
    let dayMap = this.getCategoryMap(this._dayEvents.features, this.categs.categories);
    let monthMap = this.getCategoryMap(this._monthEvents.features, this.categs.categories);
    let weekMap = this.getCategoryMap(this._weekEvents.features, this.categs.categories);
    let threeDayMap = this.getCategoryMap(this._threeDayEvents.features, this.categs.categories);
    // initialize tempHash by building the all category container
    this._categHash = {
      'all': {
        formattedCategory: 'all',
        numEventsDay: dayMap['all'],
        numEventsThreeDay: threeDayMap['all'],
        numEventsWeek: weekMap['all'],
        numEventsMonth: monthMap['all'],
        selected: this._categHash && this._categHash['all'] ? this._categHash['all'].selected : true
      }
    };
    // initialize all other category containers iteratively
    for (let categ of this.categs.categories) {
      let categName = categ.toLowerCase();
      let categStr = categName.replace('_', ' ');
      categStr = categStr.charAt(0).toUpperCase() + categStr.slice(1).toLowerCase();
      this._categHash[categName] = {
        formattedCategory: categStr,
        numEventsDay: dayMap[categName],
        numEventsThreeDay: threeDayMap[categName],
        numEventsMonth: monthMap[categName],
        numEventsWeek: weekMap[categName],
        selected: this._categHash && this._categHash[categName] ? this._categHash[categName].selected : false
      }
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

  // reset all tags to be false
  clearTags() {
    this._tagHash = {
      'happening now': false, 'upcoming': false,
      'on-campus': false, 'off-campus': false, 'nearby': false,
      'morning': false, 'afternoon': false, 'evening': false, 'free food': false };
    this.tagHashSource.next(this._tagHash);
  }

  // reset all categories to be false
  clearCategories() {
    for (let categ in this._categHash)
      if (this._categHash.hasOwnProperty(categ))
        this._categHash[categ.toLowerCase()].selected = false;
    this.categHashSource.next(this._categHash);
  }

  // reset all categories (in range) to be true
  allCategories() {
    let categMap = {};
    switch(this._currentView) {
      case ViewState.map:
        categMap = this.getCategoryMap(this._dayEvents.features, Object.keys(this._categHash)); break;
      case ViewState.month:
        categMap = this.getCategoryMap(this._monthEvents.features, Object.keys(this._categHash)); break;
      case ViewState.week:
        categMap = this.getCategoryMap(this._weekEvents.features, Object.keys(this._categHash)); break;
      case ViewState.threeday:
        categMap = this.getCategoryMap(this._threeDayEvents.features, Object.keys(this._categHash)); break;
    }
    for (let categ in this._categHash) {
      let categName = categ.toLowerCase();
      if (categName == 'all' || categMap[categName] > 0)
        this._categHash[categName].selected = true;
    }
    this.categHashSource.next(this._categHash);
  }

  // Toggle filter tags
  toggleTag(tag: string) {
    if (this._tagHash[tag] == undefined)
      return
    // apply the tag
    this._tagHash[tag] = !this._tagHash[tag];
    // unselect selected tags in the same group
    for (let t of this._tagGroups[this._tagGroupMap[tag]]) {
    if (t != tag && this._tagHash[t]) { this._tagHash[t] = false; } }
    // update tag hash
    this.tagHashSource.next(this._tagHash)
  }

  // Toggle category
  toggleCategory(categ: string) {
    if (this._categHash[categ] == undefined)
      return
    if(categ == 'all'){
      if(this._categHash['all'].selected) this.clearCategories();
      else this.allCategories();
    }
    else {
      this._categHash['all'].selected = false;
      this._categHash[categ].selected = !this._categHash[categ].selected;
    }
    // update category hash
    this.categHashSource.next(this._categHash);
  }

  // Date Filter //

  setDateFilter(lowerBound: Date, upperBound: Date){
    this._dateFilter = [lowerBound, upperBound];
    this.dateFilterSource.next(this._dateFilter);
  } getDateFilter(){ return this._dateFilter; }

  // Time Filter //

  setTimeFilter(lowerBound: number, upperBound: number){
    this._timeFilter = [lowerBound, upperBound];
    this.timeFilterSource.next(this._timeFilter);
  } getTimeFilter(){ return this._timeFilter; }

  // Location Filter //

  setLocationFilter(searchString: string){
    this._locFilter = searchString;
    this.locFilterSource.next(searchString);
  } getLocationFilter(){ return this._locFilter; }

  // Filter Application //

  // Apply filters to day, week, and month
  applyAllFilters() {
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
      // both map and calendar check tags and categories
      let passesTags = this.passesTags(event);
      let passesCategories = this.passesCategories(event);
      // calendar view checks date, time, location\
      let passesDate = true, passesTime = true, passesLocation = true;
      if(this._currentView != ViewState.map) {
        if(this._dateFilter) passesDate = this.passesDate(event);
        if(this._timeFilter) passesTime = this.passesTime(event);
        if(this._locFilter) passesLocation = this.passesLocation(event);
      }
      if (passesTags && passesCategories && passesDate && passesTime && passesLocation)
        tempEvents.features.push(event);
    }
    outputSource.next(tempEvents);
  }

  // Filter Check: categories
  private passesCategories(event: GeoJson): boolean {
    let categoryCheck = false;
    let allSelected = (this._categHash && this._categHash['all'].selected);
    if(event.properties.categories){
      for (let categ of event.properties.categories) {
        let categObject = this._categHash[categ.toLowerCase()];
        if (allSelected || (categObject && categObject.selected)) {
          categoryCheck = true;
          break;
    }}}
    return categoryCheck;
  }

  // Filter Check: tags/buttons
  private passesTags(event: GeoJson): boolean {
    let tagCheck = true;
    for (let tagList of this._tagLists) {
      let passesTag = false, tagUsed = false;
      for (let tag of tagList) {
        if (this._tagHash[tag]) {
          tagUsed = true;
        }
        if (this._tagHash[tag] && this.checkTag(tag, event)) {
          passesTag = true; break;
        }
      }
      if (tagUsed && !passesTag) {
        tagCheck = false; break;
      }
    }
    return tagCheck;
  }

  // Filter Check: date
  private passesDate(event: GeoJson): boolean {
    // compare event date to the date filter being applied
    let eventDate = moment(event.properties.start_time).toDate();
    return (eventDate >= moment(this._dateFilter[0]).startOf('day').toDate() && eventDate <= moment(this._dateFilter[1]).add('1','days').toDate());
  }

  // Filter Check: time
  private passesTime(event: GeoJson): boolean {
    // compare event time to the time filter being applied
    let eventTime = moment(event.properties.start_time);
    let minCount = eventTime.hour()*60 + eventTime.minutes();
    return (minCount >= this._timeFilter[0] && minCount <= this._timeFilter[1]);
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
