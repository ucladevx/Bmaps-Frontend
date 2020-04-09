import { Component, OnInit } from '@angular/core';
import { Router, RouterLinkActive, ActivatedRoute } from '@angular/router';
import { ContentChild } from '@angular/core';
import { MonthComponent } from '../month/month.component';
import { WeekComponent } from '../week/week.component';
import { ThreeDayComponent } from '../three-day/three-day.component';
import { ViewService } from '../services/view.service';
import { EventService } from '../services/event.service';
import * as moment from 'moment';
import { Moment } from 'moment';
import { CalendarViewState } from '../calendar-view-enum';

@Component({
  selector: 'app-calendar-container',
  templateUrl: './calendar-container.component.html',
  styleUrls: ['./calendar-container.component.scss'],
  providers: [WeekComponent, MonthComponent, ThreeDayComponent]
})

export class CalendarContainerComponent implements OnInit {
  public CalendarViewState = CalendarViewState;

  public viewDate: string;
  currentPath = '';

  @ContentChild(MonthComponent, /* TODO: add static flag */ {})
  private monthComponent: MonthComponent;

  @ContentChild(WeekComponent, /* TODO: add static flag */ {})
  private weekComponent: WeekComponent;

  @ContentChild(ThreeDayComponent)
  private threeDayComponent: ThreeDayComponent;

  // week number
  weekNumber: string;
  // retrieved from UCLA online academic calendar
  zeroWeeks: Moment[] = [
    //2018-2019
    moment([2018,8,23]), moment([2019,0,6]), moment([2019,2,30]),
    //2019-2020
    moment([2019,8,22]), moment([2020,0,5]), moment([2020,2,29]),
    //2020-2021
    moment([2020,8,27]), moment([2021,0,4]), moment([2021,2,29]),
    //2021-2022
    moment([2021,8,19]), moment([2022,0,2]), moment([2022,2,28]),
    //2022-2023
    moment([2022,8,19]), moment([2023,0,9]), moment([2023,3,2])
  ];

  constructor(public router: Router, private _eventService: EventService, private _viewService: ViewService, route: ActivatedRoute) {
    this.currentPath = route.snapshot.url.join('');
  }

  ngOnInit() {
    this._eventService.currentDate$.subscribe( date => { this.viewDateChange(date); });
    this.enumerateWeek(CalendarViewState.week);
  }

  viewDateChange(set : Date) {
    this.viewDate = set.toLocaleDateString("en-US", {month: 'long', year: 'numeric'});
  }

  changeDateSpan(delta: number, calendarView: CalendarViewState) : void{
    this._viewService.changeDateSpan(delta, calendarView);
    this.enumerateWeek(calendarView);
  }

  getCalendarView(): CalendarViewState {
    if (this.router.url.startsWith('/calendar/day'))
      return CalendarViewState.day;
    else if (this.router.url.startsWith('/calendar/three-day'))
      return CalendarViewState.threeday;
    else if (this.router.url.startsWith('/calendar/week'))
      return CalendarViewState.week;
    else if (this.router.url.startsWith('/calendar/month'))
      return CalendarViewState.month;

    console.log("getCalendarView() called not in Calendar View?");
  }

  //set the week number
  enumerateWeek(view: CalendarViewState){
    //count weeks
    let weekCount;
    let secondWeekCount;
    let currentDate = moment(this._eventService.getCurrentDate());

    // for three day view
    let firstDate = currentDate;
    let lastDate;

    if (view == CalendarViewState.threeday) {
      let numDaysDiff = currentDate.startOf('day').diff(moment().startOf('day'), 'days');
      // 0 means first day of group, 1 - second, 2 - third
      let dayOfGroup;
      if (numDaysDiff >= 0) {
        dayOfGroup = (numDaysDiff % 3 == 0) ? 0 : ((numDaysDiff % 3 == 1) ? 1 : 2);
      }
      else {
        numDaysDiff *= -1;
        dayOfGroup = (numDaysDiff % 3 == 0) ? 0 : ((numDaysDiff % 3 == 1) ? 2 : 1);
      }
      firstDate = currentDate.clone().add(-1*dayOfGroup, 'days');
    }
    lastDate = firstDate.clone().add(2, 'days');

    //iterate backwards through zeroWeeks array to find the first positive week
    for(let i = this.zeroWeeks.length-1; i>=0; i--){
      //determine week count
      weekCount = Math.floor(firstDate.diff(this.zeroWeeks[i],'days') / 7);
      secondWeekCount = Math.floor(lastDate.diff(this.zeroWeeks[i],'days') / 7);
      //handle zero week
      if(weekCount>=0){ if(i%3 != 0){ weekCount++; } i = -1; }
      if(secondWeekCount>=0){ if(i%3 != 0){ secondWeekCount++; } i = -1; }
    }
    // Week 11 -> Finals Week
    if(weekCount == 11)
      this.weekNumber = "Finals week";
    // Week 12+ or Week 0- -> Break
    else if(weekCount > 11 || weekCount < 0 || weekCount == undefined) {
      this.weekNumber = "";
      if (view == CalendarViewState.threeday) {
        if(!(secondWeekCount > 11 || secondWeekCount < 0 || secondWeekCount == undefined)) {
          this.weekNumber = "Week " + secondWeekCount;
        }
      }

    }
    // Week 0-12 -> Within Quarter
    else {
      this.weekNumber = "Week " + weekCount;
      if (view == CalendarViewState.threeday)
        if(!(secondWeekCount > 11 || secondWeekCount < 0 || secondWeekCount == undefined))
          if (secondWeekCount != weekCount)
            this.weekNumber = this.weekNumber + "-" + secondWeekCount;
    }
  }

}
