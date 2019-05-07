import { Component, OnInit, Output, EventEmitter, NgZone } from '@angular/core';
import { Moment } from 'moment';
import { Router, NavigationEnd } from '@angular/router';
import { DisplayService } from '../services/display.service';
import { DateService } from '../services/date.service';
import { GeoJson } from '../map';
import { CalendarDay } from '../services/display.service';
import * as moment from 'moment';

@Component({
  selector: 'app-week',
  templateUrl: './week.component.html',
  styleUrls: ['./week.component.css']
})

export class WeekComponent implements OnInit {
  public days: CalendarDay[] = [];
  public currentMonth: Moment;
  private currentWeek: Moment;
  private filteredEvents: GeoJson[];
  private clickedEvent: GeoJson;
  private eventsByDay: { [day: number ] : GeoJson[] } = {};
  private zIndexArray: { [id: number] : Number } = {};
  private scrollPosition: number = 0;

  //constructor statement
  constructor(private _displayService: DisplayService, private _dateService: DateService, private router: Router, private ngZone: NgZone) {}

  ngOnInit() {

    this._displayService.changeToWeek.subscribe( function(delta) { this.changeWeek(delta); }.bind(this));

    this._displayService.currentDate$.subscribe(date => {
      this.ngZone.run( () => { this.showCalendar(date); });
    });

    this._displayService.weekEvents$.subscribe(weekEventCollection => {
      this.filteredEvents = weekEventCollection.features;
      this.fillEventsByDay();
      this.ngZone.run( () => { this.showCalendar(this._displayService.getCurrentDate()); });
      if(this._displayService.isWeekView())
        document.getElementById("scrollable").scrollTop = this.scrollPosition;
      this._displayService.setDateFilterFromDays(this._displayService.getDays());
    });

    this._displayService.filteredWeekEvents$.subscribe(weekEventCollection => {
      this.filteredEvents = weekEventCollection.features;
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

    this.scrollPosition = document.getElementById("scrollable").scrollHeight*0.288;
    document.getElementById("scrollable").scrollTop = this.scrollPosition;

  }

  //display the calendar
  showCalendar(dateInMonth: Moment | Date | string): void {
    if(this._displayService.isWeekView() && dateInMonth != undefined){
    //set currentMonth and currentWeek
    this.currentMonth = moment(dateInMonth).startOf('month');
    this.currentWeek = moment(dateInMonth).startOf('week');
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

  //increment or decrement week
  changeWeek(delta: number): void {
    // 1 means advance one week, -1 means go back one week
    let newWeek: Moment = this.currentWeek.clone().add(delta, 'week');
    // if selected day is in month, that is first option
    let viewDate;
    if (newWeek.isSame(moment(this._displayService.getCurrentDate()), 'week'))
      viewDate = this._displayService.getCurrentDate();
    else if (newWeek.isSame(moment(), 'week'))
      viewDate = new Date();
    else
      viewDate = newWeek.startOf('week').toDate();
    if(this._displayService.isWeekView())
      document.getElementById("scrollable").scrollTop = this.scrollPosition;
    this._displayService.updateDayEvents(viewDate);
    this._displayService.updateWeekEvents(viewDate);
    this._displayService.updateMonthEvents(viewDate);
  }

  //retrieve events for the given week
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

  //highlight selected day
  onSelect(day: CalendarDay): void{
    if(this._displayService.getClickedEvent() && this._displayService.getSelectedDay() != day &&
      moment(this._displayService.getClickedEvent().properties.start_time).date() != day.dayOfMonth){
      this.router.navigate( ['', {outlets: {sidebar: ['list']}}]);
    }
    this._displayService.setSelectedDay(day);
    this._displayService.updateDayEvents(day.date);
  }

  //open event in sidebar
  openEvent(event: GeoJson): void{
    this._displayService.updateClickedEvent(event);
    this.router.navigate(['', {outlets: {sidebar: ['detail', event.id]}}]);
    this._displayService.updateExpandedEvent(event);
  }

  //retrieve and format event title and event time
  eventName(event: GeoJson): string{
    return event.properties.name;
  }
  eventTime(event: GeoJson): string{
    return this._dateService.formatTime(event.properties.start_time) + " - " + this._dateService.formatTime(event.properties.end_time);
  }

  //determine the position of the current time bar
  currentTime() {
    let now = moment();
    return this.convertTimeToPercent(now)+"%";
  }

  //convert time to top percentage in css
  convertTimeToPercent(time: Moment) {
    let increment = 3.55; let p = 11;
    if(time.format("A") == "PM"){ p += 42.8; increment = 3.58; }
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
      this._displayService.getSelectedDay().dayOfMonth == moment(this.clickedEvent.properties.start_time).date()){
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
