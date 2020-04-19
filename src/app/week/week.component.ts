import { Component, OnInit, Output, EventEmitter, NgZone } from '@angular/core';
import { Moment } from 'moment';
import { Router, NavigationEnd } from '@angular/router';
import { EventService } from '../services/event.service';
import { DateService } from '../services/date.service';
import { GeoJson } from '../map';
import { CalendarDay } from '../services/event.service';
import * as moment from 'moment';
import { ViewState } from '../view-enum';

@Component({
  selector: 'app-week',
  templateUrl: './week.component.html',
  styleUrls: ['./week.component.scss']
})

export class WeekComponent implements OnInit {
  public days: CalendarDay[] = [];
  public isWeekView: boolean = true;
  public currentMonth: Moment;
  private currentWeek: Moment;
  private filteredEvents: GeoJson[];
  private clickedEvent: GeoJson;
  private eventsByDay: { [day: number ] : GeoJson[] } = {};
  private zIndexArray: { [id: number] : Number } = {};
  private scrollPosition: number = 0;

  //constructor statement
  constructor(private _eventService: EventService, private _dateService: DateService, private router: Router, private ngZone: NgZone) {}

  ngOnInit() {

    this._eventService.selectedDate$.subscribe(date => {
      this.ngZone.run( () => { this.updateCalendar(date); });
    });

    this._eventService.currentView$.subscribe(view => {
      this.isWeekView = (view == ViewState.week);
      this.filteredEvents = this._eventService.getFilteredWeekEvents().features;
      this.fillEventsByDay();
      this.ngZone.run( () => { this.updateCalendar(this._eventService.getSelectedDate()); });
    });

    this._eventService.filteredWeekEvents$.subscribe(weekEventCollection => {
      this.filteredEvents = weekEventCollection.features;
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
    this.currentMonth = moment().startOf('week');

    if(this._eventService.getSidebarEvent() == null){
      this.router.navigate( ['', {outlets: {sidebar: ['list']}}]);
    }

    setTimeout(function(){
      this.scrollPosition = document.getElementById("scrollable").scrollHeight*0.288;
      document.getElementById("scrollable").scrollTop = this.scrollPosition;
    }, 1);

    this._eventService.setCurrentView(ViewState.week);

  }

  //display the calendar
  updateCalendar(dateInMonth: Moment | Date | string): void {
    //set currentMonth and currentWeek
    this.currentMonth = moment(dateInMonth).startOf('month');
    this.currentWeek = moment(dateInMonth).startOf('week');
    if(!this.isWeekView || dateInMonth == undefined)
      return;
    // range of days shown on calendar
    let firstDay: Moment = moment(dateInMonth).startOf('week');
    let lastDay: Moment = moment(dateInMonth).endOf('week');
    if(parseInt(lastDay.format('DD')) > 3 && parseInt(lastDay.format('DD')) < 7)
      this.currentMonth.add(1,'month');
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
  onSelect(day: CalendarDay): void{
    if(this._eventService.getClickedEvent() && this._eventService.getSelectedDate() != day.date &&
      moment(this._eventService.getClickedEvent().properties.start_time).date() != day.dayOfMonth){
        this.router.navigate(['', {outlets: {sidebar: ['list']}}]);
    }
    this._eventService.changeDateSpan(day.date, ViewState.week);
  }

  //open event in sidebar
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

  currentTime() {
    let now = moment();
    return this.convertTimeToPercent(now)+"%";
  }

  convertTimeToPercent(time: Moment) {
    let increment = 0; let p = 0;
    if (window.outerWidth <= 768){
      p = 5;
      increment = 3.84;
      if(time.format("A") == "PM"){
        p += 46; increment = 3.77;
      }
    }
    else {
      p = 11;
      increment = 3.58;
      if(time.format("A") == "PM"){
        p += 43; increment = 3.55;
      }
    }
    p += (parseInt(time.format("H"))%12)*increment;
    p += (parseInt(time.format("mm"))/15)*(increment/4);
    return p;
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
      'zIndex' : z, 'fontWeight' : font
    }
    return style;
  }

}
