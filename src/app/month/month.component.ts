import { Component, OnInit, NgZone } from '@angular/core';
import { Moment } from 'moment';
import { DisplayService } from '../services/display.service';
import { DateService } from '../services/date.service';
import { GeoJson } from '../map';
import { Router, NavigationEnd } from '@angular/router';
import { CalendarDay } from '../services/display.service';
import * as moment from 'moment';

@Component({
  selector: 'app-month',
  templateUrl: './month.component.html',
  styleUrls: ['./month.component.css']
})

export class MonthComponent implements OnInit {
  public days: CalendarDay[] = [];
  public currentMonth: Moment;
  private filteredEvents: GeoJson[];
  private clickedEvent: GeoJson;
  private eventsByDay: { [day: number] : GeoJson[] } = {};

  constructor(private _displayService: DisplayService, private _dateService: DateService, private router: Router, private ngZone: NgZone) {}

  ngOnInit() {

    this._displayService.changeToMonth.subscribe( function(delta) { this.changeMonth(delta); }.bind(this));

    this._displayService.currentDate$.subscribe(date => {
      this.ngZone.run( () => { this.showCalendar(date); });
    });

    this._displayService.monthEvents$.subscribe(monthEventCollection => {
      this.filteredEvents = monthEventCollection.features;
      this.fillEventsByDay();
      this.ngZone.run( () => { this.showCalendar(this._displayService.getCurrentDate()); });
      if(this._displayService.getDays())
        this._displayService.setDateFilterFromDays(this._displayService.getDays());
      if(this._displayService.isWeekView()){ document.getElementById("scrollable").scrollTop = 200; }
    });

    this._displayService.filteredMonthEvents$.subscribe(monthEventCollection => {
      this.filteredEvents = monthEventCollection.features;
      this.fillEventsByDay();
      this.ngZone.run( () => { this.showCalendar(this._displayService.getCurrentDate()); });
    });

    this._displayService.clickedEvent$.subscribe(clickedEventInfo => {
        this.clickedEvent = clickedEventInfo;
    });
    this._displayService.expandedEvent$.subscribe(clickedEventInfo => {
        this.clickedEvent = clickedEventInfo;
    });

    this._displayService.setDateFilterFromDays(this._displayService.getDays());
    this.currentMonth = moment();
    this._displayService.isMonthView();
    if(this._displayService.getExpandedEvent() == null){
      this.router.navigate( ['', {outlets: {sidebar: ['list']}}]);
    }

  }

  showCalendar(dateInMonth: Moment | Date | string): void {
    if(this._displayService.isMonthView() && dateInMonth != undefined){
    this.currentMonth = moment(dateInMonth).startOf('month');
    // range of days shown on calendar
    let firstDay: Moment = moment(dateInMonth).startOf('month').startOf('week');
    let lastDay: Moment = moment(dateInMonth).endOf('month').endOf('week');
    //fill days
    this.days = [];
    for (let d: Moment = firstDay.clone(); d.isBefore(lastDay); d.add(1, 'days')) {
      //create CalendarDay object
      let weekDay: CalendarDay = {
        date: d.toDate(),
        dayOfMonth: d.date(),
        inCurrentMonth: d.isSame(this.currentMonth, 'month'),
        month: parseInt(d.format('M'))-1,
        year: parseInt(d.format('YYYY')),
        events: this.getEventsOnDate(d),
        selected: d.isSame(dateInMonth, 'day'),
        dayOfWeek: d.format('ddd'),
        isToday: this._dateService.isToday(d.toDate())
      };
      //add weekDay to display days array
      this.days.push(weekDay);
      // set selected day to the date provided
      if (d.isSame(dateInMonth, 'day')) {
        this._displayService.setSelectedDay(weekDay);
      }
    }
    this._displayService.setDays(this.days);
    }
  }

  changeMonth = (delta: number) => {
    // 1 means advance one month, -1 means go back one month
    let newMonth: Moment = this.currentMonth.clone().add(delta, 'months');
    // if selected day is in month, that is first option
    let viewDate;
    if (newMonth.isSame(moment(this._displayService.getCurrentDate()), 'month'))
      viewDate = this._displayService.getCurrentDate();
    else if (newMonth.isSame(moment(), 'month'))
      viewDate = new Date();
    else
      viewDate = newMonth.startOf('month').toDate();
    this._displayService.updateDayEvents(viewDate);
    this._displayService.updateWeekEvents(viewDate);
    this._displayService.updateMonthEvents(viewDate);
  }

    //retrieve events for the given month
    fillEventsByDay(){
      //clear events by day for the month
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

   //retrieve events for a specific day
   getEventsOnDate(date: Moment): GeoJson[] {
    //determine day of year
    let dayOfYear = date.dayOfYear();
    //retrieve event list from eventsByDay
    if (this.eventsByDay.hasOwnProperty(dayOfYear)){
      //sort array by start time, then by duration
      let eventList = this.eventsByDay[dayOfYear];
      eventList.sort(function compare(a, b) {
        let timeA = +new Date(a.properties.start_time);
        let timeB = +new Date(b.properties.start_time);
        if(timeA-timeB == 0){
          let timeAA = +new Date(a.properties.end_time);
          let timeBB = +new Date(b.properties.end_time);
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
    if(this._displayService.getSelectedDay() != day){
      this.router.navigate( ['', {outlets: {sidebar: ['list']}}]);
    }
    this._displayService.setSelectedDay(day);
    this._displayService.updateDayEvents(day.date);
  }

}
