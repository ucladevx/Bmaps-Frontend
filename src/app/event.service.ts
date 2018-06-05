import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import {Subject} from 'rxjs/Subject';
import { FeatureCollection, GeoJson } from './map';

import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs/Rx';
import { DateService } from './shared/date.service';
import { CategoryService } from './category.service';
import { CategoryList } from './category';
import * as moment from 'moment';

@Injectable()
export class EventService {
  // holds all events
  private monthEventsSource: BehaviorSubject <FeatureCollection>;
  // holds all filtered events
  private filteredMonthEventsSource: BehaviorSubject <FeatureCollection>;
  // holds all events of the current date that components can see
  private currEventsSource: BehaviorSubject <FeatureCollection>;
  // holds filtered events that components can see
  private filteredCurrEventsSource: BehaviorSubject <FeatureCollection> ;
  // holds the current month and year in (MM YYYY) string format
  private currMonthYearSource: BehaviorSubject <string> ;
  // holds the current date that components can see
  private currDateSource: BehaviorSubject <Date> ;
  // holds clicked event
  private clickedEventSource: Subject <GeoJson> ;
  // holds hovered event
  private hoveredEventSource: Subject <GeoJson> ;
  // holds object of categories
  private categHashSource: Subject <any> ;

  // Observables that components can subscribe to for realtime updates
  monthEvents$;
  filteredMonthEvents$;
  currEvents$;
  filteredCurrEvents$;
  currMonthYear$;
  currDate$;
  clickedEvent$;
  hoveredEvent$;
  categHash$;

  // Used internally to keep a realtime, subscribed set of values
  private _allevents;
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

  private baseUrl = "https://www.mappening.io/api/v2/events"

  constructor(private http: HttpClient, private dateService: DateService, private categService: CategoryService) {
    let today = new Date();
    let monthyear = moment().month().toString() + " " + moment().year().toString();
    console.log(monthyear);

    // Observable string sources, BehaviorSubjects have an intial state
    this.monthEventsSource = new BehaviorSubject < FeatureCollection > (new FeatureCollection([]));
    this.filteredMonthEventsSource = new BehaviorSubject < FeatureCollection > (new FeatureCollection([]));
    this.currEventsSource = new BehaviorSubject < FeatureCollection > (new FeatureCollection([]));
    this.filteredCurrEventsSource = new BehaviorSubject < FeatureCollection > (new FeatureCollection([]));
    this.currDateSource = new BehaviorSubject < Date > (today);
    this.currMonthYearSource = new BehaviorSubject < string > (monthyear);
    this.clickedEventSource = new Subject < GeoJson > ();
    this.hoveredEventSource = new Subject < GeoJson > ();
    this.categHashSource = new Subject < any > ();

    // Observable string streams
    this.monthEvents$  = this.monthEventsSource.asObservable();
    this.filteredMonthEvents$  = this.filteredMonthEventsSource.asObservable();
    this.currEvents$ = this.currEventsSource.asObservable();
    this.filteredCurrEvents$ = this.filteredCurrEventsSource.asObservable();
    this.currDate$ = this.currDateSource.asObservable();
    this.currMonthYear$  = this.currMonthYearSource.asObservable();
    this.clickedEvent$ = this.clickedEventSource.asObservable();
    this.hoveredEvent$ = this.hoveredEventSource.asObservable();
    this.categHash$ = this.categHashSource.asObservable();

    // Maintain a set of self-subscribed local values
    this.monthEvents$.subscribe(monthEventCollection => this._allevents = monthEventCollection);
    this.currEvents$.subscribe(eventCollection => this._events = eventCollection);
    this.currDate$.subscribe(date => this._date = date);
    this.clickedEvent$.subscribe(clickedEventInfo => this._clickedEvent = clickedEventInfo);
    this.hoveredEvent$.subscribe(hoveredEventInfo => this._hoveredEvent = hoveredEventInfo);
    this.categHash$.subscribe(categHash => this._categHash = categHash);

    // Update events for today
    this.updateEvents(today);
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
      // Update list of categories
      this.initCategories('');
    });
  }

  private getEventsURL(): string {
    let allEventsURL = `${this.baseUrl}/`;
    console.log(allEventsURL);
    return allEventsURL; // json we are pulling from for event info
  }

  // Updates events for given date while persisting the current category
  updateMonthEvents(monthyear: string): void {
    console.log("UPDATING EVENTS");
    this.currMonthYearSource.next(monthyear);
    this.http.get <FeatureCollection> (
      this.getEventsURL()
    ).subscribe(monthyearEvents => {
      console.log(monthyearEvents);
      this.monthEventsSource.next(this.filterByMonthYear(monthyearEvents, monthyear));
      this.initCategories(monthyear);
    });
  }

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
    console.log(tempEvents);
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
    this.applyCategories(category);
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
  private applyCategories(monthyear: string) {
    console.log("APPLYING CATEGORIES");
    if (monthyear == ''){
      console.log("monthyear is nothing");
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
      console.log("monthyear is something");
      console.log(monthyear);
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
