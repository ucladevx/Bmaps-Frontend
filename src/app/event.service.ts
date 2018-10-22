import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import {Subject} from 'rxjs/Subject';
import { FeatureCollection, GeoJson } from './map';

import { HttpClient, HttpHeaders } from '@angular/common/http';
import { DateService } from './shared/date.service';
import { LocationService } from './shared/location.service';
import { CategoryService } from './category.service';
import { CategoryList } from './category';

@Injectable()
export class EventService {
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
  // holds object of categories
  private categHashSource: Subject <any> ;
  // holds object of filters
  private filterHashSource: Subject <any> ;

  // Observables that components can subscribe to for realtime updates
  currEvents$;
  filteredCurrEvents$;
  currDate$;
  clickedEvent$;
  hoveredEvent$;
  categHash$;
  filterHash$;

  // Used internally to keep a realtime, subscribed set of values
  private _events;
  private _date;
  private _clickedEvent;
  private _hoveredEvent;
  private _categHash;
  private _filterHash;

  private _selectedFilterCount = 0;
  private _selectedCategCount = 0;
  private _filterGroups = [
    ['happening now', 'upcoming'],
    ['morning', 'afternoon', 'evening'],
    ['on-campus', 'off-campus', 'nearby']
  ];
  private _filterGroupMap = {
    'happening now': 0,
    'upcoming': 0,
    'on-campus': 2,
    'off-campus': 2,
    'nearby': 2,
    'morning': 1,
    'afternoon': 1,
    'evening': 1
  };

  // private baseUrl = "https://www.mappening.io/api/v1/events";
  private baseUrl = "https://www.mappening.io/api/v2/events"
  // private baseUrl = "http://0.0.0.0:5000/api/v2/events"

  constructor(private http: HttpClient, private dateService: DateService, private locationService: LocationService, private categService: CategoryService) {
    let today = new Date();

    // Observable string sources, BehaviorSubjects have an intial state
    this.currEventsSource = new BehaviorSubject < FeatureCollection > (new FeatureCollection([]));
    this.filteredCurrEventsSource = new BehaviorSubject < FeatureCollection > (new FeatureCollection([]));
    this.currDateSource = new BehaviorSubject < Date > (today);
    this.clickedEventSource = new Subject < GeoJson > ();
    this.hoveredEventSource = new Subject < GeoJson > ();
    this.categHashSource = new Subject < any > ();
    this.filterHashSource = new Subject <any>();

    // Observable string streams
    this.currEvents$ = this.currEventsSource.asObservable();
    this.filteredCurrEvents$ = this.filteredCurrEventsSource.asObservable();
    this.currDate$ = this.currDateSource.asObservable();
    this.clickedEvent$ = this.clickedEventSource.asObservable();
    this.hoveredEvent$ = this.hoveredEventSource.asObservable();
    this.categHash$ = this.categHashSource.asObservable();
    this.filterHash$ = this.filterHashSource.asObservable();

    // Maintain a set of self-subscribed local values
    this.currEvents$.subscribe(eventCollection => this._events = eventCollection);
    this.currDate$.subscribe(date => this._date = date);
    this.clickedEvent$.subscribe(clickedEventInfo => this._clickedEvent = clickedEventInfo);
    this.hoveredEvent$.subscribe(hoveredEventInfo => this._hoveredEvent = hoveredEventInfo);
    this.categHash$.subscribe(categHash => this._categHash = categHash);
    this.filterHash$.subscribe(filterHash => this._filterHash = filterHash);

    // Update events for today
    this.updateEvents(today);
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
      'evening': false
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
    console.log(dateURL);
    return dateURL; // json we are pulling from for event info
  }

  // Updates events for given date while persisting the current category
  updateEvents(date: Date): void {
    console.log("UPDATING EVENTS");
    this.currDateSource.next(date);
    this.http.get <FeatureCollection> (
      this.getEventsOnDateURL(date)
    ).subscribe(events => {
      console.log(events);
      this.currEventsSource.next(events);

      // Update list of categories and reset filters
      this._selectedFilterCount = 0;
      this._selectedCategCount = 0;
      this.updateCategories();
      this.resetFilters();
      this.applyFiltersAndCategories();
    });
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
        for (let filter in this._filterHash) {
          if (this._filterHash[filter] && !this.checkFilter(filter, event)) {
            passesAllFilters = false;
          }
        }
        if (passesAllFilters) {
          tempEvents2.features.push(event);
        }
      }
    }

    this.filteredCurrEventsSource.next(tempEvents2);
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
    return true;
  }

  // Updates the current clicked event by number
  updateClickedEvent(event: GeoJson): void {
    this._clickedEvent = event;
    this.clickedEventSource.next(this._clickedEvent);
    console.log("updating clicked event");
    console.log(this._clickedEvent);
  }

  // Updates the current hovered event by number
  updateHoveredEvent(event: GeoJson): void {
    this._hoveredEvent = event;
    this.hoveredEventSource.next(this._hoveredEvent);
  }

  getEventById(id: string): GeoJson {
    return this._events.features.find((e: GeoJson) => e.id == id);
  }
}
