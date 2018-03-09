import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { FeatureCollection } from './map';
import { SelectedDate } from './selectedDate'

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
  private currDateSource: BehaviorSubject<SelectedDate>;

  // Used by any component for live access to current date and events
  currEvents$;
  filteredCurrEvents$;
  currDate$;

  // Used internally to keep an updated FeatureCollection of events
  private _events;

  private baseUrl = "http://www.whatsmappening.io/api/v1";

  constructor(private http: HttpClient, private dateService: DateService) {
    let today = new Date();
    let todayDate: SelectedDate = {
      day: today.getDate(),
      month: today.getMonth()+1,
      year: today.getFullYear()
    }

    this.currEventsSource = new BehaviorSubject<FeatureCollection>(new FeatureCollection([]));
    this.filteredCurrEventsSource = new BehaviorSubject<FeatureCollection>(new FeatureCollection([]));
    this.currDateSource = new BehaviorSubject<SelectedDate>(todayDate);

    this.currEvents$ = this.currEventsSource.asObservable();
    this.filteredCurrEvents$ = this.filteredCurrEventsSource.asObservable();
    this.currDate$ = this.currDateSource.asObservable();


    this.currEvents$.subscribe(eventCollection => {
      this._events = eventCollection;
    });

    this.updateEvents(todayDate);
  }

  private getEventsOnDateURL(d: number, m: number, y: number): string {
    const monthName = this.dateService.getMonthNameFromMonthNumber(m);
    let dateURL = `${this.baseUrl}/event-date/${d}%20${monthName}%20${y}`;
    return dateURL; // json we are pulling from for event info
  }

  updateEvents(date: SelectedDate): void {
    console.log("UPDATING EVENTS");
    this.currDateSource.next(date);
    this.http.get<FeatureCollection>(
      this.getEventsOnDateURL(date.day, date.month, date.year)
    ).subscribe(events => {
      this.currEventsSource.next(events);
      this.filteredCurrEventsSource.next(events);
      // (below code was in sidebar.component)
      // for (var event of this.events) {
      //     this._dateService.formatDateItem(event);
      // }
    });
  }

  updateTomorrow(): void {
    // TODO: calls updateEvents for current date + 1
  }

  updateYesterday(): void {
    // TODO: calls updateEvents for current date - 1
  }

  filterEvents(category: string): void {
    console.log("FILTERING EVENTS");
    if (category === "all") {
      this.filteredCurrEventsSource.next(this._events);
      return;
    }
    let tempEvents = new FeatureCollection(this._events.features
      .filter(e => e.properties.category.toLowerCase() === category.toLowerCase()));
    this.filteredCurrEventsSource.next(tempEvents);
  }
}
