import { Component, OnInit, Output, EventEmitter, NgZone } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { GeoJson } from '../map';
import { EventService } from '../services/event.service';
import { DateService } from '../services/date.service';
import { CalendarDay } from '../services/event.service';
import { ViewState } from '../view-enum';
import * as moment from 'moment';
import { Moment } from 'moment';

@Component({
  selector: 'app-week',
  templateUrl: './week.component.html',
  styleUrls: ['./week.component.scss']
})

export class WeekComponent implements OnInit {

  // visible days
  public days: CalendarDay[] = [];
  // view check
  public isWeekView: boolean = true;
  // events to display
  private filteredEvents: GeoJson[];
  private clickedEvent: GeoJson;
  private eventsByDay: { [day: number ] : GeoJson[] } = {};
  // style variables
  private zIndexArray: { [id: number] : Number } = {};
  private scrollPosition: number = 0;

  constructor(private _eventService: EventService, private _dateService: DateService, private router: Router, private ngZone: NgZone) {}

  ngOnInit() {

    // whenever selected date changes, update calendar
    this._eventService.selectedDate$.subscribe(date => {
      this.ngZone.run( () => { this.updateCalendar(date); });
    });

    // whenever current view changes, update calendar
    this._eventService.currentView$.subscribe(view => {
      this.isWeekView = (view == ViewState.week);
      this.filteredEvents = this._eventService.getFilteredWeekEvents().features;
      this.fillEventsByDay();
      this.ngZone.run( () => { this.updateCalendar(this._eventService.getSelectedDate()); });
    });

    // whenever week events change, update calendar
    this._eventService.filteredWeekEvents$.subscribe(weekEventCollection => {
      this.filteredEvents = weekEventCollection.features;
      this.fillEventsByDay();
      this.ngZone.run( () => { this.updateCalendar(this._eventService.getSelectedDate()); });
    });

    // update clicked event
    this._eventService.clickedEvent$.subscribe(clickedEventInfo => this.clickedEvent = clickedEventInfo);
    this._eventService.sidebarEvent$.subscribe(clickedEventInfo => this.clickedEvent = clickedEventInfo);

    // update sidebar
    if(this._eventService.getSidebarEvent() == null){
      this.router.navigate( ['', {outlets: {sidebar: ['list']}}]);
    }    

    // set current view
    this._eventService.setCurrentView(ViewState.week);

  }

  // return a string for the current week
  weekString() {
    let firstDay = moment(this.days[0].date)
    return (firstDay.startOf('week').format("MMMM D") + " - " + firstDay.startOf('week').clone().add(6, 'day').format("MMMM D, YYYY"));
  }

  //display the calendar
  updateCalendar(dateInMonth: Moment | Date | string): void {
    if(!this.isWeekView || dateInMonth == undefined)
      return;
    // compile calendar days according to range of days to be shown on calendar
    let bounds = this._dateService.getViewBounds(dateInMonth, ViewState.week);
    this.days = [];
    for (let d: Moment = bounds.startDate.clone(); d.isBefore(bounds.endDate); d.add(1, 'days')) {
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
        inCurrentMonth: this._dateService.inSameMonth(d,this._eventService.getSelectedDate())
      };
      this.days.push(weekDay);
    }
    // update visible days
    this._eventService.setVisibleDays(this.days);
  }

  // retrieve events for the given week
  fillEventsByDay(){
    // clear events by day for the week
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

  // highlight selected day -- currently not in use
  onSelect(day: CalendarDay): void{
    if(this._eventService.getClickedEvent() && this._eventService.getSelectedDate() != day.date &&
      moment(this._eventService.getClickedEvent().properties.start_time).date() != day.dayOfMonth)
        this.router.navigate(['', {outlets: {sidebar: ['list']}}]);
    this._eventService.changeDateSpan(day.date, ViewState.week);
  }

  // open event in sidebar
  openEvent(event: GeoJson): void{
    this._eventService.updateClickedEvent(event);
    this._eventService.updateSidebarEvent(event);
    this.router.navigate(['', {outlets: {sidebar: ['detail', event.id]}}]);
  }

  // return event name
  eventName(event: GeoJson): string{
    return event.properties.name;
  }

  // return event time
  eventTime(event: GeoJson): string{
    return this._dateService.formatTime(event.properties.start_time) +
      " - " + this._dateService.formatTime(event.properties.end_time);
  }

  // EVENT STYLING //

  // color events according to category
  styleEvent(event: GeoJson){
    let color = "#9FC0FF" // default color
    // color code by first valid category in array
    for(let i = 0; i < event.properties.categories.length; i++){
      if (event.properties.categories[i] != null) {
        color = this.getEventColor(event.properties.categories[i]);
        break;
      }
    }
    let style = {
      "background-color" : color + "5F", 
      'border-top' : '5px solid ' + color,
    }
    return style;
  }

  getEventColor(category: string): string {
    if (!category.localeCompare("NETWORKING"))
      return '#FFB5F8';
    else if (!category.localeCompare("GARDENING"))
      return '#FFB5F8';
    else if (!category.localeCompare("FOOD"))
      return '#FFB5F8';
    else if (!category.localeCompare("DANCE"))
      return '#BBA4FF';
    else if (!category.localeCompare("ART"))
      return'#BBA4FF';
    else if (!category.localeCompare("HEALTH"))
      return '#9FC0FF';
    else if (!category.localeCompare("SPORTS"))
      return '#BBA4FF';
    else if (!category.localeCompare("MEETUP"))
      return '#9FC0FF';
    else if (!category.localeCompare("COMEDY_PERFORMANCE"))
      return '#78E6E6';
    else if (!category.localeCompare("MUSIC"))
      return '#78E6E6';
    else if (!category.localeCompare("THEATER"))
      return '#78E6E6';
    else if (!category.localeCompare("PARTY"))
      return '#9FC0FF';
    else if (!category.localeCompare("CAUSE"))
      return '#9FC0FF';
    else if (!category.localeCompare("FILM"))
      return '#78E6E6';
    else if (!category.localeCompare("DRINKS"))
      return '#9FC0FF';
    else if (!category.localeCompare("FITNESS"))
      return '#BBA4FF';
    else if (!category.localeCompare("GAMES"))
      return '#9FC0FF';
    else if (!category.localeCompare("LITERATURE"))
      return '#78E6E6';
    else if (!category.localeCompare("RELIGION"))
      return '#FFB5F8';
    else if (!category.localeCompare("SHOPPING"))
      return '#FFB5F8';
    else if (!category.localeCompare("WELLNESS"))
      return '#9FC0FF';
    else
      return '#FFB5F8';
  }

}
