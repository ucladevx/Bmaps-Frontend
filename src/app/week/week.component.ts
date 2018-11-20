import { Component, OnInit } from '@angular/core';
import * as moment from 'moment';
import { Moment } from 'moment';
import { EventService } from '../event.service';
import { GeoJson } from '../map';

interface CalendarDay {
  dayOfMonth: number;
  inCurrentMonth: boolean;
  month: number;
  year: number;
  events: GeoJson[];
}

@Component({
  selector: 'app-week',
  templateUrl: './week.component.html',
  styleUrls: ['./week.component.css']
})

export class WeekComponent implements OnInit {
  private days: CalendarDay[] = [];
  private selectedMonth: Number;
  private selectedYear: Number;
  private selectedDay: CalendarDay;
  private viewDate: Date ;
  private today: CalendarDay;
  private currentMonth: Moment;
  private currentWeek: Moment;
  private filteredEvents: GeoJson[];
  private clickedEvent: GeoJson;
  private eventsByDay: { [day: number ] : GeoJson[] } = {};
  private weekNumber: string;
  private zeroWeeks: Moment[] = [
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

  constructor(private eventService: EventService) { }

  ngOnInit() {
    //subscriptions
    this.eventService.filteredWeekEvents$.subscribe(weekEventCollection => {
      this.filteredEvents = weekEventCollection.features;
      this.showCalendar(this.viewDate);
    });
    this.eventService.clickedEvent$.subscribe(clickedEventInfo => {
        this.clickedEvent = clickedEventInfo;
    });
    //on startup
    this.selectedMonth = moment().month();
    this.selectedYear = moment().year();
    this.viewDate = new Date();
    //update view
    this.updateWeekView();
  }

  updateWeekView(){
    //update month events (subscribed to by ngOnInit)
    this.eventService.updateWeekEvents(this.viewDate);
  }

  enumerateWeek(){
    var weekCount;
    //iterate backwards to find the first positive week
    for(var i = this.zeroWeeks.length-1; i>=0; i--){
      weekCount = Math.floor(moment(this.viewDate).diff(this.zeroWeeks[i],'days') / 7);
      if(weekCount>=0){
        if(i%3 != 0){
          weekCount++;
        }
        i = -1;
      }
    }
    if(weekCount == 11){
      this.weekNumber = "Finals Week";
    }
    else if(weekCount > 11 || weekCount < 0 || weekCount == undefined){
      this.weekNumber = "";
    }
    else {
      this.weekNumber = "Week " + weekCount;
    }
  }

  showCalendar(dateInMonth: Moment | Date | string): void {
    //fill events by day for the week
    this.fillEventsByDay();
    //update week Number
    this.enumerateWeek();
    //set currentMonth and currentWeek
    this.currentMonth = moment(dateInMonth).startOf('month');
    this.currentWeek = moment(dateInMonth).startOf('week');
    // range of days shown on calendar
    let firstDay: Moment = moment(dateInMonth).startOf('week');
    let lastDay: Moment = moment(dateInMonth).endOf('week');
    if(parseInt(lastDay.format('DD')) > 3 && parseInt(lastDay.format('DD')) < 7){
      this.currentMonth.add(1,'month');
    }
    //fill days
    this.days = [];
    for (let d: Moment = firstDay.clone(); d.isBefore(lastDay); d.add(1, 'days')) {
      //create CalendarDay object
      let weekDay: CalendarDay = {
        dayOfMonth: d.date(),
        inCurrentMonth: d.isSame(this.currentMonth, 'month'),
        month: parseInt(d.format('M'))-1,
        year: parseInt(d.format('YYYY')),
        events: this.getEventsOnDate(d)
      };
      //determine whether it is the current day
      if (d == moment()){
        this.today = weekDay;
      }
      //add weekDay to display days array
      this.days.push(weekDay);
      // set selected day to the date provided
      if (d.isSame(dateInMonth, 'day')) {
        this.selectedDay = weekDay;
        this.onSelect(weekDay);
      }
    }
  }

  changeWeek(delta: number): void {
    // 1 means advance one week, -1 means go back one week
    let newWeek: Moment = this.currentWeek.clone().add(delta, 'week');
    //update selectedMonth and selectedYear
    this.selectedMonth = newWeek.month();
    this.selectedYear = newWeek.year();
    // if current week, make selected day today
    if (newWeek.isSame(moment(), 'week')) {
      //update view date
      this.viewDate = new Date();
      //update view
      this.updateWeekView();
    }
    // make selected day the 1st of the week
    else {
      //update view date
      this.viewDate = newWeek.startOf('week').toDate();
      //update view
      this.updateWeekView();
    }
  }

  fillEventsByDay(){
    //clear events by day for the week
    this.eventsByDay = [];
    //iterate through filteredEvents for the current month
    this.filteredEvents.forEach(el => {
      //determine dayOfYear
      let eventDate = moment(el.properties.start_time);
      let dayOfYear = eventDate.dayOfYear();
      //if the dayOfYear is not included, add it
      if(!this.eventsByDay.hasOwnProperty(dayOfYear)){
        this.eventsByDay[dayOfYear] = [];
      }
      //add the current event to that day
      this.eventsByDay[dayOfYear].push(el);
    });
  }

  getEventsOnDate(date: Moment): GeoJson[] {
    //determine day of year
    let dayOfYear = date.dayOfYear();
    //retrieve event list from eventsByDay
    if (this.eventsByDay.hasOwnProperty(dayOfYear)){
      return this.eventsByDay[dayOfYear];
    }
    //if no events, return empty array
    else {
      return [];
    }
  }

  onSelect(day: CalendarDay): void {
    //update selectedDay
    this.selectedDay = day;
    //create date for that day
    let date = moment([day.year, day.month, day.dayOfMonth]).toDate();
    //update sidebar to display events for that date
    this.eventService.updateEvents(date);
  }

  openEvent(event: GeoJson): void{
    this.eventService.updateClickedEvent(event);
  }

}
