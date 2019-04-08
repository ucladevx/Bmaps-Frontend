import { Injectable, Output } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { EventEmitter } from '@angular/core';
import { Router, RouterLinkActive, ActivatedRoute } from '@angular/router';
import { EventService } from './event.service';
import { GeoJson } from './map';

interface CalendarDay {
  dayOfMonth: number;
  inCurrentMonth: boolean;
  month: number;
  year: number;
  events: GeoJson[];
  selected: boolean;
}

@Injectable({providedIn: 'root'})
export class CalendarService {

  dateSpanSource: Subject <any>;
  dateSpan$;

  constructor(private router: Router, private eventService: EventService) {
    this.dateSpanSource = new Subject < any > ();
    this.dateSpan$ = this.dateSpanSource.asObservable();

    this.eventService.currDate$.subscribe( date => {
        this.viewDate = date;
        this.viewDateChange.emit(date);
    });

  }

  delta : Number = 0;

  viewDate : Date;
  selectedDay: CalendarDay;
  days: CalendarDay[] = [];

  currentView = "month";

  @Output() change: EventEmitter<Number> = new EventEmitter();
  @Output() selectedDayChange: EventEmitter<CalendarDay> = new EventEmitter();
  @Output() viewDateChange: EventEmitter<Date> = new EventEmitter();

  changeDateSpan(delta : Number) {
    let span = {};
    this.dateSpanSource.next(span);
    this.delta = delta;
    this.change.emit(this.delta);
    this.delta = 0;
    this.selectedDay = this.days[0];
  }

  getViewDate() {
    return this.viewDate;
  }

  setViewDate(set : Date, fromNgOnInit : boolean = false) {
    if (this.viewDate == undefined && fromNgOnInit) {
      this.viewDate = set;
    }
    if (!fromNgOnInit) {
      this.viewDate = set;
    }
    this.viewDateChange.emit(set);
  }

  getSelectedDay() {
    return this.selectedDay;
  }

  setSelectedDay(day: CalendarDay) {
    this.selectedDay = day;
    this.selectedDayChange.emit(day);
  }

  setDays(calendarDays: CalendarDay[]){
    this.days = calendarDays;
  }

  increaseDay(days: number){
    var currIndex = this.days.indexOf(this.selectedDay);
    currIndex += days;
    if(this.selectedDay.dayOfMonth == this.eventService.getSelectedDay().getDate()){
      if(currIndex < this.days.length && currIndex > -1){
        this.setSelectedDay(this.days[currIndex]);
        console.log(this.selectedDay);
      }
    }
  }

  isMonthView() {
    return this.router.url.startsWith("/calendar/month");
  }

  isWeekView() {
    return this.router.url.startsWith("/calendar/week");
  }

}
