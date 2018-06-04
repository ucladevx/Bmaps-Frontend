import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import {Subject} from 'rxjs/Subject';
import { FeatureCollection, GeoJson } from './map';

import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs/Rx';
import { DateService } from './shared/date.service';
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

  // Observables that components can subscribe to for realtime updates
  currEvents$;
  filteredCurrEvents$;
  currDate$;
  clickedEvent$;
  hoveredEvent$;
  categHash$;

  // Used internally to keep a realtime, subscribed set of values
  private _events;
  private _date;
  private _clickedEvent;
  private _hoveredEvent;
  private _category = "all";
  private _filters = {
    'happening now': false,
    'upcoming': false,
    'on-campus': false,
    'off-campus': false,
    'nearby': false,
    'free food': false
  };
  private _categHash;
  private _selectedFilterCount = 0;
  private _selectedCategCount = 0;

  // private baseUrl = "https://www.mappening.io/api/v1/events";
  private baseUrl = "https://www.mappening.io/api/v2/events"
  // private baseUrl = "http://0.0.0.0:5000/api/v2/events"

  constructor(private http: HttpClient, private dateService: DateService, private categService: CategoryService) {
    let today = new Date();

    // Observable string sources, BehaviorSubjects have an intial state
    this.currEventsSource = new BehaviorSubject < FeatureCollection > (new FeatureCollection([]));
    this.filteredCurrEventsSource = new BehaviorSubject < FeatureCollection > (new FeatureCollection([]));
    this.currDateSource = new BehaviorSubject < Date > (today);
    this.clickedEventSource = new Subject < GeoJson > ();
    this.hoveredEventSource = new Subject < GeoJson > ();
    this.categHashSource = new Subject < any > ();

    // Observable string streams
    this.currEvents$ = this.currEventsSource.asObservable();
    this.filteredCurrEvents$ = this.filteredCurrEventsSource.asObservable();
    this.currDate$ = this.currDateSource.asObservable();
    this.clickedEvent$ = this.clickedEventSource.asObservable();
    this.hoveredEvent$ = this.hoveredEventSource.asObservable();
    this.categHash$ = this.categHashSource.asObservable();

    // Maintain a set of self-subscribed local values
    this.currEvents$.subscribe(eventCollection => this._events = eventCollection);
    this.currDate$.subscribe(date => this._date = date);
    this.clickedEvent$.subscribe(clickedEventInfo => this._clickedEvent = clickedEventInfo);
    this.hoveredEvent$.subscribe(hoveredEventInfo => this._hoveredEvent = hoveredEventInfo);
    this.categHash$.subscribe(categHash => this._categHash = categHash);

    // Update events for today
    this.updateEvents(today);
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
        this.applyFiltersAndCategories();
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
    });
  }

  // Calls updateEvents for the current date + days
  updateDateByDays(days: number) {
    let newDate = this._date;
    newDate.setDate(newDate.getDate() + days);
    this.updateEvents(newDate);
  }

  // Filters current events given category name (OLD CODE)
  // filterEvents(category: string): void {
  //   console.log("FILTERING EVENTS");
  //   this._category = category;
  //   if (category === "all") {
  //     this.filteredCurrEventsSource.next(this._events);
  //     return;
  //   }
  //   let tempEvents = new FeatureCollection(this._events.features
  //     .filter(e => e.properties.category.toLowerCase() === category.toLowerCase()));
  //   this.filteredCurrEventsSource.next(tempEvents);
  // }

  // Toggle filter
  toggleFilter(filter: string) {
    if (this._filters[filter] != undefined) {
      this._filters[filter] = !this._filters[filter];
      if (this._filters[filter]) {
        this._selectedFilterCount++;
      }
      else {
        this._selectedFilterCount--;
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

  // Apply current _filters
  // private applyFilters() {
  //   console.log("APPLYING FILTERS");
  //   console.log(this._filters);
  //   let tempEvents = new FeatureCollection([]);
  //   for (let event of this._events.features) {
  //     if (this._filters['happening now'] && this.dateService.isHappeningNow(event.start_time)) {
  //       tempEvents.features.push(event);
  //     }
  //   }
  //   this.filteredCurrEventsSource.next(tempEvents);
  // }

  // Appy current _categHash
  // private applyCategories() {
  //   console.log("APPLYING CATEGORIES");
  //
  //   // If no categories are selected, show all events and return
  //   if (this._selectedCategCount == 0) {
  //     this.filteredCurrEventsSource.next(this._events);
  //     return;
  //   }
  //
  //   let tempEvents = new FeatureCollection([]);
  //   for (let event of this._events.features) {
  //     for (let category of event.properties.categories) {
  //       let categObject = this._categHash[category.toLowerCase()];
  //       if (categObject && categObject.selected) {
  //         tempEvents.features.push(event);
  //         break;
  //       }
  //     }
  //   }
  //   this.filteredCurrEventsSource.next(tempEvents);
  // }

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
        for (let filter in this._filters) {
          if (this._filters[filter] && this.checkFilter(filter, event)) {
            tempEvents2.features.push(event);
            break;
          }
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
    return false;
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
    console.log("updating hovered event");
    console.log(this._hoveredEvent);
  }
}
