import { Injectable, EventEmitter, Output } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router, RouterLinkActive, ActivatedRoute } from '@angular/router';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { FeatureCollection, GeoJson } from '../map';
import { CalendarViewState } from '../calendar-view-enum';
import * as moment from 'moment';


@Injectable()
export class ViewService {
  // VIEW VARIABLES
  private _currentView;               // stores either 'three-day' month' 'week' or 'map'
  private _lastCalendarView;          // stores either 'three-day' month' or 'week'

  // SOURCES
  private currentViewSource: Subject <string>; currentView$;

  // Constructor
  constructor(private router: Router, private http: HttpClient) {
    // Subscribe to current view
    this.currentViewSource = new Subject <string> ();
    this.currentView$ = this.currentViewSource.asObservable();
    this.currentView$.subscribe(view => {
      this._currentView = view;
      console.log(view);
    });
    // Determine current view settings
    this.determineView();
    // Starts with month
    this.storeLastView('month');
  }

  // CHANGE DATE SPAN (dates displayed on screen) //

  // emit when transitioning to 3 day
  @Output() changeToThreeDay: EventEmitter<Number> = new EventEmitter();
  // emit when transitioning within week or month to week
  @Output() changeToWeek: EventEmitter<Number> = new EventEmitter();
  // emit when transitioning within month or week to month
  @Output() changeToMonth: EventEmitter<Number> = new EventEmitter();

  // call whenever date span should be changed
  changeDateSpan(delta : Number, calendarView : CalendarViewState) {
    switch (calendarView) {
      case CalendarViewState.day:
        // For when we implement one day view
        console.log("change day span, calendarView = day");
        break;
      case CalendarViewState.threeday:
        this.changeToThreeDay.emit(delta);
        this.currentViewSource.next('three-day');
        this.storeLastView('three-day');
        break;
      case CalendarViewState.week:
        this.changeToWeek.emit(delta);
        this.currentViewSource.next('week');
        this.storeLastView('week');
        break;
      case CalendarViewState.month:
        this.changeToMonth.emit(delta);
        this.currentViewSource.next('month');
        this.storeLastView('month');
        break;
    }
  }

  // VIEW CHECKERS //

  determineView() {
    if(this.router.url.startsWith("/map")){
      this.currentViewSource.next('map');
    } else if(this.router.url.startsWith("/calendar/month")) {
      this.currentViewSource.next('month');
      this.storeLastView('month');
    } else if(this.router.url.startsWith("/calendar/week")) {
      this.currentViewSource.next('week');
      this.storeLastView('week');
    } else if(this.router.url.startsWith("/calendar/three-day")) {
      this.currentViewSource.next('three-day');
      this.storeLastView('three-day');
    }
  }

  isMapView() { return this._currentView == 'map' }
  isCalendarView() { return this.isMonthView() || this.isWeekView() || this.isThreeDayView() }
  isMonthView() { return this._currentView == 'month' }
  isWeekView() { return this._currentView == 'week' }
  isThreeDayView() { return this._currentView == 'three-day' }

  // currently displayed view
  getCurrentView() { return this._currentView; }
  setCurrentView(view: string) { this.currentViewSource.next(view); }
  // store the most recents view
  storeLastView(view: string){ this._lastCalendarView = view; }
  retrieveLastView(){ return this._lastCalendarView; }

}
