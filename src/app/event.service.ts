import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import {Subject} from 'rxjs/Subject';
import { FeatureCollection, GeoJson } from './map';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { DateService } from './shared/date.service';
import { LocationService } from './shared/location.service';
import { CategoryService } from './category.service';
import { CategoryList } from './category';
import * as moment from 'moment';

@Injectable()
export class EventService {
  // holds all events
  private monthEventsSource: BehaviorSubject <FeatureCollection>;
  // holds all filtered events
  private filteredMonthEventsSource: BehaviorSubject <FeatureCollection>;
  // holds all filtered events for a week
  private filteredWeekEventsSource: BehaviorSubject <FeatureCollection>;
  // holds all events of the current date that components can see
  private currEventsSource: BehaviorSubject <FeatureCollection>;
  // holds filtered events that components can see
  private filteredCurrEventsSource: BehaviorSubject <FeatureCollection> ;
  // holds the current date that components can see
  private currDateSource: BehaviorSubject <Date> ;
  // holds clicked event
  private clickedEventSource: Subject <GeoJson> ;
  // holds hovered event
  private hoveredEventSource: Subject <GeoJson> ;
  //holds expanded event
  private expandedEventSource: Subject <GeoJson> ;
  // holds object of categories
  private categHashSource: Subject <any> ;
  // holds object of filters
  private filterHashSource: Subject <any> ;
  // holds the current month and year in (MM YYYY) string format
  private currMonthYearSource: BehaviorSubject <string> ;

  // Observables that components can subscribe to for realtime updates
  monthEvents$;
  filteredMonthEvents$;
  filteredWeekEvents$;
  currEvents$;
  filteredCurrEvents$;
  currMonthYear$;
  currDate$;
  clickedEvent$;
  hoveredEvent$;
  expandedEvent$;
  categHash$;
  filterHash$;

  // Used internally to keep a realtime, subscribed set of values
  private _allevents;
  private _events;
  private _date;
  private _clickedEvent;
  private _hoveredEvent;
  private _expandedEvent;
  private _categHash;
  private _filterHash;
  private _weekEvents;

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
  // Filters in the same group will be OR'ed
  // Every group will be AND'ed
  private _filterLists = [
    ['happening now'],
    ['upcoming'],
    ['on-campus'],
    ['off-campus'],
    ['nearby'],
    ['morning', 'afternoon', 'evening'],
    ['free food']
  ];

  // private baseUrl = "https://www.mappening.io/api/v1/events";
  private baseUrl = "https://www.mappening.io/api/v2/events"
  // private baseUrl = "http://0.0.0.0:5000/api/v2/events"

  constructor(private http: HttpClient, private dateService: DateService, private locationService: LocationService, private categService: CategoryService) {
    let today = new Date();
    let monthyear = moment().month().toString() + " " + moment().year().toString();

    // Observable string sources, BehaviorSubjects have an intial state
    this.monthEventsSource = new BehaviorSubject < FeatureCollection > (new FeatureCollection([]));
    this.filteredMonthEventsSource = new BehaviorSubject < FeatureCollection > (new FeatureCollection([]));
    this.filteredWeekEventsSource = new BehaviorSubject < FeatureCollection > (new FeatureCollection([]));
    this.currEventsSource = new BehaviorSubject < FeatureCollection > (new FeatureCollection([]));
    this.filteredCurrEventsSource = new BehaviorSubject < FeatureCollection > (new FeatureCollection([]));
    this.currDateSource = new BehaviorSubject < Date > (today);
    this.currMonthYearSource = new BehaviorSubject < string > (monthyear);
    this.clickedEventSource = new Subject < GeoJson > ();
    this.hoveredEventSource = new Subject < GeoJson > ();
    this.expandedEventSource = new Subject < GeoJson > ();
    this.categHashSource = new Subject < any > ();
    this.filterHashSource = new Subject <any>();

    // Observable string streams
    this.monthEvents$  = this.monthEventsSource.asObservable();
    this.filteredMonthEvents$  = this.filteredMonthEventsSource.asObservable();
    this.filteredWeekEvents$ = this.filteredWeekEventsSource.asObservable();
    this.currEvents$ = this.currEventsSource.asObservable();
    this.filteredCurrEvents$ = this.filteredCurrEventsSource.asObservable();
    this.currDate$ = this.currDateSource.asObservable();
    this.currMonthYear$  = this.currMonthYearSource.asObservable();
    this.clickedEvent$ = this.clickedEventSource.asObservable();
    this.hoveredEvent$ = this.hoveredEventSource.asObservable();
    this.expandedEvent$ = this.expandedEventSource.asObservable();
    this.categHash$ = this.categHashSource.asObservable();
    this.filterHash$ = this.filterHashSource.asObservable();

    // Maintain a set of self-subscribed local values
    this.monthEvents$.subscribe(monthEventCollection => this._allevents = monthEventCollection);
    this.currEvents$.subscribe(eventCollection => this._events = eventCollection);
    this.currDate$.subscribe(date => this._date = date);
    this.clickedEvent$.subscribe(clickedEventInfo => this._clickedEvent = clickedEventInfo);
    this.hoveredEvent$.subscribe(hoveredEventInfo => this._hoveredEvent = hoveredEventInfo);
    this.expandedEvent$.subscribe(expandedEventInfo => this._expandedEvent = expandedEventInfo);
    this.categHash$.subscribe(categHash => this._categHash = categHash);
    this.filterHash$.subscribe(filterHash => this._filterHash = filterHash);
    this.filteredWeekEvents$.subscribe(weekEvents => this._weekEvents = weekEvents);

    // Update events for today
    this.updateEvents(today);

    // this.http.get <FeatureCollection> (
    //   this.getEventsOnMonth(today.getMonth().toString() + " " + today.getFullYear().toString())
    // ).subscribe(events => {
    //   console.log(events);
    //   this.monthEventsSource.next(events);

    //   // Update list of categories and reset filters
    //   // this._selectedFilterCount = 0;
    //   // this._selectedCategCount = 0;
    //   // this.updateCategories();
    //   // this.resetFilters();
    //   // this.applyFiltersAndCategories();
    // });
    this.updateMonthEvents(monthyear);

  }

    // Update categories
    private initCategories(monthyear: string) {
      this.categService.getCategories()
        .subscribe(categs => {
          let eventMap = this.getEventMap();
          let tempHash = {
            'all': {
              formattedCategory: 'all',
              numEvents: eventMap['all'],
              selected: this._categHash ? this._categHash['all'].selected : true
            }
          };
          for (let categ of categs.categories) {
            let categName = categ.toLowerCase();
            tempHash[categName] = {
              formattedCategory: categName.replace('_', ' '),
              numEvents: eventMap[categName],
              selected: this._categHash && this._categHash[categName] ? this._categHash[categName].selected : false
            }
          }
          this.categHashSource.next(tempHash);
          this.applyCategories(monthyear);
        });
    }

  // Appy current _categHash
  private applyCategories(monthyear: string) {
    if (monthyear == ''){
      let tempEvents = new FeatureCollection([]);
        for (let event of this._events.features) {
          let allSelected = this._categHash['all'].selected;
          for (let category of event.properties.categories) {
            let categObject = this._categHash[category.toLowerCase()];
            if (allSelected || (categObject && categObject.selected)) {
              tempEvents.features.push(event);
              break;
            }
          }
        }
      this.filteredCurrEventsSource.next(tempEvents);
    } else {
      let tempEvents = new FeatureCollection([]);
        for (let event of this._allevents.features) {
          let allSelected = this._categHash['all'].selected;
          for (let category of event.properties.categories) {
            let categObject = this._categHash[category.toLowerCase()];
            if (allSelected || (categObject && categObject.selected)) {
              tempEvents.features.push(event);
              break;
            }
          }
        }
      this.filteredMonthEventsSource.next(tempEvents);
    }
  }

  // Reset all filters to be false
  private resetFilters() {
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

  // Reset all filters to be false
  private resetFilters() {
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

  // Update categories
  private updateCategories() {
    this.categService.getCategories()
      .subscribe(categs => {
        let eventMap = this.getEventMap();
        let tempHash = {};
        // let tempHash = {
        //   'all': {
        //     formattedCategory: 'all',
        //     numEvents: eventMap['all'],
        //     selected: this._categHash ? this._categHash['all'].selected : true
        //   }
        // };
        for (let categ of categs.categories) {
          let categName = categ.toLowerCase();
          tempHash[categName] = {
            formattedCategory: categName.replace('_', ' '),
            numEvents: eventMap[categName],
            selected: false
          }
        }
        this.categHashSource.next(tempHash);
      });
  }

  private getEventMap() {
    let eventMap = {};
    let total = 0;

    for (let event of this._events.features) {
      for (let category of event.properties.categories) {
        let eventCateg: string = category.toLowerCase();
        if (eventMap[eventCateg] === undefined) {
          eventMap[eventCateg] = 1;
        } else {
          eventMap[eventCateg]++;
        }
      }
      total++;
    }
    eventMap['all'] = total;

    return eventMap;
  }

  private getEventsOnDateURL(date: Date): string {
    const d = date.getDate();
    const monthName = this.dateService.getMonthName(date);
    const y = date.getFullYear();
    // let dateURL = `${this.baseUrl}/event-date/${d}%20${monthName}%20${y}`;
    let dateURL = `${this.baseUrl}/search?date=${d}%20${monthName}%20${y}`;
    return dateURL; // json we are pulling from for event info
  }

  private getEventsOnMonth(monthyear: string): string {
    var res = monthyear.split(" ");
    const month = Number(res[0]);
    const year = Number(res[1]);
    let dateURL = `${this.baseUrl}/search?month=${month}%20year=${year}`;
    return dateURL;
  }


  // Updates events for given date while persisting the current category
  updateEvents(date: Date): void {
    this.currDateSource.next(date);
    this.http.get <FeatureCollection> (
      this.getEventsOnDateURL(date)
    ).subscribe(events => {
      this.currEventsSource.next(events);

      // Update list of categories and reset filters
      this._selectedFilterCount = 0;
      this._selectedCategCount = 0;
      this.updateCategories();
      this.resetFilters();
      this.applyFiltersAndCategories();
    });
    // this.http.get <FeatureCollection> (
    //   this.getEventsOnMonth(date.getMonth().toString() + " " + date.getFullYear().toString())
    // ).subscribe(events => {
    //   console.log(events);
    //   this.monthEventsSource.next(events);

    //   // Update list of categories and reset filters
    //   // this._selectedFilterCount = 0;
    //   // this._selectedCategCount = 0;
    //   // this.updateCategories();
    //   // this.resetFilters();
    //   // this.applyFiltersAndCategories();
    // });
  }

  private getEventsURL(): string {
    let allEventsURL = `${this.baseUrl}/`;
    return allEventsURL; // json we are pulling from for event info
  }

  // Updates events for given date while persisting the current category
  updateMonthEvents(monthyear: string): void {
    // console.log("UPDATING EVENTS");
    // this.currMonthYearSource.next(monthyear);
    // this.http.get <FeatureCollection> (
    //   this.getEventsURL()
    // ).subscribe(monthyearEvents => {
    //   console.log(monthyearEvents);
    //   this.monthEventsSource.next(this.filterByMonthYear(monthyearEvents, monthyear));
    //   this.initCategories(monthyear);
    // });
    this.http.get <FeatureCollection> (
      this.getEventsOnMonth(monthyear)
    ).subscribe(events => {
      this.monthEventsSource.next(events);

      // Update list of categories and reset filters
      // this._selectedFilterCount = 0;
      // this._selectedCategCount = 0;
      // this.updateCategories();
      // this.resetFilters();
      // this.applyFiltersAndCategories();
    });
    // this.getEventsOnMonth(monthyear);
  }

  //added for week view

  updateWeekEvents(firstDay: Date): void {
    this.http.get <FeatureCollection> (
      this.getEventsURL()
    ).subscribe(allEvents => {
      this.filteredWeekEventsSource.next(this.filterByWeek(allEvents, firstDay));
      let monthyear = firstDay.getMonth() + " " + firstDay.getFullYear();
      this.initCategories(monthyear);
    });
  }

  filterByWeek(allEvents, firstDay){
    let tempEvents = new FeatureCollection([]);
    var lastDay = moment(firstDay).clone().add(6, 'days').toDate();
    allEvents.features.forEach(el => {
      var d = new Date(el.properties.start_time);
      var month = d.getMonth();
      var year = d.getFullYear();
      if (((month == firstDay.getMonth()) && (year == firstDay.getFullYear())) || ((month == lastDay.getMonth()) && (year == lastDay.getFullYear())))
        tempEvents.features.push(el)
    });
    return tempEvents;
  }

  //end of week view methods

  filterByMonthYear(monthyearEvents, monthyear){
    let tempEvents = new FeatureCollection([]);
    monthyearEvents.features.forEach(el => {
      var d = new Date(el.properties.start_time);
      var month = d.getMonth();
      var year = d.getFullYear();
      var res = monthyear.split(" ");
      if ((month == Number(res[0])) && (year == Number(res[1])))
        tempEvents.features.push(el)
    });
    return tempEvents;
  }


  // Calls updateEvents for the current date + days
  updateDateByDays(days: number) {
    let newDate = this._date;
    newDate.setDate(newDate.getDate() + days);
    this.updateEvents(newDate);
  }

  // Toggle filter
  toggleFilter(filter: string) {
    if (this._filterHash[filter] != undefined) {
      this._filterHash[filter] = !this._filterHash[filter];
      if (this._filterHash[filter]) {
        this._selectedFilterCount++;
      }
      else {
        this._selectedFilterCount--;
      }
      // Unselect selected filters in the same group
      for (let f of this._filterGroups[this._filterGroupMap[filter]]) {
        if (f != filter && this._filterHash[f]) {
          this._filterHash[f] = false;
          this._selectedFilterCount--;
        }
      }
    }
    this.applyFiltersAndCategories();
  }

  // Toggle category
  toggleCategory(category: string) {
    if (this._categHash[category] != undefined) {
      this._categHash[category].selected = !this._categHash[category].selected;
      if (this._categHash[category].selected) {
        this._selectedCategCount++;
      }
      else {
        this._selectedCategCount--;
      }
    }
    this.applyFiltersAndCategories();
  }

  private applyFiltersAndCategories() {
    console.log("APPLYING FILTERS & CATEGORIES");

    let tempEvents = new FeatureCollection([]);
    if (this._selectedCategCount == 0) {
      // If no categories selected, show all events
      tempEvents = this._events;
    }
    else {
      // Otherwise apply categories
      for (let event of this._events.features) {
        for (let category of event.properties.categories) {
          let categObject = this._categHash[category.toLowerCase()];
          if (categObject && categObject.selected) {
            tempEvents.features.push(event);
            break;
          }
        }
      }
    }

    let tempEvents2 = new FeatureCollection([]);
    if (this._selectedFilterCount == 0) {
      // If no filters selected, show all tempEvents
      tempEvents2 = tempEvents;
    }
    else {
      // Otherwise apply filters
      for (let event of tempEvents.features) {
        let passesAllFilters = true;

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
        if (passesAllFilters) {
          tempEvents2.features.push(event);
        }
      }
    }

    this.filteredCurrEventsSource.next(tempEvents);
  }

  // Returns true if event passes the given filter
  private checkFilter(filter: string, event): boolean {
    if (filter == 'happening now') {
      return this.dateService.isHappeningNow(event.properties.start_time);
    }
    else if (filter == 'upcoming') {
      return this.dateService.isUpcoming(event.properties.start_time);
    }
    else if (filter == 'on-campus') {
      return this.locationService.isOnCampus(event.geometry.coordinates[1], event.geometry.coordinates[0]);
    }
    else if (filter == 'off-campus') {
      return !this.locationService.isOnCampus(event.geometry.coordinates[1], event.geometry.coordinates[0]);
    }
    else if (filter == 'nearby') {
      return this.locationService.isNearby(event.geometry.coordinates[1], event.geometry.coordinates[0]);
    }
    else if (filter == 'morning') {
      return this.dateService.isMorning(event.properties.start_time);
    }
    else if (filter == 'afternoon') {
      return this.dateService.isAfternoon(event.properties.start_time);
    }
    else if (filter == 'evening') {
      return this.dateService.isEvening(event.properties.start_time);
    }
    else if (filter == 'free food') {
      return event.properties.free_food == 1;
    }
    return true;
  }

  // Updates the current clicked event by number
  updateClickedEvent(event: GeoJson): void {
    this._clickedEvent = event;
    this.clickedEventSource.next(this._clickedEvent);
  }

  // Updates the current hovered event by number
  updateHoveredEvent(event: GeoJson): void {
    this._hoveredEvent = event;
    this.hoveredEventSource.next(this._hoveredEvent);
  }

  // Updates the current expanded event by number
  updateExpandedEvent(event: GeoJson): void {
    this._expandedEvent = event;
    this.expandedEventSource.next(this._expandedEvent);
  }

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

  getEventById(id: string): GeoJson {
    var event = this._events.features.find((e: GeoJson) => e.id == id);
    if(event == null){ event = this._weekEvents.features.find((e: GeoJson) => e.id == id); }
    return event;
  }

  isToday(): boolean {
    return this.dateService.isToday(this._date);
  }

}
