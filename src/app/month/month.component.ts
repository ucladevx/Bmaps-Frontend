import { Component, OnInit, NgZone } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { GeoJson } from '../map';
import { EventService } from '../services/event.service';
import { DateService } from '../services/date.service';
import { CalendarDay } from '../services/event.service';
import { ViewState } from '../view-enum';
import * as moment from 'moment';
import { Moment } from 'moment';

@Component({
  selector: 'app-month',
  templateUrl: './month.component.html',
  styleUrls: ['./month.component.scss']
})

export class MonthComponent implements OnInit {

  // visible days
  public days: CalendarDay[] = [];
  // view check
  public isMonthView: boolean = true;
  // events to display
  private filteredEvents: GeoJson[];
  private eventsByDay: { [day: number] : GeoJson[] } = {};

  constructor(private _eventService: EventService, private _dateService: DateService, private router: Router, private ngZone: NgZone) {}

  ngOnInit() {

    // whenever selected date changes, update calendar
    this._eventService.selectedDate$.subscribe(date => {
      this.ngZone.run( () => { this.updateCalendar(date); });
    });

    // whenever current view changes, update calendar
    this._eventService.currentView$.subscribe(view => {
      this.isMonthView = (view == ViewState.month);
      this.filteredEvents = this._eventService.getFilteredMonthEvents().features;
      this.fillEventsByDay();
      this.ngZone.run( () => { this.updateCalendar(this._eventService.getSelectedDate()); });
    });

    // whenever month events change, update calendar
    this._eventService.filteredMonthEvents$.subscribe(monthEventCollection => {
      this.filteredEvents = monthEventCollection.features;
      this.fillEventsByDay();
      this.ngZone.run( () => { this.updateCalendar(this._eventService.getSelectedDate()); });
    });

    // update sidebar
    if(this._eventService.getSidebarEvent() == null)
      this.router.navigate( ['', {outlets: {sidebar: ['list']}}]);

    // set current view
    this._eventService.setCurrentView(ViewState.month);

  }

  // display the calendar
  updateCalendar(dateInMonth: Moment | Date | string): void {
    if(!this.isMonthView || dateInMonth == undefined)
      return;
    // compile calendar days according to range of days to be shown on calendar
    let bounds = this._dateService.getViewBounds(dateInMonth, ViewState.month);
    this.days = [];
    for (let d: Moment = bounds.startDate.clone(); d.isBefore(bounds.endDate); d.add(1, 'days')) {
      // create CalendarDay object
      let weekDay: CalendarDay = {
        date: d.toDate(),
        dayOfMonth: d.date(),
        dayOfWeek: d.format('ddd'),
        month: parseInt(d.format('M'))-1,
        year: parseInt(d.format('YYYY')),
        events: this.getEventsOnDate(d),
        isSelected: d.isSame(moment(dateInMonth), 'day'),
        isToday: this._dateService.isToday(d.toDate()),
        inCurrentMonth: this._dateService.inSameMonth(d,this._eventService.getSelectedDate())
      };
      this.days.push(weekDay);
    }
    // update visible days
    this._eventService.setVisibleDays(this.days);
  }

  // retrieve events for the given month
  fillEventsByDay(){
    // clear events by day for the month
    this.eventsByDay = [];
    if(this.filteredEvents.length < 1)
      return;
    // iterate through filteredEvents for the current month
    this.filteredEvents.forEach(el => {
      // determine dayOfYear
      let eventDate = moment(el.properties.start_time);
      let dayOfYear = eventDate.dayOfYear();
      // if the dayOfYear is not included, add it
      if(!this.eventsByDay.hasOwnProperty(dayOfYear))
        this.eventsByDay[dayOfYear] = [];
      // add the current event to that day
      this.eventsByDay[dayOfYear].push(el);
    });
  }

  // retrieve events for a specific day
  getEventsOnDate(date: Moment): GeoJson[] {
    // determine day of year
    let dayOfYear = date.dayOfYear();
    // retrieve event list from eventsByDay
    if (this.eventsByDay.hasOwnProperty(dayOfYear))
      return this.eventsByDay[dayOfYear];
    else return [];
  }

  // highlight selected day
  onSelect(day: CalendarDay): void {
    if(this._eventService.getSelectedDate() != day.date)
      this.router.navigate( ['', {outlets: {sidebar: ['list']}}]);
    this._eventService.changeDateSpan(day.date, ViewState.month);
  }

}
