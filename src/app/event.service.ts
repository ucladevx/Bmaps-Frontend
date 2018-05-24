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

  // private baseUrl = "https://www.mappening.io/api/v1/events";
  private baseUrl = "https://www.mappening.io/api/v2/events"

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
  private initCategories() {
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
          let categName = categ.category.toLowerCase();
          tempHash[categName] = {
            formattedCategory: categName.replace('_', ' '),
            numEvents: eventMap[categName],
            selected: this._categHash && this._categHash[categName] ? this._categHash[categName].selected : false
          }
        }
        this.categHashSource.next(tempHash);
        this.applyCategories();
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
      // this.filterEvents(this._category);

      // Update list of categories
      this.initCategories();
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
    }
    this.applyFilters();
  }

  // Toggle category
  toggleCategory(category: string) {
    if (this._categHash[category] != undefined) {
      this._categHash[category].selected = !this._categHash[category].selected;
    }
    this.applyCategories();
  }

  // Apply current _filters
  private applyFilters() {
    console.log("APPLYING FILTERS");
    let tempEvents = new FeatureCollection([]);
    for (let event in this._events.features) {
      if (this._filters['happening now']) {
        console.log('Filtering by happening now');
      }
    }
  }

  // Appy current _categHash
  private applyCategories() {
    console.log("APPLYING CATEGORIES");
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
