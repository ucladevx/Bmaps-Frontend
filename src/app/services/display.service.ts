import { Injectable } from '@angular/core';
import { EventEmitter, Output } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router, RouterLinkActive, ActivatedRoute } from '@angular/router';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import { FeatureCollection, GeoJson } from '../map';
import { DateService } from './date.service';
import { LocationService } from './location.service';
import * as moment from 'moment';

// Calendar Day interface
export interface CalendarDay {
  date: Date;                 // full date
  dayOfMonth: number;         // day of month for date
  month: number;              // month number for date
  year: number;               // year number for date
  dayOfWeek: string;          // day of week as string
  events: GeoJson[];          // events on day
  selected: boolean;          // is day currently selected
  inCurrentMonth: boolean;    // is day in the current month
  isToday: boolean;           // is day today
}

@Injectable()
export class DisplayService {

  // DATE VARIABLES
  private _currentDate;               // holds the current selected day in Date format
  private _calendarDays;               // holds the days being displayed in CalendarDay format
  private _selectedDay;               // holds the current day in CalendarDay format

  // EVENT STORAGE VARIABLES
  private _monthEvents;               // holds all events stored for the current month view
  private _filteredMonthEvents;       // holds all events stored for the current month view, filtered
  private _weekEvents;                // holds all events stored for the current week view
  private _filteredWeekEvents;        // holds all events stored for the current week view, filtered
  private _dayEvents;                 // holds all events stored for the exact current date
  private _filteredDayEvents;         // holds all events stored for the exact current date, filtered

  // SOLO EVENT VARIABLES
  private _clickedEvent;              // holds the current clicked event
  private _expandedEvent;             // hold the current sidebar event
  private _hoveredEvent;              // holds the current hovered event

  // FILTER STORAGE VARIABLES
  private _categHash;                 // maps event categories to their selection status
  private _buttonHash;                // maps filter buttons to their selection status
  private _locationFilter;            // holds location string being searched for as filter
  private _dateFilter;                  // holds range of dates being applied as filter
  private _timeFilter;                  // holds range of times being applied as filter
  private _universalSearch;           // holds universal search string (only title now)

  // VIEW VARIABLES
  private _currentView;               // stores either 'month' 'week' or 'map'
  private _lastCalendarView;          // stores either 'month' or 'week'

  // SOURCES
  private currentDateSource: BehaviorSubject <Date>;
  private calendarDaysSource: Subject <any>;
  private selectedDaySource: Subject <CalendarDay>;
  private monthEventsSource: BehaviorSubject <FeatureCollection>;
  private filteredMonthEventsSource: BehaviorSubject <FeatureCollection>;
  private weekEventsSource: BehaviorSubject <FeatureCollection>;
  private filteredWeekEventsSource: BehaviorSubject <FeatureCollection>;
  private dayEventsSource: BehaviorSubject <FeatureCollection>;
  private filteredDayEventsSource: BehaviorSubject <FeatureCollection>;
  private clickedEventSource: Subject <GeoJson>;
  private expandedEventSource: Subject <GeoJson>;
  private hoveredEventSource: Subject <GeoJson>;
  private categHashSource: Subject <any>;
  private buttonHashSource: Subject <any>;
  private locationFilterSource: Subject <string>;
  private dateFilterSource: Subject <any>;
  private timeFilterSource: Subject <any>;
  private universalSearchSource: Subject <string>;
  private currentViewSource: Subject <string>;

  // OBSERVABLES
  currentDate$; calendarDays$; selectedDay$; clickedEvent$; expandedEvent$; hoveredEvent$; currentView$;
  monthEvents$; filteredMonthEvents$; weekEvents$; filteredWeekEvents$; dayEvents$; filteredDayEvents$;
  categHash$; buttonHash$; locationFilter$; dateFilter$; timeFilter$; universalSearch$;

  // Filters in the same group should be mutually exclusive
  private _filterGroups = [
    ['happening now', 'upcoming', 'morning', 'afternoon', 'evening'],
    ['on-campus', 'off-campus', 'nearby'],
    ['morning', 'happening now', 'upcoming'],
    ['afternoon', 'happening now', 'upcoming'],
    ['evening', 'happening now', 'upcoming'],
    ['free food']
  ];

  // Maps filters to _filterGroups indices for quick access
  private _filterGroupMap = {
    'happening now': 0, 'upcoming': 0,
    'on-campus': 1, 'off-campus': 1, 'nearby': 1,
    'morning': 2, 'afternoon': 3, 'evening': 4,
    'free food': 5
  };

  // Filters in the same group will be OR'ed, every group will be AND'ed
  private _filterLists = [
    ['happening now'], ['upcoming'],
    ['on-campus'], ['off-campus'], ['nearby'],
    ['morning', 'afternoon', 'evening'],
    ['free food']
  ];

  // Words excluded from location search matching
  private _excludedSearchWords = [
    'a','all','an','and','any','area','areas','at','here',
    'in','it','its','place','places','room','rooms','that',
    'the','hall','building','ucla', '•', '-'
  ];

  // private eventsUrl = "https://www.mappening.io/api/v1/events";
  // private eventsUrl = "http://0.0.0.0:5000/api/v2/events"
  private eventsUrl = "https://www.mappening.io/api/v2/events";
  // private categoriesUrl = "https://www.mappening.io/api/v1/events/event-categories";
  // private categoriesUrl = "http://0.0.0.0:5000/api/v2/events/categories";
  private categoriesUrl = "https://www.mappening.io/api/v2/events/categories"

  // Constructor
  constructor(private router: Router, private http: HttpClient, private _dateService: DateService, private _locationService: LocationService) {
    // Observable string sources - BehaviorSubjects have an intial state
    this.currentDateSource = new BehaviorSubject <Date> (new Date());
    this.calendarDaysSource = new Subject <CalendarDay[]> ();
    this.selectedDaySource = new Subject <CalendarDay> ();
    this.monthEventsSource = new BehaviorSubject <FeatureCollection> (new FeatureCollection([]));
    this.filteredMonthEventsSource = new BehaviorSubject <FeatureCollection> (new FeatureCollection([]));
    this.weekEventsSource = new BehaviorSubject <FeatureCollection> (new FeatureCollection([]));
    this.filteredWeekEventsSource = new BehaviorSubject <FeatureCollection> (new FeatureCollection([]));
    this.dayEventsSource = new BehaviorSubject <FeatureCollection> (new FeatureCollection([]));
    this.filteredDayEventsSource = new BehaviorSubject <FeatureCollection> (new FeatureCollection([]));
    this.clickedEventSource = new Subject <GeoJson> ();
    this.expandedEventSource = new Subject <GeoJson> ();
    this.hoveredEventSource = new Subject <GeoJson> ();
    this.categHashSource = new Subject <any> ();
    this.buttonHashSource = new Subject <any> ();
    this.locationFilterSource = new Subject <string> ();
    this.dateFilterSource = new Subject <any> ();
    this.timeFilterSource = new Subject <any> ();
    this.universalSearchSource = new Subject <string> ();
    this.currentViewSource = new Subject <string> ();
    // Observable string streams
    this.currentDate$ = this.currentDateSource.asObservable();
    this.calendarDays$ = this.calendarDaysSource.asObservable();
    this.selectedDay$ = this.selectedDaySource.asObservable();
    this.monthEvents$  = this.monthEventsSource.asObservable();
    this.filteredMonthEvents$  = this.filteredMonthEventsSource.asObservable();
    this.weekEvents$  = this.weekEventsSource.asObservable();
    this.filteredWeekEvents$ = this.filteredWeekEventsSource.asObservable();
    this.dayEvents$ = this.dayEventsSource.asObservable();
    this.filteredDayEvents$ = this.filteredDayEventsSource.asObservable();
    this.clickedEvent$ = this.clickedEventSource.asObservable();
    this.expandedEvent$ = this.expandedEventSource.asObservable();
    this.hoveredEvent$ = this.hoveredEventSource.asObservable();
    this.categHash$ = this.categHashSource.asObservable();
    this.buttonHash$ = this.buttonHashSource.asObservable();
    this.locationFilter$ = this.locationFilterSource.asObservable();
    this.dateFilter$ = this.dateFilterSource.asObservable();
    this.timeFilter$ = this.timeFilterSource.asObservable();
    this.universalSearch$ = this.universalSearchSource.asObservable();
    this.currentView$ = this.currentViewSource.asObservable();
    // Maintain a set of self-subscribed local values
    this.currentDate$.subscribe(date => this._currentDate = date);
    this.calendarDays$.subscribe(days => this._calendarDays = days);
    this.selectedDay$.subscribe(day => { this._selectedDay = day; this._currentDate = day.date; });
    this.monthEvents$.subscribe(monthEvents => this._monthEvents = monthEvents);
    this.weekEvents$.subscribe(weekEvents => this._weekEvents = weekEvents);
    this.dayEvents$.subscribe(dayEvents => this._dayEvents = dayEvents);
    this.filteredMonthEvents$.subscribe(filteredMonthEvents => this._filteredMonthEvents = filteredMonthEvents);
    this.filteredWeekEvents$.subscribe(filteredWeekEvents => this._filteredWeekEvents = filteredWeekEvents);
    this.filteredDayEvents$.subscribe(filteredDayEvents => this._filteredDayEvents = filteredDayEvents);
    this.clickedEvent$.subscribe(clickedEventInfo => this._clickedEvent = clickedEventInfo);
    this.expandedEvent$.subscribe(expandedEventInfo => this._expandedEvent = expandedEventInfo);
    this.hoveredEvent$.subscribe(hoveredEventInfo => this._hoveredEvent = hoveredEventInfo);
    this.clickedEvent$.subscribe(expandedEventInfo => this._clickedEvent = expandedEventInfo);
    this.categHash$.subscribe(categHash => { this._categHash = categHash; this.applyAllFilters(); });
    this.buttonHash$.subscribe(filterHash => { this._buttonHash = filterHash; this.applyAllFilters(); });
    this.locationFilter$.subscribe(locationSearch => { this._locationFilter = locationSearch; this.applyAllFilters(); });
    this.dateFilter$.subscribe(dateHash => { this._dateFilter = dateHash; this.applyAllFilters(); });
    this.timeFilter$.subscribe(timeHash => { this._timeFilter = timeHash; this.applyAllFilters(); });
    this.universalSearch$.subscribe(universalSearch => { this._universalSearch = universalSearch; this.applyAllFilters(); })
    this.currentView$.subscribe(view => this._currentView = view);
    // Populate event containers
    this.updateDayEvents(new Date());
    this.updateMonthEvents(new Date());
    this.updateWeekEvents(new Date());
    this.isMapView();
    this.isCalendarView();
    this.isMonthView();
    this.isWeekView();
    // Initialize filters to defaults
    this.initCategories();
    this.resetFilters(this._currentView);
  }

  // CHANGE DATE SPAN //

  @Output() changeToWeek: EventEmitter<Number> = new EventEmitter();
  @Output() changeToMonth: EventEmitter<Number> = new EventEmitter();
  changeDateSpan(delta : Number) {
    if(delta == 0){
      if(this.isWeekView())
        this.changeToMonth.emit(delta);
      else
        this.changeToWeek.emit(delta);
    } else {
      if(this.isWeekView())
        this.changeToWeek.emit(delta);
      else
        this.changeToMonth.emit(delta);
    }
  }

  // VIEW CHECKERS //


  // test if app is currently in map view
  isMapView() {
    if(this.router.url.startsWith("/map")){
      this.currentViewSource.next('map');
    }
    return this.router.url.startsWith("/map");
  }

  // test if app is currently in calendar view
  isCalendarView() {
    return this.router.url.startsWith("/calendar");
  }

  // test if app is currently in month view
  isMonthView() {
    if(this.router.url.startsWith("/calendar/month")){
      this.currentViewSource.next('month');
      this.storeView('month');
    }
    return this.router.url.startsWith("/calendar/month");
  }

  // test if app is currently in week view
  isWeekView() {
    if(this.router.url.startsWith("/calendar/week")){
      this.currentViewSource.next('week');
      this.storeView('week');
    }
    return this.router.url.startsWith("/calendar/week");
  }

  // store the most recent view
  storeView(view: string){
    this._lastCalendarView = view;
  }

  // retrieve the last stored view
  retrieveLastView(){
    return this._lastCalendarView;
  }

  // DAY GETTERS AND SETTERS //

  getCurrentDate() {
    return this._currentDate;
  }

  // retrieve selected day as CalendarDay
  getSelectedDay() {
    return this._selectedDay;
  }

  // set selected day as CalendarDay
  setSelectedDay(day: CalendarDay) {
    this.selectedDaySource.next(day);
  }

  // set the current CalendarDay's
  setDays(calendarDays: CalendarDay[]){
    this.calendarDaysSource.next(calendarDays);
  }

  // get the current CalendarDay's
  getDays(){
    return this._calendarDays;
  }

  // EVENT GETTERS AND SETTERS //

  // Update the current hovered event
  updateHoveredEvent(event: GeoJson): void {
    this.hoveredEventSource.next(event);
  }

  // Update the current clicked event
  updateClickedEvent(event: GeoJson): void {
    this.clickedEventSource.next(event);
  }

  // Get the current clicked event
  getClickedEvent(){
    return this._clickedEvent;
  }

  // Update the current expanded event
  updateExpandedEvent(event: GeoJson): void {
    this.expandedEventSource.next(event);
    if(this.isMapView())
      this.boldPopup(event);
  }

  // Get the current expanded event
  getExpandedEvent(){
    return this._expandedEvent;
  }

  // advance selection to the next day
  increaseDay(days: number){
    this.updateClickedEvent(null);
    this.updateExpandedEvent(null);
    let newDate = this._currentDate;
    newDate.setDate(newDate.getDate() + days);
    this.updateDayEvents(newDate);
    this.updateCategories();
  }

  // EVENT RETRIEVAL //

  // Retrieve eventsURL
  private getEventsURL(): string {
    let allEventsURL = `${this.eventsUrl}/`;
    return allEventsURL;
  }

  // Retrieve events by event id
  getEventById(id: string): GeoJson {
    let event = this._dayEvents.features.find((e: GeoJson) => e.id == id);
    if(event == null){ event = this._weekEvents.features.find((e: GeoJson) => e.id == id); }
    if(event == null){ event = this._monthEvents.features.find((e: GeoJson) => e.id == id); }
    return event;
  }

  // Retrieve events by date
  getEventsByDate(date: Date): string {
    const d = moment(date).format('D');
    const monthName = moment(date).format('MMM');
    const y = moment(date).format('YYYY');
    let dateURL = `${this.eventsUrl}/search?date=${d}%20${monthName}%20${y}`;
    return dateURL;
  }

  // EVENT UPDATES //

  // Updates events for given day while persisting the current category
  updateDayEvents(date: Date): void {
  this.currentDateSource.next(date);
    this.http.get <FeatureCollection> (this.getEventsByDate(date)).subscribe(events => {
      this.dayEventsSource.next(events);
      if(this.isMapView()){
        this.resetFilters('map');
      }
    });
  }

  // Updates events for given month while persisting the current category
  updateMonthEvents(date: Date): void {
    this.http.get <FeatureCollection> (this.getEventsURL()).subscribe(allEvents => {
      this.monthEventsSource.next(allEvents);
      this.applyAllFilters();
    });
  }

  // Updates events for given week while persisting the current category
  updateWeekEvents(date: Date): void {
    this.http.get <FeatureCollection> (this.getEventsURL()).subscribe(allEvents => {
      this.weekEventsSource.next(this.filterByWeek(allEvents, date));
      this.applyAllFilters();
    });
  }

  // Filter events by week
  private filterByWeek(allEvents: FeatureCollection, date: Date){
    let weekEvents = new FeatureCollection([]);
    let firstDay = moment(date).startOf('week');
    if(new Date() > date){
      firstDay = moment(new Date());
    }
    let daysLeftInWeek = 7-parseInt((firstDay).format('d'));
    let lastDay = moment(firstDay).clone().add(daysLeftInWeek, 'days');
    allEvents.features.forEach(el => {
      let d = new Date(el.properties.start_time);
      if (d >= firstDay.toDate() && d <= lastDay.toDate())
        weekEvents.features.push(el)
    });
    return weekEvents;
  }

  // FILTER HASH FUNCTIONS //

  // reset all filters to defaults
  resetFilters(view: string){
    this.updateCategories();
    this.allCategories();
    this.resetFilterButtons();
    this.setTimeFilter(0,1439);
    this.setLocationFilter("");
    this.setUniversalSearch("");
    let calendarDays = this._calendarDays;
    if(view != 'map' && calendarDays){
      let first = moment([calendarDays[0].year,
        calendarDays[0].month,
        calendarDays[0].dayOfMonth]).toDate();
      let last = moment([calendarDays[calendarDays.length-1].year,
        calendarDays[calendarDays.length-1].month,
        calendarDays[calendarDays.length-1].dayOfMonth]).toDate();
      this.setDateFilter(first,last);
    }
  }

  // set date hash
  setDateFilter(first: Date, last: Date){
    let tempHash = [];
    tempHash.push(first);
    tempHash.push(last);
    this.dateFilterSource.next(tempHash);
  }

  // set date hash
  setDateFilterFromDays(calendarDays: CalendarDay[]){
    if(calendarDays.length > 0){
    let first = moment([calendarDays[0].year, calendarDays[0].month, calendarDays[0].dayOfMonth]).toDate();
    let last = moment([calendarDays[calendarDays.length-1].year, calendarDays[calendarDays.length-1].month, calendarDays[calendarDays.length-1].dayOfMonth]).toDate();
    this.setDateFilter(first,last);
    }
  }

  // return date hash
  getDateFilter(){
    return this._dateFilter;
  }

  // set time hash
  setTimeFilter(early: number, late: number) {
    let tempHash = [];
    tempHash.push(early);
    tempHash.push(late);
    this.timeFilterSource.next(tempHash);
  }

  // return time hash
  getTimeFilter(){
    return this._timeFilter;
  }

  // set location search
  setLocationFilter(search: string){
    this.locationFilterSource.next(search);
  }

  // return location search
  getLocationFilter(){
    return this._locationFilter;
  }

  // set universal search
  setUniversalSearch(search: string){
    this.universalSearchSource.next(search);
  }

  // return universal search
  getUniversalSearch(){
    return this._universalSearch;
  }

  // Toggle button
  toggleFilterButton(filter: string) {
    // if a filter is being applied via the filter buttons
    if (this._buttonHash[filter] != undefined) {
      // apply the current filter
      this._buttonHash[filter] = !this._buttonHash[filter];
      // unselect selected filters in the same group
      for (let f of this._filterGroups[this._filterGroupMap[filter]]) {
        if (f != filter && this._buttonHash[f]) {
          this._buttonHash[f] = false;
        }
      }
      // update filter hash
      this.buttonHashSource.next(this._buttonHash);
    }
  }

  // Toggle category
  toggleCategory(category: string) {
    // if a category is being applied
    if (this._categHash[category] != undefined) {
      if(this.isCalendarView()){
        this.resetCategories();
      }
      if(this.isMapView() && category == 'all'){
          if(this._categHash['all'].selected)
            this.resetCategories();
          else
            this.allCategories();
      }
      else {
        this._categHash['all'].selected = false;
        this._categHash[category].selected = !this._categHash[category].selected;
      }
    }
    this.categHashSource.next(this._categHash);
  }

  // GET categories from the server
  getCategories(): Observable<any> {
    return this.http.get<any>(this.categoriesUrl);
  }

  // Initialize category hash
  private initCategories() {
    this.getCategories().subscribe(categs => {
      // maps store counts of events that fulfill each category
      let dayMap = this.getCategoryMap(this._dayEvents.features);
      let monthMap = this.getCategoryMap(this._monthEvents.features);
      let weekMap = this.getCategoryMap(this._weekEvents.features);
      // initialize tempHash by building the all category container
      let tempHash = {
        'all': {
          formattedCategory: 'all',
          numEventsDay: dayMap['all'],
          numEventsMonth: monthMap['all'],
          numEventsWeek: weekMap['all'],
          selected: true
        }
      };
      // initialize all other category containers iteratively
      for (let categ of categs.categories) {
        let categName = categ.toLowerCase();
        tempHash[categName] = {
          formattedCategory: categName.replace('_', ' '),
          numEventsDay: dayMap[categName],
          numEventsMonth: monthMap[categName],
          numEventsWeek: weekMap[categName],
          selected: false
        }
      }
      // update the category hash and apply the categories
      this.categHashSource.next(tempHash);
    });
  }

  public updateCategories() {
    this.getCategories().subscribe(categs => {
      // maps store counts of events that fulfill each category
      let dayMap = this.getCategoryMap(this._dayEvents.features);
      let monthMap = this.getCategoryMap(this._monthEvents.features);
      let weekMap = this.getCategoryMap(this._weekEvents.features);
      // initialize tempHash by building the all category container
      let tempHash = {
         'all': {
           formattedCategory: 'all',
           numEventsDay: dayMap['all'],
           numEventsMonth: monthMap['all'],
           numEventsWeek: weekMap['all'],
           selected: this._categHash ? this._categHash['all'].selected : true
         }
      };
      for (let categ of categs.categories) {
        let categName = categ.toLowerCase();
        tempHash[categName] = {
          formattedCategory: categName.replace('_', ' '),
          numEventsDay: dayMap[categName],
          numEventsMonth: monthMap[categName],
          numEventsWeek: weekMap[categName],
          selected: this._categHash && this._categHash[categName] ? this._categHash[categName].selected : false
        }
      }
      // update the category hash
      this.categHashSource.next(tempHash);
    });
  }

  // Map categories to number of events in input featuresList
  private getCategoryMap(featuresList: GeoJson[]) {
    // initialize map
    let eventMap = {};
    let total = 0;
    // iterate through events
    for (let event of featuresList) {
      let d = new Date(event.properties.start_time);
      if(d >= moment().toDate() && event.properties.categories){
        // iterate through cartegories and increment count
        for (let category of event.properties.categories) {
          let eventCateg: string = category.toLowerCase();
          if (eventMap[eventCateg] === undefined)
            eventMap[eventCateg] = 1;
          else
            eventMap[eventCateg]++;
        }
        total++;
      }
    }
    // store total event count
    eventMap['all'] = total;
    return eventMap;
  }

  // reset all filters to be false
  resetFilterButtons() {
    let tempFilters = {
      'happening now': false,
      'upcoming': false,
      'on-campus': false,
      'off-campus': false,
      'nearby': false,
      'morning': false,
      'afternoon': false,
      'evening': false,
      'free food': false
    };
    this.buttonHashSource.next(tempFilters);
  }

  // reset all categories to be false
  resetCategories() {
    for (let categ in this._categHash) {
      if (this._categHash.hasOwnProperty(categ)) {
        this._categHash[categ.toLowerCase()].selected = false;
      }
    }
    this.categHashSource.next(this._categHash);
  }

  // reset all categories to be true
  allCategories() {
    let dayMap = this.getCategoryMap(this._dayEvents.features);
    for (let categ in this._categHash) {
      if (categ.toLowerCase() == 'all' || (this._categHash.hasOwnProperty(categ.toLowerCase()) && dayMap[categ.toLowerCase()] > 0)) {
        this._categHash[categ.toLowerCase()].selected = true;
      }
    }
    this.categHashSource.next(this._categHash);
  }

  // FILTER APPLICATIONS //

  // Apply filters and categories together
  applyAllFilters() {
    this.applyFiltersToSelection(this._dayEvents.features,this.filteredDayEventsSource);
    if(this.isWeekView()){
      this.applyFiltersToSelection(this._weekEvents.features,this.filteredWeekEventsSource);
    }
    if(this.isMonthView()){
      this.applyFiltersToSelection(this._monthEvents.features,this.filteredMonthEventsSource);
    }
  }

  private passesFilterButtons(event: GeoJson): boolean {
    let buttonCheck = true;
    for (let filterList of this._filterLists) {
      let passesThisFilter = false;
      let filterUsed = false;
      for (let filter of filterList) {
        if (this._buttonHash[filter])
          filterUsed = true;
        if (this._buttonHash[filter] && this.checkFilter(filter, event)) {
          passesThisFilter = true;
          break;
        }
      }
      if (filterUsed && !passesThisFilter) {
        buttonCheck = false;
        break;
      }
    }
    return buttonCheck;
  }

  private passesAllCategories(event: GeoJson): boolean {
    let categoryCheck = false;
    let allSelected = false;
    if(this._categHash && this._categHash['all'].selected)
      allSelected = true;
    if(event.properties.categories){
    for (let category of event.properties.categories) {
      let categObject = null;
      if(this._categHash)
        categObject = this._categHash[category.toLowerCase()];
      if (allSelected || (categObject && categObject.selected)) {
        categoryCheck = true;
        break;
      }
    }
    }
    return categoryCheck;
  }

  private passesDateAndTime(event: GeoJson): boolean {
    let eventDate = moment(event.properties.start_time).toDate();
    let properDate = (eventDate >= moment(this._dateFilter[0]).toDate() && eventDate <= moment(this._dateFilter[1]).add('1','days').toDate());
    let eventTime = moment(event.properties.start_time);
    let minCount = eventTime.hour()*60 + eventTime.minutes();
    let properTime = (minCount >= this._timeFilter[0] && minCount <= this._timeFilter[1]);
    return (properDate && properTime);
  }

  private passesLocation(event: GeoJson): boolean {
    let properLocation = false;
    if(this._locationFilter != ""){
      let eventLocation = event.properties.place.name;
      if(eventLocation){
        let targetWords = eventLocation.toLowerCase().split(" ");
        let searchWords = this._locationFilter.toLowerCase().split(" ");
        for(let searchString of searchWords){
          for(let matchString of targetWords){
            if(matchString.indexOf(searchString) != -1 && !this._excludedSearchWords.includes(searchString)){
              properLocation = true;
              break;
            }
          }
        }
      }
    }
    return properLocation;
  }

  private passesUniversalSearch(event: GeoJson): boolean {
    let properSearchTerm = false;
    if (this._universalSearch != ""){
      let eventName = event.properties.name;
      let targetWords = eventName.toLowerCase().split(" ");
      let searchWords = this._universalSearch.toLowerCase().split(" ");
      for(let searchString of searchWords){
        for (let matchString of targetWords) {
          if(matchString.indexOf(searchString) != -1){
            properSearchTerm = true;
            break;
          }
        }
      }
    }
    return properSearchTerm;
  }

  // Apply categories and filters to day
  private applyFiltersToSelection(inputFeatures: GeoJson[], outputSource: BehaviorSubject <FeatureCollection>){
    // start filtered events collection
    let tempEvents = new FeatureCollection([]);
    // iterate through events
    for (let event of inputFeatures) {
      let passesFilterButtons = this.passesFilterButtons(event);
      let passesAllCategories = this.passesAllCategories(event);
      let passesDateAndTime = true;
      let passesLocation = true;
      let passesUniversalSearch = true;
      if(this.isCalendarView()){
        if(this._dateFilter && this._timeFilter)
          passesDateAndTime = this.passesDateAndTime(event);
        if(this._locationFilter)
          passesLocation = this.passesLocation(event);
        if(this._universalSearch)
          passesUniversalSearch = this.passesUniversalSearch(event);
      }
      // combine all filter checks
      if (passesFilterButtons && passesAllCategories && passesDateAndTime && passesLocation && passesUniversalSearch)
        tempEvents.features.push(event);
    }
    // output source
    outputSource.next(tempEvents);
  }

  // Returns true if event passes the given filter
  private checkFilter(filter: string, event): boolean {
    if (filter == 'happening now')
      return this._dateService.isHappeningNow(event.properties.start_time);
    else if (filter == 'upcoming')
      return this._dateService.isUpcoming(event.properties.start_time);
    else if (filter == 'on-campus')
      return this._locationService.isOnCampus(event.geometry.coordinates[1], event.geometry.coordinates[0]);
    else if (filter == 'off-campus')
      return !this._locationService.isOnCampus(event.geometry.coordinates[1], event.geometry.coordinates[0]);
    else if (filter == 'nearby')
      return this._locationService.isNearby(event.geometry.coordinates[1], event.geometry.coordinates[0]);
    else if (filter == 'morning')
      return this._dateService.isMorning(event.properties.start_time);
    else if (filter == 'afternoon')
      return this._dateService.isAfternoon(event.properties.start_time);
    else if (filter == 'evening')
      return this._dateService.isEvening(event.properties.start_time);
    else if (filter == 'free food')
      return event.properties.free_food == 1;
    return true;
  }





  // MAPBOX POPUP HACK //

  //bold the popup event title for the given event, while unbolding all other event titles
  boldPopup(event: GeoJson): void {
    //iterate through popup event titles and unbold
    let popups = document.getElementsByClassName("popupEvent");
    for(let i = 0; i < popups.length; i++){
      if(this._expandedEvent == undefined || (this._expandedEvent != null && popups.item(i).id != "popupEvent"+this._expandedEvent.id)){
        (<any>popups.item(i)).style.fontWeight = "normal";
      }
    }
    //bold the selected event title
    if(event != null){
      let selectedPopup = document.getElementById("popupEvent"+event.id);
      if(selectedPopup != null){
        selectedPopup.style.fontWeight = "bold";
      }
    }
    //iterate through backup popup event titles and unbold
    let bpopups = document.getElementsByClassName("backupPopupEvent");
    for(let i = 0; i < bpopups.length; i++){
      if(this._expandedEvent == undefined || (this._expandedEvent != null && bpopups.item(i).id != "popupEvent"+this._expandedEvent.id)){
        (<any>bpopups.item(i)).style.fontWeight = "normal";
      }
    }
    //bold the selected backup event title
    if(event != null){
      let bselectedPopup = document.getElementById("backupPopupEvent"+event.id);
      if(bselectedPopup != null){
        bselectedPopup.style.fontWeight = "bold";
      }
    }
  }

}
