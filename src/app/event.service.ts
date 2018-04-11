import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { FeatureCollection, GeoJson } from './map';

import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs/Rx';
import { DateService } from './shared/date.service';

@Injectable()
export class EventService {
  // holds all events of the current date that components can see
  private currEventsSource: BehaviorSubject<FeatureCollection>;
  // holds filtered events that components can see
  private filteredCurrEventsSource: BehaviorSubject<FeatureCollection>;
  // holds the current date that components can see
  private currDateSource: BehaviorSubject<Date>;
  // holds current event
  private selectedEventSource: BehaviorSubject<GeoJson>;

  // Observables that components can subscribe to for realtime updates
  currEvents$;
  filteredCurrEvents$;
  currDate$;
  selectedEvent$;

  // Used internally to keep a realtime, subscribed set of values
  private _events;
  private _date;
  private _selectedEvent;
  private _category = "all";

  private baseUrl = "http://www.whatsmappening.io/api/v1";

  constructor(private http: HttpClient, private dateService: DateService) {
    let today = new Date();

    // Observable string sources
    this.currEventsSource = new BehaviorSubject<FeatureCollection>(new FeatureCollection([]));
    this.filteredCurrEventsSource = new BehaviorSubject<FeatureCollection>(new FeatureCollection([]));
    this.currDateSource = new BehaviorSubject<Date>(today);
    this.selectedEventSource = new BehaviorSubject<GeoJson>(new GeoJson([]));

    //Observable string streams
    this.currEvents$ = this.currEventsSource.asObservable();
    this.filteredCurrEvents$ = this.filteredCurrEventsSource.asObservable();
    this.currDate$ = this.currDateSource.asObservable();
    this.selectedEvent$ = this.selectedEventSource.asObservable();

    this.currEvents$.subscribe(eventCollection => this._events = eventCollection);
    this.currDate$.subscribe(date => this._date = date);
    this.selectedEvent$.subscribe(selectedEventInfo => this._selectedEvent = selectedEventInfo);

    this.updateEvents(today);
  }

  private getEventsOnDateURL(d: number, m: number, y: number): string {
    const monthName = this.dateService.getMonthNameFromMonthNumber(m);
    let dateURL = `${this.baseUrl}/event-date/${d}%20${monthName}%20${y}`;
    return dateURL; // json we are pulling from for event info
  }

  // Updates events for given date while persisting the current category
  updateEvents(date: Date): void {
    console.log("UPDATING EVENTS");
    this.currDateSource.next(date);
    this.http.get<FeatureCollection>(
      this.getEventsOnDateURL(date.getDate(), date.getMonth(), date.getFullYear())
    ).subscribe(events => {
      this.currEventsSource.next(events);
      this.filterEvents(this._category);
    });
  }

  // Calls updateEvents for the current date + days
  updateDateByDays(days: number) {
    let newDate = this._date;
    newDate.setDate(newDate.getDate() + days);
    this.updateEvents(newDate);
  }

  // Filters current events given category name
  filterEvents(category: string): void {
    console.log("FILTERING EVENTS");
    this._category = category;
    if (category === "all") {
      this.filteredCurrEventsSource.next(this._events);
      return;
    }
    let tempEvents = new FeatureCollection(this._events.features
      .filter(e => e.properties.category.toLowerCase() === category.toLowerCase()));
    this.filteredCurrEventsSource.next(tempEvents);
  }

  // Updates the current event by number
  updateSelectedEvent(event: GeoJson): void {
    console.log("UPDATING SELECTED EVENT");
    console.log("current event:");
    console.log(this._selectedEvent);
    console.log("input event: ");
    console.log(event);
    this._selectedEvent = event;
    console.log("output event:");
    console.log(this._selectedEvent);
    this.selectedEventSource.next(this._selectedEvent);
    }
}
