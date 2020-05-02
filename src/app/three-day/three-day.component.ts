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
  selector: 'app-three-day',
  templateUrl: './three-day.component.html',
  styleUrls: ['./three-day.component.scss']
})

export class ThreeDayComponent implements OnInit {

  // visible days
  public days: CalendarDay[] = [];
  // view check
  public isThreeDayView: boolean = true;
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
      this.isThreeDayView = (view == ViewState.threeday);
      this.filteredEvents = this._eventService.getFilteredThreeDayEvents().features;
      this.fillEventsByDay();
      this.ngZone.run( () => { this.updateCalendar(this._eventService.getSelectedDate()); });
    });

    // whenever week events change, update calendar
    this._eventService.filteredThreeDayEvents$.subscribe(threeDayEventCollection => {
      this.filteredEvents = threeDayEventCollection.features;
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

    // set scroll
    setTimeout(function(){
      this.scrollPosition = document.getElementById("scrollable").scrollHeight*0.288;
      document.getElementById("scrollable").scrollTop = this.scrollPosition;
    }, 0.1);

    // set current view
    this._eventService.setCurrentView(ViewState.threeday);

  }

  // display the calendar
  updateCalendar(dateInMonth: Moment | Date | string): void {
    if(!this.isThreeDayView || dateInMonth == undefined)
      return;
    // compile calendar days according to range of days to be shown on calendar
    let bounds = this._dateService.getViewBounds(dateInMonth, ViewState.threeday);
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

  //retrieve events for the given week
  fillEventsByDay(){
    //clear events by day for the week
    this.eventsByDay = [];
    if(this.filteredEvents.length < 1)
      return;
    //iterate through filteredEvents for the current month
    this.filteredEvents.forEach(el => {
      //determine dayOfYear
      let eventDate = moment(el.properties.start_time);
      let dayOfYear = eventDate.dayOfYear();
      //if the dayOfYear is not included, add it
      if(!this.eventsByDay.hasOwnProperty(dayOfYear))
        this.eventsByDay[dayOfYear] = [];
      //add the current event to that day
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
  onSelect(day: CalendarDay): void{
    if(this._eventService.getClickedEvent() && this._eventService.getSelectedDate() != day.date &&
      moment(this._eventService.getClickedEvent().properties.start_time).date() != day.dayOfMonth)
        this.router.navigate(['', {outlets: {sidebar: ['list']}}]);
    this._eventService.changeDateSpan(day.date, ViewState.threeday);
  }

  // open event in sidebar
  openEvent(event: GeoJson): void{
    this._eventService.updateClickedEvent(event);
    this._eventService.updateSidebarEvent(event);
    this.router.navigate(['', {outlets: {sidebar: ['detail', event.id]}}]);
  }

  // EVENT STYLING //

  eventName(event: GeoJson): string{
    return event.properties.name;
  }

  eventTime(event: GeoJson): string{
    return this._dateService.formatTime(event.properties.start_time) + " - " + this._dateService.formatTime(event.properties.end_time);
  }

  // determine the position of the current time bar
  currentTime() {
    let now = moment();
    return this.convertTimeToPercent(now)+"%";
  }

  // check that this is working!!!!!!!!!!!!!!!!!!!!!!!!
  changeDateSpan(delta: number) : void {
    let newDate = this._eventService.getSelectedDate();
    let currDate = this._eventService.getSelectedDate();
    let today = new Date();
    newDate = this._dateService.getViewBounds(newDate,ViewState.threeday).startDate.startOf('d').add(delta*3,'d').toDate();
    if(this._dateService.inSameThreeDay(newDate, currDate)) newDate = currDate;

    this._eventService.changeDateSpan(newDate, ViewState.threeday);

    // update scroll
    let _this = this;
    setTimeout(function(){
      this.scrollPosition = document.getElementById("scrollable").scrollHeight*0.288;
      document.getElementById("scrollable").scrollTop = this.scrollPosition;
    }, 0.1);
  }

  // on swipe left
  onPanLeft() {
    if (window.outerWidth <= 768) {
      // only on mobile
      this.changeDateSpan(1);

    }
  }

  // on swipe right
  onPanRight() {
    if (window.outerWidth <= 768) {
      // only on mobile
      this.changeDateSpan(-1);

    }
  }

  //convert time to top percentage in css
  convertTimeToPercent(time: Moment) {
    let increment = 0; let p = 0;
    if (window.outerWidth <= 768){
      p = 3.75;  // p is height % of day-header
      increment = 4.05;    // about height % of an hour block = (time-of-day height %)/24
      if(time.format("A") == "PM")
        p += 48.6;    // about 12*increment
    } else {
      p = 11; 
      increment = 3.77;
      if(time.format("A") == "PM")
        p += 45.25;
    }
    p += (parseInt(time.format("H"))%12)*increment;
    p += (parseInt(time.format("mm"))/15)*(increment/4);
    return p;
  }

  // get color of event based off category
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

  styleEventName(event: GeoJson) {
    var height = this.calculateEventHeight(event);

    var oneLineMax = 2.25;    // height percentage max for one line
    var increment = (window.outerWidth <= 768) ? 2.5 : 2;    // increment percentage per line

    var lines = 5;
    if (height < oneLineMax) lines = 1;
    else if (height <= oneLineMax + increment) lines = 2;
    else if (height <= oneLineMax + 2*increment) lines = 3;
    else if (height <= oneLineMax + 3*increment) lines = 4;

    let style = { 
      '-webkit-line-clamp': lines,
    }

    return style;
  }

  calculateEventHeight(event: GeoJson) {
    // CALCULATE TOP //
    let start = moment(event.properties.start_time);
    let top = this.convertTimeToPercent(start);
    // CALCULATE HEIGHT //
    let temp = moment(event.properties.end_time);
    let hours = moment.duration(temp.diff(start)).asHours();
    if(hours>24){ hours = (hours%24)+1; }
    let end = start.clone().add(hours,"hours");
    let bottom = this.convertTimeToPercent(end)
    let height = bottom-top;
    if(height<0){ height = 100-top; }

    return height;
  }

  // position and size event to match actual start time and duration
  styleEvent(event: GeoJson, events: GeoJson[]) {
    // CALCULATE TOP //
    let start = moment(event.properties.start_time);
    let top = this.convertTimeToPercent(start);
    // CALCULATE HEIGHT //
    let temp = moment(event.properties.end_time);
    let hours = moment.duration(temp.diff(start)).asHours();
    if(hours>24){ hours = (hours%24)+1; }
    let end = start.clone().add(hours,"hours");
    let bottom = this.convertTimeToPercent(end)
    let height = bottom-top;
    if(height<0){ height = 100-top; }
    // CALCULATE WIDTH AND LEFT //
    let overlapped = [];
    let eventIndex = 0;
    //iterate through surrounding events
    for(let j = 0; j < events.length; j++){
      if(events[j] == event){ eventIndex = overlapped.length; }
      //retrieve start and end time for new event
      let s = moment(events[j].properties.start_time);
      let t = moment(events[j].properties.end_time);
      let h = moment.duration(t.diff(s)).asHours();
      if(h>24){ h = (h%24)+1; }
      let e = s.clone().add(h,"hours");
      //determine whether events overlap
      if(!s.isSame(end) && !e.isSame(start) &&
        ((s.isSame(start) && e.isSame(end)) ||
        (s.isSameOrAfter(start) && s.isBefore(end)) ||
        (e.isSameOrAfter(start) && e.isBefore(end)) ||
        (start.isSameOrAfter(s) && start.isBefore(e)) ||
        (end.isSameOrAfter(s) && end.isBefore(e))))
      { overlapped.push(events[j]); }
    }
    // CALCULATE LEFT
    let left = 2+((98/overlapped.length)*eventIndex);
    // CALCULATE WIDTH
    let width = 98-left-(5*(overlapped.length-1-eventIndex));
    // CALCULATE ZINDEX
    let z = eventIndex+1;
    this.zIndexArray[event.id] = z;
    // account for clicked event
    let font = "normal";
    if(this.clickedEvent && this.clickedEvent.id == event.id &&
      moment(this._eventService.getSelectedDate()).isSame(moment(this.clickedEvent.properties.start_time), 'd')){
      font = "bold";
      z = 100;
    }

    // CREATE STYLE
    let style = {
      'top' : top+"%", 'height' : height+"%",
      'left' : left+"%", 'width' : width+"%",
      'zIndex' : z, 'fontWeight' : font,
      'background-color' : this.getEventColor(event.properties.categories[0]),
    }
    return style;
  }

}
