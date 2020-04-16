import { Component, OnInit, NgZone } from '@angular/core';
import { Moment } from 'moment';
import { EventService } from '../services/event.service';
import { DateService } from '../services/date.service';
import { GeoJson } from '../map';
import { Router, NavigationEnd } from '@angular/router';
import { CalendarDay } from '../services/event.service';
import { ViewState } from '../view-enum';
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

  constructor(private _eventService: EventService, private _dateService: DateService, private router: Router, private ngZone: NgZone) {}

  ngOnInit() {

    this._eventService.selectedDate$.subscribe(date => {
      this.ngZone.run( () => { this.updateCalendar(date); });
    });

    this._eventService.currentView$.subscribe(view => {
      this.filteredEvents = this._eventService.getFilteredMonthEvents().features;
      this.fillEventsByDay();
      this.ngZone.run( () => { this.updateCalendar(this._eventService.getSelectedDate()); });
    });

    this._eventService.filteredMonthEvents$.subscribe(monthEventCollection => {
      this.filteredEvents = monthEventCollection.features;
      this.fillEventsByDay();
      this.ngZone.run( () => { this.updateCalendar(this._eventService.getSelectedDate()); });
    });

    this._eventService.clickedEvent$.subscribe(clickedEventInfo => {
      this.clickedEvent = clickedEventInfo;
    });

    this._eventService.sidebarEvent$.subscribe(clickedEventInfo => {
      this.clickedEvent = clickedEventInfo;
    });

    this.currentMonth = moment().startOf('month');

    if(this._eventService.getSidebarEvent() == null){
      this.router.navigate( ['', {outlets: {sidebar: ['list']}}]);
    }

    this._eventService.setCurrentView(ViewState.month);

  }

  // display the calendar
  updateCalendar(dateInMonth: Moment | Date | string): void {
    this.currentMonth = moment(dateInMonth).startOf('month');
    if(!this._eventService.isMonthView() || dateInMonth == undefined)
      return;
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
        dayOfWeek: d.format('ddd'),
        month: parseInt(d.format('M'))-1,
        year: parseInt(d.format('YYYY')),
        events: this.getEventsOnDate(d),
        isSelected: d.isSame(moment(dateInMonth), 'day'),
        isToday: this._dateService.isToday(d.toDate()),
        inCurrentMonth: d.isSame(this.currentMonth, 'month')
      };
      //add weekDay to display days array
      this.days.push(weekDay);
    }
    this._eventService.setVisibleDays(this.days);
  }

  //retrieve events for the given month
  fillEventsByDay(){
    //clear events by day for the month
    this.eventsByDay = [];
    if(this.filteredEvents.length < 1)
      return;
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
      return eventList;
    }
    else { return []; }
  }

  //highlight selected day
  onSelect(day: CalendarDay): void {
    let prevMonth = parseInt(moment(this._eventService.getSelectedDate()).format('M'))-1;
    if(this._eventService.getSelectedDate() != day.date)
      this.router.navigate( ['', {outlets: {sidebar: ['list']}}]);
    this._eventService.changeDateSpan(day.date, ViewState.month);
  }

}
