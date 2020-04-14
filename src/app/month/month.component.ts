import { Component, OnInit, NgZone } from '@angular/core';
import { Moment } from 'moment';
import { ViewService } from '../services/view.service';
import { EventService } from '../services/event.service';
import { DateService } from '../services/date.service';
import { GeoJson } from '../map';
import { Router, NavigationEnd } from '@angular/router';
import { CalendarDay } from '../services/event.service';
import * as moment from 'moment';

@Component({
  selector: 'app-month',
  templateUrl: './month.component.html',
  styleUrls: ['./month.component.scss']
})

export class MonthComponent implements OnInit {
  public days: CalendarDay[] = [];
  public currentMonth: Moment;
  private filteredEvents: GeoJson[];
  private clickedEvent: GeoJson;
  private eventsByDay: { [day: number] : GeoJson[] } = {};

  constructor(private _eventService: EventService, private _viewService: ViewService, private _dateService: DateService, private router: Router, private ngZone: NgZone) {}

  ngOnInit() {
    this._viewService.determineView();

    this._viewService.changeToMonth.subscribe( function(delta) { this.changeMonth(delta); }.bind(this));

    this._eventService.currentDate$.subscribe(date => {
      this.ngZone.run( () => { this.showCalendar(date); });
    });

    this._eventService.monthEvents$.subscribe(monthEventCollection => {
      this.filteredEvents = monthEventCollection.features;
      this.fillEventsByDay();
      this.ngZone.run( () => { this.showCalendar(this._eventService.getCurrentDate()); });
      if(this._viewService.isMonthView() && this._eventService.getDays())
        this._eventService.setDateFilterFromDays(this._eventService.getDays());
      if(this._viewService.isWeekView()){ document.getElementById("scrollable").scrollTop = 200; }
    });

    this._eventService.filteredMonthEvents$.subscribe(monthEventCollection => {
      this.filteredEvents = monthEventCollection.features;
      this.fillEventsByDay();
      this.ngZone.run( () => { this.showCalendar(this._eventService.getCurrentDate()); });
    });

    this._eventService.clickedEvent$.subscribe(clickedEventInfo => {
        this.clickedEvent = clickedEventInfo;
    });
    this._eventService.expandedEvent$.subscribe(clickedEventInfo => {
        this.clickedEvent = clickedEventInfo;
    });

    this._eventService.setDateFilterFromDays(this._eventService.getDays());
    this.currentMonth = moment();
    if(this._eventService.getExpandedEvent() == null){
      this.router.navigate( ['', {outlets: {sidebar: ['list']}}]);
    }

  }

  showCalendar(dateInMonth: Moment | Date | string): void {
    this.currentMonth = moment(dateInMonth).startOf('month');
    if(this._viewService.isMonthView() && dateInMonth != undefined){
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
        this._eventService.setSelectedDay(weekDay);
      }
    }
    this._eventService.setDays(this.days);
    }
  }

  changeMonth = (delta: number) => {
    // 1 means advance one month, -1 means go back one month
    let newMonth: Moment = this.currentMonth.clone().add(delta, 'months');
    // if selected day is in month, that is first option
    let viewDate;
    if (newMonth.isSame(moment(this._eventService.getCurrentDate()), 'month'))
      viewDate = this._eventService.getCurrentDate();
    else if (newMonth.isSame(moment(), 'month'))
      viewDate = new Date();
    else
      viewDate = newMonth.startOf('month').toDate();
    this._eventService.updateAllEvents(viewDate);
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
    if(this._eventService.getSelectedDay() != day){
      this.router.navigate( ['', {outlets: {sidebar: ['list']}}]);
    }
    this._eventService.setSelectedDay(day);
    if(!day.inCurrentMonth){
      this.changeMonth(0);
    }
  }

}
