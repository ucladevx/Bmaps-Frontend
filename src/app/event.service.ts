import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Subject } from 'rxjs/Subject';
import { FeatureCollection, GeoJson } from './map';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { DateService } from './shared/date.service';
import { LocationService } from './shared/location.service';
import { CategoryService } from './category.service';
import { CategoryList } from './category';
import { Router, RouterLinkActive, ActivatedRoute } from '@angular/router';
import * as moment from 'moment';

@Injectable()
export class EventService {

  // holds all events stored for the current month view
  private monthEventsSource: BehaviorSubject <FeatureCollection>;
  // holds all events stored for the current month view, filtered down
  private filteredMonthEventsSource: BehaviorSubject <FeatureCollection>;
  // holds all events stored for the current week view
  private weekEventsSource: BehaviorSubject <FeatureCollection>;
  // holds all events stored for the current week view, filtered down
  private filteredWeekEventsSource: BehaviorSubject <FeatureCollection>;
  // holds all events stored for the exact current date
  private dayEventsSource: BehaviorSubject <FeatureCollection>;
  // holds all events stored for the exact current date, filtered down
  private filteredDayEventsSource: BehaviorSubject <FeatureCollection>;
  // holds the current date in Date format
  private currDateSource: BehaviorSubject <Date>;
  // holds the current month and year in (MM YYYY) string format
  private currMonthYearSource: BehaviorSubject <string>;
  // holds the current clicked event
  private clickedEventSource: Subject <GeoJson>;
  // holds the current hovered event
  private hoveredEventSource: Subject <GeoJson>;
  //holds the current expanded event
  private expandedEventSource: Subject <GeoJson>;
  // holds object of categories
  private categHashSource: Subject <any>;
  // holds object of filters
  private filterHashSource: Subject <any>;
  // holds object for filter location
  private locationSearchSource: Subject <string>;
  // holds object for filter date span
  private dateHashSource: Subject <any>;
  // holds object for filter time span
  private timeHashSource: Subject <any>;
  // holds string typed into search
  private universalSearchSource: Subject <string>;

  // Observables that components can subscribe to for realtime updates
  monthEvents$;
  filteredMonthEvents$;
  weekEvents$;
  filteredWeekEvents$;
  dayEvents$;
  filteredDayEvents$;
  currDate$;
  currMonthYear$;
  clickedEvent$;
  hoveredEvent$;
  expandedEvent$;
  categHash$;
  filterHash$;
  locationSearch$;
  dateHash$;
  timeHash$;
  universalSearch$;

  // Used internally to keep a realtime, subscribed set of values
  private _monthEvents;
  private _weekEvents;
  private _dayEvents;
  private _filteredMonthEvents;
  private _filteredWeekEvents;
  private _filteredDayEvents;
  private _currDate;
  private _currMonthYear;
  private _clickedEvent;
  private _hoveredEvent;
  private _expandedEvent;
  private _categHash;
  private _filterHash;
  private _locationSearch;
  private _dateHash;
  private _timeHash;
  private _universalSearch;

  private _selectedFilterCount = 0;
  private _selectedCategCount = 0;

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
    'happening now': 0,
    'upcoming': 0,
    'on-campus': 1,
    'off-campus': 1,
    'nearby': 1,
    'morning': 2,
    'afternoon': 3,
    'evening': 4,
    'free food': 5
  };

  // Filters in the same group will be OR'ed, every group will be AND'ed
  private _filterLists = [
    ['happening now'],
    ['upcoming'],
    ['on-campus'],
    ['off-campus'],
    ['nearby'],
    ['morning', 'afternoon', 'evening'],
    ['free food']
  ];

  // Words excluded from location search matching
  private _excludedSearchWords = [
        'a','all','an','and','any','area','areas','at','here',
        'in','it','its','place','places','room','rooms','that',
        'the','hall','building','ucla', '•', '-'
  ];

  // private baseUrl = "https://www.mappening.io/api/v1/events";
  // private baseUrl = "http://0.0.0.0:5000/api/v2/events"
  private baseUrl = "https://www.mappening.io/api/v2/events"

  public calendarServiceDays;

  // Constructor
  constructor(private router: Router, private http: HttpClient, private _dateService: DateService, private _locationService: LocationService, private _categService: CategoryService) {

    // Initialize date
    let today = new Date();
    let monthyear = (moment().month() + 1).toString() + " " + moment().year().toString();

    // Observable string sources, BehaviorSubjects have an intial state
    this.monthEventsSource = new BehaviorSubject < FeatureCollection > (new FeatureCollection([]));
    this.filteredMonthEventsSource = new BehaviorSubject < FeatureCollection > (new FeatureCollection([]));
    this.weekEventsSource = new BehaviorSubject < FeatureCollection > (new FeatureCollection([]));
    this.filteredWeekEventsSource = new BehaviorSubject < FeatureCollection > (new FeatureCollection([]));
    this.dayEventsSource = new BehaviorSubject < FeatureCollection > (new FeatureCollection([]));
    this.filteredDayEventsSource = new BehaviorSubject < FeatureCollection > (new FeatureCollection([]));
    this.currDateSource = new BehaviorSubject < Date > (today);
    this.currMonthYearSource = new BehaviorSubject < string > (monthyear);
    this.clickedEventSource = new Subject < GeoJson > ();
    this.hoveredEventSource = new Subject < GeoJson > ();
    this.expandedEventSource = new Subject < GeoJson > ();
    this.categHashSource = new Subject < any > ();
    this.filterHashSource = new Subject <any>();
    this.locationSearchSource = new Subject <string>();
    this.dateHashSource = new Subject <any>();
    this.timeHashSource = new Subject <any>();
    this.universalSearchSource = new Subject <string>();

    // Observable string streams
    this.monthEvents$  = this.monthEventsSource.asObservable();
    this.filteredMonthEvents$  = this.filteredMonthEventsSource.asObservable();
    this.weekEvents$  = this.weekEventsSource.asObservable();
    this.filteredWeekEvents$ = this.filteredWeekEventsSource.asObservable();
    this.dayEvents$ = this.dayEventsSource.asObservable();
    this.filteredDayEvents$ = this.filteredDayEventsSource.asObservable();
    this.currDate$ = this.currDateSource.asObservable();
    this.currMonthYear$  = this.currMonthYearSource.asObservable();
    this.clickedEvent$ = this.clickedEventSource.asObservable();
    this.hoveredEvent$ = this.hoveredEventSource.asObservable();
    this.expandedEvent$ = this.expandedEventSource.asObservable();
    this.categHash$ = this.categHashSource.asObservable();
    this.filterHash$ = this.filterHashSource.asObservable();
    this.locationSearch$ = this.locationSearchSource.asObservable();
    this.dateHash$ = this.dateHashSource.asObservable();
    this.timeHash$ = this.timeHashSource.asObservable();
    this.universalSearch$ = this.universalSearchSource.asObservable();

    // Maintain a set of self-subscribed local values
    this.monthEvents$.subscribe(monthEvents => this._monthEvents = monthEvents);
    this.weekEvents$.subscribe(weekEvents => this._weekEvents = weekEvents);
    this.dayEvents$.subscribe(dayEvents => this._dayEvents = dayEvents);
    this.filteredMonthEvents$.subscribe(filteredMonthEvents => this._filteredMonthEvents = filteredMonthEvents);
    this.filteredWeekEvents$.subscribe(filteredWeekEvents => this._filteredWeekEvents = filteredWeekEvents);
    this.filteredDayEvents$.subscribe(filteredDayEvents => this._filteredDayEvents = filteredDayEvents);
    this.currDate$.subscribe(date => this._currDate = date);
    this.currMonthYear$.subscribe(monthyear => this._currMonthYear = monthyear);
    this.clickedEvent$.subscribe(clickedEventInfo => this._clickedEvent = clickedEventInfo);
    this.hoveredEvent$.subscribe(hoveredEventInfo => this._hoveredEvent = hoveredEventInfo);
    this.expandedEvent$.subscribe(expandedEventInfo => this._expandedEvent = expandedEventInfo);
    this.categHash$.subscribe(categHash => this._categHash = categHash);
    this.filterHash$.subscribe(filterHash => this._filterHash = filterHash);
    this.locationSearch$.subscribe(locationSearch => this._locationSearch = locationSearch);
    this.dateHash$.subscribe(dateHash => this._dateHash = dateHash);
    this.timeHash$.subscribe(timeHash => this._timeHash = timeHash);
    this.universalSearch$.subscribe(universalSearch => this._universalSearch = universalSearch)

    // Populate event containers
    this.updateDayEvents(today);
    this.updateMonthEvents(monthyear);
    this.updateWeekEvents(today);
    this.applyFiltersAndCategories();
    this.initCategories();
    this.resetFilters();
    this.initTimeHash(0,1439);
    this.setLocationSearch("");
    this.setUniversalSearch("");
  }



  // DAY RELATED FUNCTIONS //

  // Determine whether current date is today
  isToday(): boolean {
    return this._dateService.isToday(this._currDate);
  }

  // Retrieve selected day
  getSelectedDay() {
    return this._currDate;
  }

  // Calls updateDayEvents for the current date + days
  updateDateByDays(days: number) {
    let newDate = this._currDate;
    newDate.setDate(newDate.getDate() + days);
    this.updateDayEvents(newDate);
  }

  // SELECTED EVENT FUNCTIONS //

  // Update the current hovered event
  updateHoveredEvent(event: GeoJson): void {
    this._hoveredEvent = event;
    this.hoveredEventSource.next(this._hoveredEvent);
  }

  // Update the current clicked event
  updateClickedEvent(event: GeoJson): void {
    this._clickedEvent = event;
    this.clickedEventSource.next(this._clickedEvent);
  }

  getClickedEvent(){
    return this._clickedEvent;
  }

  // Update the current expanded event
  updateExpandedEvent(event: GeoJson): void {
    this._expandedEvent = event;
    this.expandedEventSource.next(this._expandedEvent);
  }

  getExpandedEvent(){
    return this._expandedEvent;
  }

  // EVENT RETRIEVAL //

  // Retrieve eventsURL
  private getEventsURL(): string {
    let allEventsURL = `${this.baseUrl}/`;
    return allEventsURL;
  }

  // Retrieve events by event id
  getEventById(id: string): GeoJson {
    var event = this._dayEvents.features.find((e: GeoJson) => e.id == id);
    if(event == null){ event = this._weekEvents.features.find((e: GeoJson) => e.id == id); }
    return event;
  }

  // Retrieve events by date
  private getEventsByDate(date: Date): string {
    const d = date.getDate();
    const monthName = this._dateService.getMonthName(date);
    const y = date.getFullYear();
    let dateURL = `${this.baseUrl}/search?date=${d}%20${monthName}%20${y}`;
    return dateURL;
  }

  // EVENT UPDATES //

  // Updates events for given day while persisting the current category
  updateDayEvents(date: Date): void {
    this.currDateSource.next(date);
    this.http.get <FeatureCollection> (this.getEventsByDate(date)).subscribe(events => {
      this.dayEventsSource.next(events);
      // Update list of categories and reset filters
      if(this.router.url.startsWith('/map')){
        this._selectedFilterCount = 0;
        this._selectedCategCount = 0;
        this.updateCategories();
        this.resetFilters();
        this.allCategories();
        this.applyFiltersAndCategories();
      }
      else {
        this._selectedCategCount = 1;
        this.applyFiltersAndCategories();
        this._selectedCategCount = 0;
      }
    });
  }

  // Updates events for given month while persisting the current category
  updateMonthEvents(monthyear: string): void {
    this.http.get <FeatureCollection> (this.getEventsURL()).subscribe(events => {
      this.monthEventsSource.next(events);
      this.toggleCategory(this._categService.getSelectedCategory());
    });
  }

  // Updates events for given week while persisting the current category
  updateWeekEvents(firstDay: Date): void {
    this.http.get <FeatureCollection> (this.getEventsURL()).subscribe(allEvents => {
      this.weekEventsSource.next(this.filterByWeek(allEvents, firstDay));
      this.toggleCategory(this._categService.getSelectedCategory());
    });
  }

  // Filter events by week
  private filterByWeek(allEvents: FeatureCollection, firstDay: Date){
    let tempEvents = new FeatureCollection([]);
    var daysLeftInWekk = 7-parseInt(moment(firstDay).format('d'));
    var lastDay = moment(firstDay).clone().add(daysLeftInWekk, 'days').toDate();
    allEvents.features.forEach(el => {
      var d = new Date(el.properties.start_time);
      if (d >= firstDay && d <= lastDay){
        tempEvents.features.push(el)
      }
    });
    return tempEvents;
  }

  // FILTER HASH FUNCTIONS //

  resetAllFilters(){
    this.toggleCategory('all');
    this.resetFilters();
    this.initTimeHash(0,1439);
    this.setLocationSearch("");
    let calendarDays = this.calendarServiceDays;
    let first = moment([calendarDays[0].year, calendarDays[0].month, calendarDays[0].dayOfMonth]).toDate();
    let last = moment([calendarDays[calendarDays.length-1].year, calendarDays[calendarDays.length-1].month, calendarDays[calendarDays.length-1].dayOfMonth]).toDate();
    this.initDateHash(first,last);
  }

  initDateHash(first: Date, last: Date){
    let tempHash = [];
    // initialize all other date containers iteratively
    tempHash.push(first);
    tempHash.push(last);
    this.dateHashSource.next(tempHash);
    this.applyFiltersAndCategories();
  }

  getDateHash(){
    return this._dateHash;
  }

  initTimeHash(early: number, late: number) {
    let tempHash = [];
    // initialize all other date containers iteratively
    tempHash.push(early);
    tempHash.push(late);
    this.timeHashSource.next(tempHash);
    this.applyFiltersAndCategories();
  }

  getTimeHash(){
    return this._timeHash;
  }

  setLocationSearch(search: string){
    this._locationSearch = search;
    this.applyFiltersAndCategories();
  }

  getLocationSearch(){
    return this._locationSearch;
  }

  setUniversalSearch(search: string){
    this._universalSearch = search;
    this.applyFiltersAndCategories();
  }

  getUniversalSearch(){
    return this._universalSearch;
  }

  // Toggle filter
  toggleFilter(filter: string) {
    // if a filter is being applied
    if (this._filterHash[filter] != undefined) {
      // apply the current filter
      this._filterHash[filter] = !this._filterHash[filter];
      if (this._filterHash[filter])
        this._selectedFilterCount++;
      else
        this._selectedFilterCount--;
      // unselect selected filters in the same group
      for (let f of this._filterGroups[this._filterGroupMap[filter]]) {
        if (f != filter && this._filterHash[f]) {
          this._filterHash[f] = false;
          this._selectedFilterCount--;
        }
      }
      // update filter hash
      this.filterHashSource.next(this._filterHash);
    }
    // apply filters and categories
    this.applyFiltersAndCategories();
  }

  // Toggle category
  toggleCategory(category: string) {
    // if a category is being applied
    if (this._categHash[category] != undefined) {
      // apply the current category
      if(this.router.url.startsWith('/calendar')){
          this.resetCategories();
      }
      if(this.router.url.startsWith('/map') && category == 'all'){
          if(this._categHash['all'].selected){
            this.resetCategories();
          } else {
            this.allCategories();
          }
      } else{
        this._categHash['all'].selected = false;
        this._categHash[category].selected = !this._categHash[category].selected;
        if (this._categHash[category].selected)
          this._selectedCategCount++;
        else
          this._selectedCategCount--;
      }
    }
    if(this.router.url.startsWith('/calendar')){
      console.log(category);
      this._categService.setSelectedCategory(category);
      this.updateCategories();
    }
    // apply filters and categories
    this.applyFiltersAndCategories();
  }

  // Initialize category hash
  private initCategories() {
    this._categService.getCategories().subscribe(categs => {
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
      this.applyFiltersAndCategories();
    });
  }

  // Update category hash
  public updateCategories() {
    this._categService.getCategories().subscribe(categs => {
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
      if(d >= moment().toDate()){
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

  // Reset all filters to be false
  resetFilters() {
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
    this.filterHashSource.next(tempFilters);
  }

  resetCategories() {
    for (var categ in this._categHash) {
      if (this._categHash.hasOwnProperty(categ)) {
        this._categHash[categ.toLowerCase()].selected = false;
      }
    }
    this._selectedCategCount = 0;
  }

  allCategories() {
    var count = 0;
    let dayMap = this.getCategoryMap(this._dayEvents.features);
    for (var categ in this._categHash) {
      if (this._categHash.hasOwnProperty(categ.toLowerCase()) && dayMap[categ.toLowerCase()] > 0) {
        this._categHash[categ.toLowerCase()].selected = true;
        count++;
      }
    }
    this._selectedCategCount = count;
  }

  // FILTER APPLICATIONS //

  // Apply filters and categories together
  applyFiltersAndCategories() {
    // Map
    if(this.router.url.startsWith('/map')){
      if(this._selectedCategCount > -2 || this._selectedFilterCount != 0) {
        this.applyFiltersToSelection(this._dayEvents.features,this.filteredDayEventsSource);
      }
    }
    // Calendar
    else{
      if(this._selectedCategCount > 0 || this._selectedFilterCount > -1) {
        this.applyFiltersToSelection(this._weekEvents.features,this.filteredWeekEventsSource);
        this.applyFiltersToSelection(this._monthEvents.features,this.filteredMonthEventsSource);
        this.applyFiltersToSelection(this._dayEvents.features,this.filteredDayEventsSource);
      }
    }
  }

  // Apply categories and filters to day
  private applyFiltersToSelection(inputFeatures: GeoJson[], outputSource: BehaviorSubject <FeatureCollection>){
    // start filtered events collection
    let tempEvents = new FeatureCollection([]);
    // iterate through events
    for (let event of inputFeatures) {
      // check for matching categories
      let categoryCheck = false;
      let allSelected = false;
      if(this._categHash && this._categHash['all'].selected){
        allSelected = true;
      }
      for (let category of event.properties.categories) {
        let categObject = null;
        if(this._categHash){
          categObject = this._categHash[category.toLowerCase()];
        }
        if (allSelected || (categObject && categObject.selected)) {
          categoryCheck = true;
          break;
        }
      }
      // check for matching filters
      let passesAllFilters = true;
      if(this._selectedFilterCount > 0){
        for (let filterList of this._filterLists) {
          let passesThisFilter = false;
          let filterUsed = false;
          for (let filter of filterList) {
            if (this._filterHash[filter]) {
              filterUsed = true;
            }
            if (this._filterHash[filter] && this.checkFilter(filter, event)) {
              passesThisFilter = true;
              break;
            }
          }
          if (filterUsed && !passesThisFilter) {
            passesAllFilters = false;
            break;
          }
        }
      }
      // check for date/time/location and search term if calendar view
      let properDate = true;
      let properTime = true;
      let properLocation = true;
      let properSearchTerm = true;
      if(this.router.url.startsWith('/calendar') && this._dateHash){
        // date filters
        let eventDate = moment(event.properties.start_time).toDate();
        properDate = (eventDate >= moment(this._dateHash[0]).toDate() && eventDate <= moment(this._dateHash[1]).add('1','days').toDate());
        // time filters
        let eventTime = moment(event.properties.start_time);
        let minCount = eventTime.hour()*60 + eventTime.minutes();
        properTime = (minCount >= this._timeHash[0] && minCount <= this._timeHash[1]);
        // location filters
        if(this._locationSearch != ""){
          let eventLocation = event.properties.place.name;
          properLocation = false;
          if(eventLocation){
            let targetWords = eventLocation.toLowerCase().split(" ");
            let searchWords = this._locationSearch.toLowerCase().split(" ");
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
        if (this._universalSearch != ""){
          // Search using name, categories, description, date, location
          properSearchTerm = false;
          // name
          let eventName = event.properties.name;
          let targetWords = eventName.toLowerCase().split(" ");
          //matching
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
      }
      // combine all filter checks
      if (passesAllFilters && categoryCheck && properDate && properTime && properLocation && properSearchTerm) {
        tempEvents.features.push(event);
      }
    }
    // output source
    outputSource.next(tempEvents);
  }

  // Returns true if event passes the given filter
  private checkFilter(filter: string, event): boolean {
    if (filter == 'happening now') {
      return this._dateService.isHappeningNow(event.properties.start_time);
    }
    else if (filter == 'upcoming') {
      return this._dateService.isUpcoming(event.properties.start_time);
    }
    else if (filter == 'on-campus') {
      return this._locationService.isOnCampus(event.geometry.coordinates[1], event.geometry.coordinates[0]);
    }
    else if (filter == 'off-campus') {
      return !this._locationService.isOnCampus(event.geometry.coordinates[1], event.geometry.coordinates[0]);
    }
    else if (filter == 'nearby') {
      return this._locationService.isNearby(event.geometry.coordinates[1], event.geometry.coordinates[0]);
    }
    else if (filter == 'morning') {
      return this._dateService.isMorning(event.properties.start_time);
    }
    else if (filter == 'afternoon') {
      return this._dateService.isAfternoon(event.properties.start_time);
    }
    else if (filter == 'evening') {
      return this._dateService.isEvening(event.properties.start_time);
    }
    else if (filter == 'free food') {
      return event.properties.free_food == 1;
    }
    return true;
  }

  // MAPBOX POPUP HACK //

  //bold the popup event title for the given event, while unbolding all other event titles
  boldPopup(event: GeoJson): void {
    //iterate through popup event titles and unbold
    var popups = document.getElementsByClassName("popupEvent");
    for(var i = 0; i < popups.length; i++){
      if(this._expandedEvent == undefined || (this._expandedEvent != null && popups.item(i).id != "popupEvent"+this._expandedEvent.id)){
        (<any>popups.item(i)).style.fontWeight = "normal";
      }
    }
    //bold the selected event title
    if(event != null){
      var selectedPopup = document.getElementById("popupEvent"+event.id);
      if(selectedPopup != null){
        selectedPopup.style.fontWeight = "bold";
      }
    }
    //iterate through backup popup event titles and unbold
    var bpopups = document.getElementsByClassName("backupPopupEvent");
    for(var i = 0; i < bpopups.length; i++){
      if(this._expandedEvent == undefined || (this._expandedEvent != null && bpopups.item(i).id != "popupEvent"+this._expandedEvent.id)){
        (<any>bpopups.item(i)).style.fontWeight = "normal";
      }
    }
    //bold the selected backup event title
    if(event != null){
      var bselectedPopup = document.getElementById("backupPopupEvent"+event.id);
      if(bselectedPopup != null){
        bselectedPopup.style.fontWeight = "bold";
      }
    }
  }

}
