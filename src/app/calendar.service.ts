import { Injectable, Output } from '@angular/core';
import * as moment from 'moment';
import { Moment } from 'moment';
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

  // date change
  delta : Number = 0;

  // day variables
  viewDate : Date;
  selectedDay: CalendarDay;
  days: CalendarDay[] = [];

  // week number
  weekNumber: string;
  // retrieved from UCLA online academic calendar
  zeroWeeks: Moment[] = [
    //2018-2019
    moment([2018,8,23]),
    moment([2019,0,6]),
    moment([2019,2,30]),
    //2019-2020
    moment([2019,8,22]),
    moment([2020,0,5]),
    moment([2020,2,29]),
    //2020-2021
    moment([2020,8,27]),
    moment([2021,0,4]),
    moment([2021,2,29]),
    //2021-2022
    moment([2021,8,19]),
    moment([2022,0,2]),
    moment([2022,2,28]),
    //2022-2023
    moment([2022,8,19]),
    moment([2023,0,9]),
    moment([2023,3,2])
  ];

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
    if (this.viewDate == undefined && fromNgOnInit)
      this.viewDate = set;
    if (!fromNgOnInit)
      this.viewDate = set;
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

  //set the week number
  enumerateWeek(){
    //count weeks
    var weekCount;
    //iterate backwards through zeroWeeks array to find the first positive week
    for(var i = this.zeroWeeks.length-1; i>=0; i--){
      //determine week count
      weekCount = Math.floor(moment(this.getViewDate()).diff(this.zeroWeeks[i],'days') / 7);
      //handle zero week
      if(weekCount>=0){ if(i%3 != 0){ weekCount++; } i = -1; }
    }
    // Week 11 -> Finals Week
    if(weekCount == 11){
      this.weekNumber = "Finals Week";
    }
    // Week 12+ or Week 0- -> Break
    else if(weekCount > 11 || weekCount < 0 || weekCount == undefined){
      this.weekNumber = "";
    }
    // Week 0-12 -> Within Quarter
    else {
      this.weekNumber = "Week " + weekCount;
    }
  }

  public getWeekNumber(){
    return this.weekNumber;
  }

}
