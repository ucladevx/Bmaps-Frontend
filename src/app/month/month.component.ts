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

  constructor(private eventService: EventService, private router: Router, private ngZone: NgZone, private _calendarService: CalendarService) {
    router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        // this.ngOnInit();
      }
      // Instance of should be:
      // NavigationEnd
      // NavigationCancel
      // NavigationError
      // RoutesRecognized
    });
  }

  ngOnInit() {

    console.log("ngOnInit");
    console.log("this");
    console.log(this);
    this.currentMonth = moment();
    console.log(this.currentMonth);

    this._calendarService.change.subscribe( function(delta) { this.changeMonth(delta); }.bind(this));
    this._calendarService.selectedDayChange.subscribe( function(day) { this.changeSelectedDay(day); }.bind(this));

    this.eventService.currDate$.subscribe(date => {
      console.log(date);
      this.ngZone.run( () => {
        this.showCalendar(date);
      });
    });

    this.eventService.monthEvents$.subscribe(monthEventCollection => {
      this.filteredMonthYearEvents = monthEventCollection.features;
      this.selectedMonth = moment().month();
      this.selectedYear = moment().year();
      this.fillEventsByDay();
      this.ngZone.run( () => {
        this.showCalendar(this._calendarService.getViewDate());
      });
    });

    this.eventService.filteredMonthEvents$.subscribe(monthEventCollection => {
      this.filteredMonthYearEvents = monthEventCollection.features;
      this.fillEventsByDay();
      this.ngZone.run( () => {
        this.showCalendar(this.eventService.getSelectedDay());
      });
    });

    this.eventService.clickedEvent$.subscribe(clickedEventInfo => {
        this.clickedEvent = clickedEventInfo;
    });

    this.fillEventsByDay();
    this.showCalendar(new Date());
    this._calendarService.setViewDate(new Date(), true);

  }

  changeSelectedDay (day : CalendarDay) {
    this.selectedDay = day;
  }

  showCalendar(dateInMonth: Moment | Date | string): void {
    if(dateInMonth == undefined)
      return;
    console.log("showCalendar");
    console.log(dateInMonth);
    this.currentMonth = moment(dateInMonth).startOf('month');
    // range of days shown on calendar
    let firstDay: Moment = moment(dateInMonth).startOf('month').startOf('week');
    let lastDay: Moment = moment(dateInMonth).endOf('month').endOf('week');
    console.log(firstDay);
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
    console.log(this.days);
    this._calendarService.setDays(this.days);
  }

  changeMonth = (delta: number) => {
    if(!this._calendarService.isMonthView()){
      return;
    }
    console.log("this.currentMonth");
    console.log(this);
    console.log(this.currentMonth);
    // console.log(this.viewDate);
    console.log(this.selectedMonth);
    // 1 means advance one month, -1 means go back one month
    let newMonth: Moment = this.currentMonth.clone().add(delta, 'months');
    // console.log("nm" +newMonth.month())
    // console.log(newMonth);
    if (newMonth.isSame(moment(), 'month')) {
      // if current month, make selected day today
      // this.today = new Date();
      console.log("if (newMonth.isSame(moment(), 'month')) {");
      // this.viewDate = new Date();
      this._calendarService.setViewDate(new Date());
      this.eventService.updateDayEvents(new Date());
      this.showCalendar( new Date());
    }
    else {
      // make selected day the 1st of the month
      console.log("this.viewDate = newMonth.startOf('month').toDate();");
      // this.viewDate = newMonth.startOf('month').toDate();
      this._calendarService.setViewDate(newMonth.startOf('month').toDate());
      this.eventService.updateDayEvents(newMonth.startOf('month').toDate());
      // console.log(this.viewDate);
      console.log(newMonth.startOf('month').toDate());
      this.showCalendar(newMonth.startOf('month').toDate());
      console.log(newMonth.startOf('month').toDate());
      console.log("HERE AT END");
    }
    this.selectedMonth = newMonth.month();
    this.selectedYear = newMonth.year();
    let monthyear = this.selectedMonth.toString() + " " + this.selectedYear.toString();
    this.eventService.updateMonthEvents(monthyear);
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
      console.log(eventList);
      return eventList;
    }
    //if no events, return empty array
    else {
      return [];
    }
  }

  onSelect(day: CalendarDay): void {
    // this.selectedDay = day;
    this._calendarService.setSelectedDay(day);
    console.log('dayOfMonth ' + day.dayOfMonth);
    let date = moment([day.year, day.month, day.dayOfMonth]).toDate();
    console.log('date ' + date);
    this.eventService.updateDayEvents(date);
  }

  public ngOnDestroy(): void {
    console.log("unsubscribe");
    this.eventService.monthEvents$.unsubscribe(); // or something similar
  }

}
