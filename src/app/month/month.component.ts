import { Component, OnInit, NgZone } from '@angular/core';
import * as moment from 'moment';
import { Moment } from 'moment';
import { EventService } from '../event.service';
import { GeoJson } from '../map';
import { Router, NavigationEnd } from '@angular/router';
import { CalendarService } from '../calendar.service';

interface CalendarDay {
  dayOfMonth: number;
  inCurrentMonth: boolean;
  month: number;
  year: number;
  events: GeoJson[];
  selected: boolean;
}

@Component({
  selector: 'app-month',
  templateUrl: './month.component.html',
  styleUrls: ['./month.component.css']
})

export class MonthComponent implements OnInit {
  public days: CalendarDay[] = [];
  private selectedMonth: Number;
  private selectedYear: Number;
  private selectedDay: CalendarDay;
  private today: CalendarDay;
  public currentMonth: Moment;
  private filteredEvents: GeoJson[];
  private filteredMonthYearEvents: GeoJson[];
  private clickedEvent: GeoJson;
  private eventsByDay: { [day: number] : GeoJson[] } = {};
  private viewDate: Date;

  constructor(private _eventService: EventService, private router: Router, private ngZone: NgZone, private _calendarService: CalendarService) {
    router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        //this.ngOnInit();
      }
    });
  }

  ngOnInit() {

    this._calendarService.storeView('month');

    if(this._eventService.getExpandedEvent() == null){
      this.router.navigate( ['', {outlets: {sidebar: ['list']}}]);
    }

    this.currentMonth = moment();

    this._calendarService.change.subscribe( function(delta) { this.changeMonth(delta); }.bind(this));
    this._calendarService.selectedDayChange.subscribe( function(day) { this.changeSelectedDay(day); }.bind(this));

    this._eventService.currDate$.subscribe(date => {
      this.ngZone.run( () => {
        this.showCalendar(date);
      });
    });

    this._eventService.monthEvents$.subscribe(monthEventCollection => {
      this.filteredMonthYearEvents = monthEventCollection.features;
      this.selectedMonth = moment().month();
      this.selectedYear = moment().year();
      this.fillEventsByDay();
      this.ngZone.run( () => {
        this.showCalendar(this._calendarService.getViewDate());
      });
      if(this._calendarService.isWeekView()){
            let calendarDays = this._calendarService.days;
            let first = moment([calendarDays[0].year, calendarDays[0].month, calendarDays[0].dayOfMonth]).toDate();
            let last = moment([calendarDays[calendarDays.length-1].year, calendarDays[calendarDays.length-1].month, calendarDays[calendarDays.length-1].dayOfMonth]).toDate();
            this._eventService.initDateHash(first,last);
            this._eventService.setLocationSearch("");
            document.getElementById("scrollable").scrollTop = 210;
      }
    });

    this._eventService.filteredMonthEvents$.subscribe(monthEventCollection => {
      this.filteredMonthYearEvents = monthEventCollection.features;
      this.fillEventsByDay();
      this.ngZone.run( () => {
        this.showCalendar(this._eventService.getSelectedDay());
      });
    });

    this._eventService.clickedEvent$.subscribe(clickedEventInfo => {
        this.clickedEvent = clickedEventInfo;
    });

    this.fillEventsByDay();
    if (this._eventService.getSelectedDay() != null) {
      this.showCalendar(this._eventService.getSelectedDay());
      this._calendarService.setViewDate(this._eventService.getSelectedDay());
    }
    else{
      this.showCalendar(new Date());
      this._calendarService.setViewDate(new Date(), true);
    }

    let calendarDays = this._calendarService.days;
    let first = moment([calendarDays[0].year, calendarDays[0].month, calendarDays[0].dayOfMonth]).toDate();
    let last = moment([calendarDays[calendarDays.length-1].year, calendarDays[calendarDays.length-1].month, calendarDays[calendarDays.length-1].dayOfMonth]).toDate();
    this._eventService.initDateHash(first,last);
    this._eventService.initTimeHash(0,1439);
  }

  changeSelectedDay (day : CalendarDay) {
    this.selectedDay = day;
  }

  showCalendar(dateInMonth: Moment | Date | string): void {
    if(this._calendarService.isMonthView()){
    if(dateInMonth == undefined)
      return;
    this.currentMonth = moment(dateInMonth).startOf('month');
    // range of days shown on calendar
    let firstDay: Moment = moment(dateInMonth).startOf('month').startOf('week');
    let lastDay: Moment = moment(dateInMonth).endOf('month').endOf('week');
    //fill days
    this.days = [];
    for (let d: Moment = firstDay.clone(); d.isBefore(lastDay); d.add(1, 'days')) {
      //create CalendarDay object
      let weekDay: CalendarDay = {
        dayOfMonth: d.date(),
        inCurrentMonth: d.isSame(this.currentMonth, 'month'),
        month: parseInt(d.format('M'))-1,
        year: parseInt(d.format('YYYY')),
        events: this.getEventsOnDate(d),
        selected: d.isSame(dateInMonth, 'day')
      };
      //determine whether it is the current day
      if (d.format("MMMM DD YYYY") == moment().format("MMMM DD YYYY")){
        this.today = weekDay;
      }
      //add weekDay to display days array
      this.days.push(weekDay);
      // set selected day to the date provided
      if (d.isSame(dateInMonth, 'day')) {
        // this.selectedDay = weekDay;
        this._calendarService.setSelectedDay(weekDay);
      }
    }
    this._calendarService.setDays(this.days);
  }
  }

  changeMonth = (delta: number) => {
    if(!this._calendarService.isMonthView()){
      return;
    }
    // 1 means advance one month, -1 means go back one month
    let newMonth: Moment = this.currentMonth.clone().add(delta, 'months');
    // if selected day is in month, that is first option
    if (this._eventService.getSelectedDay() && newMonth.isSame(moment(this._eventService.getSelectedDay()), 'month')) {
      this._calendarService.setViewDate(this._eventService.getSelectedDay());
      this._eventService.updateDayEvents(this._eventService.getSelectedDay());
      this.showCalendar(this._eventService.getSelectedDay());
    }
    // if current month, make selected day today
    else if (newMonth.isSame(moment(), 'month')) {
      this._calendarService.setViewDate(new Date());
      this._eventService.updateDayEvents(new Date());
      this.showCalendar( new Date());
    }
    // make selected day the 1st of the month
    else {
      this._calendarService.setViewDate(newMonth.startOf('month').toDate());
      this._eventService.updateDayEvents(newMonth.startOf('month').toDate());
      this.showCalendar(newMonth.startOf('month').toDate());
    }
    this.selectedMonth = newMonth.month();
    this.selectedYear = newMonth.year();
    let monthyear = this.selectedMonth.toString() + " " + this.selectedYear.toString();
    this._eventService.updateMonthEvents(monthyear);
  }

    //retrieve events for the given month
    fillEventsByDay(){
      //clear events by day for the month
      this.eventsByDay = [];
      //iterate through filteredEvents for the current month
      this.filteredMonthYearEvents.forEach(el => {
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

   //retrieve events for a specific day
   getEventsOnDate(date: Moment): GeoJson[] {
    //determine day of year
    let dayOfYear = date.dayOfYear();
    //retrieve event list from eventsByDay
    if (this.eventsByDay.hasOwnProperty(dayOfYear)){
      //sort array by start time, then by duration
      var eventList = this.eventsByDay[dayOfYear];
      eventList.sort(function compare(a, b) {
        var timeA = +new Date(a.properties.start_time);
        var timeB = +new Date(b.properties.start_time);
        if(timeA-timeB == 0){
          var timeAA = +new Date(a.properties.end_time);
          var timeBB = +new Date(b.properties.end_time);
          return timeBB - timeAA;
        }
        return timeA - timeB;
      });
      //return sorted list of events
      return eventList;
    }
    //if no events, return empty array
    else {
      return [];
    }
  }

  onSelect(day: CalendarDay): void {
    // this.selectedDay = day;
      if(this._calendarService.getSelectedDay() != day){
        this.router.navigate( ['', {outlets: {sidebar: ['list']}}]);
      }
    this._calendarService.setSelectedDay(day);
    let date = moment([day.year, day.month, day.dayOfMonth]).toDate();
    this._eventService.updateDayEvents(date);
  }

  public ngOnDestroy(): void {
    ("unsubscribe");
    this._eventService.monthEvents$.unsubscribe(); // or something similar
  }

}
