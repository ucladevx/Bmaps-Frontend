import { Component, OnInit } from '@angular/core';
import { Router, RouterLinkActive, ActivatedRoute } from '@angular/router';
import { ContentChild } from '@angular/core';
import { MonthComponent } from '../month/month.component';
import { WeekComponent } from '../week/week.component';
import { ThreeDayComponent } from '../three-day/three-day.component';
import { EventService } from '../services/event.service';
import { DateService } from '../services/date.service';
import { ViewState } from '../view-enum';
import * as moment from 'moment';
import { Moment } from 'moment';

@Component({
  selector: 'app-calendar-container',
  templateUrl: './calendar-container.component.html',
  styleUrls: ['./calendar-container.component.scss'],
  providers: [WeekComponent, MonthComponent, ThreeDayComponent]
})

export class CalendarContainerComponent implements OnInit {
  public ViewState = ViewState;

  @ContentChild(MonthComponent, {})
  private monthComponent: MonthComponent;

  @ContentChild(WeekComponent, {})
  private weekComponent: WeekComponent;

  @ContentChild(ThreeDayComponent, {})
  private threeDayComponent: ThreeDayComponent;

  // current date
  viewDate: string;
  // current view
  currentView = ViewState.month;
  // week number
  weekNumber: string;

  // Hard-coded from UCLA online academic calendar
  zeroWeeks: Moment[] = [
    moment([2019,8,22]), moment([2020,0,5]), moment([2020,2,29]), //2019-2020
    moment([2020,8,27]), moment([2021,0,4]), moment([2021,2,29]), //2020-2021
    moment([2021,8,19]), moment([2022,0,2]), moment([2022,2,28]), //2021-2022
    moment([2022,8,19]), moment([2023,0,9]), moment([2023,3,2])   //2022-2023
  ];

  constructor(public router: Router, private _eventService: EventService, private _dateService: DateService, route: ActivatedRoute) { }

  ngOnInit() {

    // whenever the current date changes, update view and week number
    this._eventService.selectedDate$.subscribe( date => {
      this.viewDateChange(date);
      this.enumerateWeek(this._eventService.getCurrentView())
    });

    // whenever the current view changes, update local variable
    this._eventService.currentView$.subscribe( view => {
      this.currentView = view;
    });

    // whenever the visible days changes, maintain sidebar event
    this._eventService.visibleDays$.subscribe( days => {
      let selectedEvent = this._eventService.getSidebarEvent();
      if(selectedEvent){
        let eventDate = selectedEvent.properties.start_time;
        if(!this._dateService.isBetween(eventDate, days[0].date, days[days.length-1].date)){
          this._eventService.resetEventSelection();
          this.router.navigate( ['', {outlets: {sidebar: ['list']}}]);
      }}
    });

    // initialize week enumeration
    if(this._eventService.isWeekView()) {
      this.currentView = ViewState.week;
      this.enumerateWeek(ViewState.week);
    }

    // initialize week enumeration
    if(this._eventService.isThreeDayView()) {
      this.currentView = ViewState.threeday;
      this.enumerateWeek(ViewState.threeday);
    }

  }

  // update the currently displayed date
  viewDateChange(set : Date) {
    this.viewDate = set.toLocaleDateString("en-US", {month: 'long', year: 'numeric'});
  }

  // change date span based on calendar controls
  changeDateSpan(delta: number, calendarView: ViewState) : void{
    // determine date to display in new view
    let newDate = this._eventService.getSelectedDate();
    switch(calendarView) {
      // change to month view
      case ViewState.month :
        newDate = moment(newDate).startOf('month').add(delta,'M').toDate();
        if(this._dateService.inSameMonth(newDate, this._eventService.getSelectedDate()))
          newDate = this._eventService.getSelectedDate();
        else if(this._dateService.inSameMonth(newDate, new Date()))
          newDate = new Date();
        break;
      // change to week view
      case ViewState.week :
        newDate = moment(newDate).startOf('week').add(delta*7,'d').toDate();
        if(this._dateService.inSameWeek(newDate, this._eventService.getSelectedDate()))
          newDate = this._eventService.getSelectedDate();
        else if(this._dateService.inSameWeek(newDate, new Date()))
          newDate = new Date();
        break;
      // change to three day view
      case ViewState.threeday :
        newDate = moment(newDate).startOf('day').add(delta*3,'d');
        if(this._dateService.inSameThreeDay(newDate, this._eventService.getSelectedDate()))
          newDate = this._eventService.getSelectedDate();
        break;
    }
    // update date span and week number
    this._eventService.changeDateSpan(newDate, calendarView);
    this.enumerateWeek(calendarView);
  }

  // calculate the week number
  enumerateWeek(view: ViewState){
    let firstDate = moment(this._eventService.getSelectedDate());
    let lastDate = moment(this._eventService.getSelectedDate());
    let weekCount, secondWeekCount;
    if (view == ViewState.threeday) {
      let bounds = this._dateService.getViewBounds(firstDate,view);
      firstDate = bounds[0]; lastDate = bounds[1];
    }
    for(let i = this.zeroWeeks.length-1; i>=0; i--){
      weekCount = Math.floor(firstDate.diff(this.zeroWeeks[i],'days') / 7);
      secondWeekCount = Math.floor(lastDate.diff(this.zeroWeeks[i],'days') / 7);
      if(weekCount>=0){ if(i%3 != 0){ weekCount++; } i = -1; }
      if(secondWeekCount>=0){ if(i%3 != 0){ secondWeekCount++; } i = -1; }
    }
    if(weekCount == 11) {
      this.weekNumber = "Finals week";
    } else if(weekCount > 11 || weekCount < 0 || weekCount == undefined) {
      if (view == ViewState.threeday && !(secondWeekCount > 11 || secondWeekCount < 0 || secondWeekCount == undefined)) {
          this.weekNumber = "Week " + secondWeekCount;
    }} else {
      this.weekNumber = "Week " + weekCount;
      if (view == ViewState.threeday && !(secondWeekCount > 11 || secondWeekCount < 0 || secondWeekCount == undefined) && secondWeekCount != weekCount) {
        this.weekNumber = this.weekNumber + "-" + secondWeekCount;
      }
    }
  }

}
