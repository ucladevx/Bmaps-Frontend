import { Injectable, EventEmitter, Output } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { FeatureCollection, GeoJson } from '../map';
import { DateService } from './date.service';
import { ViewService } from './view.service';
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
export class EventService {

  // DATE VARIABLES
  private _currentDate;               // holds the current selected day in Date format
  private _calendarDays;              // holds the days being displayed in CalendarDay format
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
  private _tagHash;                   // maps filter buttons to their selection status
  private _locationFilter;            // holds location string being searched for as filter
  private _dateFilter;                // holds range of dates being applied as filter
  private _timeFilter;                // holds range of times being applied as filter
  private _universalSearch;           // holds universal search string (only title now)

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
  private tagHashSource: Subject <any>;
  private locationFilterSource: Subject <string>;
  private dateFilterSource: Subject <any>;
  private timeFilterSource: Subject <any>;
  private universalSearchSource: Subject <string>;

  // OBSERVABLES
  currentDate$; calendarDays$; selectedDay$; clickedEvent$; expandedEvent$; hoveredEvent$;
  monthEvents$; filteredMonthEvents$; weekEvents$; filteredWeekEvents$; dayEvents$; filteredDayEvents$;
  categHash$; tagHash$; locationFilter$; dateFilter$; timeFilter$; universalSearch$;

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

  // retrieve events and categories
  private eventsUrl = "https://www.mappening.io/api/v2/events";
  private categoriesUrl = "https://www.mappening.io/api/v2/events/categories"

  // Constructor
  constructor(private http: HttpClient, private _dateService: DateService, private _viewService: ViewService, private _locationService: LocationService) {
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
    this.tagHashSource = new Subject <any> ();
    this.locationFilterSource = new Subject <string> ();
    this.dateFilterSource = new Subject <any> ();
    this.timeFilterSource = new Subject <any> ();
    this.universalSearchSource = new Subject <string> ();
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
    this.tagHash$ = this.tagHashSource.asObservable();
    this.locationFilter$ = this.locationFilterSource.asObservable();
    this.dateFilter$ = this.dateFilterSource.asObservable();
    this.timeFilter$ = this.timeFilterSource.asObservable();
    this.universalSearch$ = this.universalSearchSource.asObservable();
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
    this.tagHash$.subscribe(filterHash => { this._tagHash = filterHash; this.applyAllFilters(); });
    this.locationFilter$.subscribe(locationSearch => { this._locationFilter = locationSearch; this.applyAllFilters(); });
    this.dateFilter$.subscribe(dateHash => { this._dateFilter = dateHash; this.applyAllFilters(); });
    this.timeFilter$.subscribe(timeHash => { this._timeFilter = timeHash; this.applyAllFilters(); });
    this.universalSearch$.subscribe(universalSearch => { this._universalSearch = universalSearch; this.applyAllFilters(); })
    // Populate event containers
    this.updateDayEvents(new Date());
    this.updateMonthEvents(new Date());
    this.updateWeekEvents(new Date());
    // Initialize filters to defaults
    this.initCategories();
    this.resetFilters(this._viewService.getCurrentView());
  }

  // DAY GETTERS AND SETTERS //

  getCurrentDate() { return this._currentDate; }
  setCurrentDate(date: Date){ this.currentDateSource.next(date); }
  getSelectedDay() { return this._selectedDay; }
  setSelectedDay(day: CalendarDay) { this.selectedDaySource.next(day); }
  setDays(calendarDays: CalendarDay[]){ this.calendarDaysSource.next(calendarDays); }
  getDays(){ return this._calendarDays; }

  // EVENT GETTERS AND SETTERS //

  updateHoveredEvent(event: GeoJson): void { this.hoveredEventSource.next(event); }
  updateClickedEvent(event: GeoJson): void { this.clickedEventSource.next(event); }
  getClickedEvent(){ return this._clickedEvent; }
  updateExpandedEvent(event: GeoJson): void {
    this.expandedEventSource.next(event);
  }
  getExpandedEvent(){ return this._expandedEvent; }

  // advance selection to the next day
  increaseDay(days: number){
    this.updateClickedEvent(null);
    this.updateExpandedEvent(null);
    let newDate = this._currentDate;
    newDate.setDate(newDate.getDate() + days);
    this.updateDayEvents(newDate);
    this.updateMonthEvents(newDate);
    this.updateCategories();
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

  // Updates events for given day while persisting the current category
  updateDayEvents(date: Date): void {
  this.currentDateSource.next(date);
    this.http.get <FeatureCollection> (this.getEventsByDate(date)).subscribe(events => {
      this.dayEventsSource.next(events);
      if(this._viewService.isMapView()){ this.resetFilters('map'); }
    });
  }

  // Filter events by week
  private filterByWeek(allEvents: FeatureCollection, date: Date){
    let weekEvents = new FeatureCollection([]);
    let firstDay = moment(date).startOf('week');
    if(new Date() > date){ firstDay = moment(new Date()); }
    let daysLeftInWeek = 7-parseInt((firstDay).format('d'));
    let lastDay = firstDay.clone().add(daysLeftInWeek, 'days');
    allEvents.features.forEach(el => {
      let d = new Date(el.properties.start_time);
      if (d >= firstDay.toDate() && d <= lastDay.toDate()){ weekEvents.features.push(el); }
    });
    return weekEvents;
  }

  // FILTER RELATED FUNCTIONS //

  // reset all filters to defaults
  resetFilters(view: string){
    // rest categories
    this.updateCategories();
    this.allCategories();
    // reset tags/buttons
    this.resetTags();
    // reset time
    this.setTimeFilter(0,1439);
    // reset location
    this.setLocationFilter("");
    // reset universal search
    this.setUniversalSearch("");
    // if in calendar view, reset date
    if(view != 'map' && this._calendarDays)
      this.setDateFilterFromDays(this._calendarDays);
  }

  // date filter //

  setDateFilter(first: Date, last: Date){
    let tempHash = [];
    tempHash.push(first);
    tempHash.push(last);
    this.dateFilterSource.next(tempHash);
  }
  setDateFilterFromDays(calendarDays: CalendarDay[]){
    if(calendarDays.length > 0){
    let first = moment([calendarDays[0].year,
      calendarDays[0].month,
      calendarDays[0].dayOfMonth]).toDate();
    let last = moment([calendarDays[calendarDays.length-1].year,
      calendarDays[calendarDays.length-1].month,
      calendarDays[calendarDays.length-1].dayOfMonth]).toDate();
    this.setDateFilter(first,last);
    }
  }
  getDateFilter(){ return this._dateFilter; }

  // time filter //

  setTimeFilter(early: number, late: number) {
    let tempHash = [];
    tempHash.push(early);
    tempHash.push(late);
    this.timeFilterSource.next(tempHash);
  }
  getTimeFilter(){ return this._timeFilter; }

  // location filter //

  setLocationFilter(search: string){ this.locationFilterSource.next(search); }
  getLocationFilter(){ return this._locationFilter; }

  // universal search //

  setUniversalSearch(search: string){ this.universalSearchSource.next(search); }
  getUniversalSearch(){ return this._universalSearch; }

  // Toggle filter buttons
  toggleTag(filter: string) {
    // if a filter is being applied via the filter buttons
    if (this._tagHash[filter] != undefined) {
      // apply the current filter
      this._tagHash[filter] = !this._tagHash[filter];
      // unselect selected filters in the same group
      for (let f of this._filterGroups[this._filterGroupMap[filter]]) {
        if (f != filter && this._tagHash[f]) { this._tagHash[f] = false; }
      }
      // update tag hash
      this.tagHashSource.next(this._tagHash);
    }
  }

  // Toggle category
  toggleCategory(category: string) {
    // if a category is being applied via the category selectors
    if (this._categHash[category] != undefined) {
      // reset categories in calendar (not multiselect yet)
      if(this._viewService.isCalendarView()){ this.resetCategories(); }
      // special behavior for map view 'all' (multiselect)
      if(this._viewService.isMapView() && category == 'all'){
          if(this._categHash['all'].selected)
            this.resetCategories();
          else
            this.allCategories();
      }
      // toggle the selected category
      else {
        this._categHash['all'].selected = false;
        this._categHash[category].selected = !this._categHash[category].selected;
      }
    }
    // update category hash
    this.categHashSource.next(this._categHash);
  }

  // GET categories from the server
  getCategories(): Observable<any> { return this.http.get<any>(this.categoriesUrl); }

  // Initialize category hash (all selected)
  private initCategories() {
    this.getCategories().subscribe(categs => {
      // maps store counts of events that fulfill each category
      let dayMap = this.getCategoryMap(this._dayEvents.features);
      let monthMap = this.getCategoryMap(this._monthEvents.features);
      let weekMap = this.getCategoryMap(this._weekEvents.features);
      // initialize tempHash by building the all category container
      let tempHash = { 'all': {
          formattedCategory: 'all',
          numEventsDay: dayMap['all'],
          numEventsMonth: monthMap['all'],
          numEventsWeek: weekMap['all'],
          selected: true }
      };
      // initialize all other category containers iteratively
      for (let categ of categs.categories) {
        let categName = categ.toLowerCase();
        let categStr = categName.replace('_', ' ');
        categStr = categStr.charAt(0).toUpperCase() + categStr.slice(1).toLowerCase() + ', ';
        categStr = categStr.slice(0, categStr.length - 2);
        tempHash[categName] = {
          formattedCategory: categStr,
          numEventsDay: dayMap[categName],
          numEventsMonth: monthMap[categName],
          numEventsWeek: weekMap[categName],
          selected: false
        }
      }
      // update category hash
      this.categHashSource.next(tempHash);
    });
  }

  // Update category hash (maintain selections)
  public updateCategories() {
    this.getCategories().subscribe(categs => {
      // maps store counts of events that fulfill each category
      let dayMap = this.getCategoryMap(this._dayEvents.features);
      let monthMap = this.getCategoryMap(this._monthEvents.features);
      let weekMap = this.getCategoryMap(this._weekEvents.features);
      // initialize tempHash by building the all category container
      let tempHash = { 'all': {
           formattedCategory: 'all',
           numEventsDay: dayMap['all'],
           numEventsMonth: monthMap['all'],
           numEventsWeek: weekMap['all'],
           selected: this._categHash ? this._categHash['all'].selected : true }
      };
      // initialize all other category containers iteratively
      for (let categ of categs.categories) {
        let categName = categ.toLowerCase().replace('_', ' ');
        let categStr = categName.charAt(0).toUpperCase() + categName.slice(1).toLowerCase() + ', ';
        categStr = categStr.slice(0, categStr.length - 2);
        tempHash[categName] = {
          formattedCategory: categStr,
          numEventsDay: dayMap[categName],
          numEventsMonth: monthMap[categName],
          numEventsWeek: weekMap[categName],
          selected: this._categHash && this._categHash[categName] ? this._categHash[categName].selected : false
        }
      }
      // update category hash
      this.categHashSource.next(tempHash);
    });
  }

  // Map categories to number of events in input featuresList
  private getCategoryMap(featuresList: GeoJson[]) {
    // initialize map
    let eventMap = {}; let total = 0;
    // iterate through events
    for (let event of featuresList) {
      let d = new Date(event.properties.start_time);
      // if event is in the current display range
      if(moment(d).isSame(moment(this._currentDate), 'month') &&
       d >= moment().toDate() && event.properties.categories){
        // iterate through categories and increment count
        for (let category of event.properties.categories) {
          let eventCateg: string = category.toLowerCase();
          if (eventMap[eventCateg] === undefined)
            eventMap[eventCateg] = 1;
          else
            eventMap[eventCateg]++;
        }
        // increment total event count
        total++;
      }
    }
    // store total event count
    eventMap['all'] = total;
    return eventMap;
  }

  // reset all filter tags to be false
  resetTags() {
    let tempFilters = {
      'happening now': false, 'upcoming': false,
      'on-campus': false, 'off-campus': false, 'nearby': false,
      'morning': false, 'afternoon': false, 'evening': false,
      'free food': false
    };
    this.tagHashSource.next(tempFilters);
  }

  // reset all categories to be false
  resetCategories() {
    for (let categ in this._categHash)
      if (this._categHash.hasOwnProperty(categ))
        this._categHash[categ.toLowerCase()].selected = false;
    this.categHashSource.next(this._categHash);
  }

  // reset all categories (in range) to be true
  allCategories() {
    let dayMap = this.getCategoryMap(this._dayEvents.features);
    for (let categ in this._categHash)
      if (categ.toLowerCase() == 'all' ||
      (this._categHash.hasOwnProperty(categ.toLowerCase()) && dayMap[categ.toLowerCase()] > 0))
        this._categHash[categ.toLowerCase()].selected = true;
    this.categHashSource.next(this._categHash);
  }

  // FILTER APPLICATIONS //

  // Apply filters to day, week, and month
  applyAllFilters() {
    this.applyFiltersToSelection(this._dayEvents.features,this.filteredDayEventsSource);
    if(this._viewService.isWeekView())
      this.applyFiltersToSelection(this._weekEvents.features,this.filteredWeekEventsSource);
    if(this._viewService.isMonthView())
      this.applyFiltersToSelection(this._monthEvents.features,this.filteredMonthEventsSource);
  }

  // Apply filters to inputFeatures
  private applyFiltersToSelection(inputFeatures: GeoJson[], outputSource: BehaviorSubject <FeatureCollection>){
    // start filtered events collection
    let tempEvents = new FeatureCollection([]);
    // iterate through events
    for (let event of inputFeatures) {
      // both map and calendar check for tags and categories
      let passesTags = this.passesTags(event);
      let passesAllCategories = this.passesAllCategories(event);
      // calendar view checks for date, time, location, and univ. search
      let passesDateAndTime = true;
      let passesLocation = true;
      let passesUniversalSearch = true;
      if(this._viewService.isCalendarView()){
        if(this._dateFilter && this._timeFilter)
          passesDateAndTime = this.passesDateAndTime(event);
        if(this._locationFilter)
          passesLocation = this.passesLocation(event);
        if(this._universalSearch)
          passesUniversalSearch = this.passesUniversalSearch(event);
      }
      // combine all filter checks
      if (passesTags &&
          passesAllCategories &&
          passesDateAndTime &&
          passesLocation &&
          passesUniversalSearch)
        tempEvents.features.push(event);
    }
    // output to parameter source
    outputSource.next(tempEvents);
  }

  // Filter Check: categories
  private passesAllCategories(event: GeoJson): boolean {
    let categoryCheck = false;
    // determine if 'all' is applied
    let allSelected = false;
    if(this._categHash && this._categHash['all'].selected)
      allSelected = true;
    // iterate through categories
    if(event.properties.categories){
    for (let category of event.properties.categories) {
      // determine if any one of the categories matches
      let categObject = null;
      if(this._categHash){
        categObject = this._categHash[category.toLowerCase()];
      }
      if (allSelected || (categObject && categObject.selected)) {
        categoryCheck = true;
        break;
      }
    }
    }
    return categoryCheck;
  }

  // Filter Check: tags/buttons
  private passesTags(event: GeoJson): boolean {
    let tagCheck = true;
    // iterate through filter groups
    for (let filterList of this._filterLists) {
      let passesThisFilter = false;
      let filterUsed = false;
      // iterate through filters
      for (let filter of filterList) {
        // determine if filter is used
        if (this._tagHash[filter])
          filterUsed = true;
        // determine if filter is passed
        if (this._tagHash[filter] &&
          this.checkFilter(filter, event)) {
          passesThisFilter = true;
          break;
        }
      }
      // fails if not fulfilling an applied filter
      if (filterUsed && !passesThisFilter) {
        tagCheck = false;
        break;
      }
    }
    return tagCheck;
  }

  // Filter Check - date and time
  private passesDateAndTime(event: GeoJson): boolean {
    // compare event date to the date filter being applied
    let eventDate = moment(event.properties.start_time).toDate();
    let properDate = (eventDate >= moment(this._dateFilter[0]).toDate() && eventDate <= moment(this._dateFilter[1]).add('1','days').toDate());
    // compare event time to the time filter being applied
    let eventTime = moment(event.properties.start_time);
    let minCount = eventTime.hour()*60 + eventTime.minutes();
    let properTime = (minCount >= this._timeFilter[0] && minCount <= this._timeFilter[1]);
    // combine the two tests into one
    return (properDate && properTime);
  }

  // Filter Check - location
  private passesLocation(event: GeoJson): boolean {
    let properLocation = false;
    if(this._locationFilter != ""){
      // retrieve event location
      let eventLocation = event.properties.place.name;
      if(eventLocation){
        // target words are those in the actual event location string
        let targetWords = eventLocation.toLowerCase().split(" ");
        // search words are those in the location search string
        let searchWords = this._locationFilter.toLowerCase().split(" ");
        // iterate through and check for substring matches
        for(let searchString of searchWords){
          for(let matchString of targetWords){
            if(matchString.indexOf(searchString) != -1 && !this._excludedSearchWords.includes(searchString)){
              properLocation = true;
              break;
    }}}}}
    return properLocation;
  }

  // Filter Check - universalSearch
  private passesUniversalSearch(event: GeoJson): boolean {
    let properSearchTerm = false;
    if (this._universalSearch != ""){
      // retrieve event name
      let eventName = event.properties.name;
      // target words are those in the actual event title string
      let targetWords = eventName.toLowerCase().split(" ");
      // search words are those in the universal search string
      let searchWords = this._universalSearch.toLowerCase().split(" ");
      // iterate through and check for substring matches
      for(let searchString of searchWords){
        for (let matchString of targetWords) {
          if(matchString.indexOf(searchString) != -1){
            properSearchTerm = true;
            break;
    }}}}
    return properSearchTerm;
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

}
