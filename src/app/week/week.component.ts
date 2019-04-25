import { Component, OnInit, Output, EventEmitter, NgZone } from '@angular/core';
import * as moment from 'moment';
import { Moment } from 'moment';
import { Router, NavigationEnd } from '@angular/router';
import { EventService } from '../event.service';
import { DateService } from '../shared/date.service';
import { GeoJson } from '../map';
import { CalendarService } from '../calendar.service';

interface CalendarDay {
  dayOfMonth: number;
  inCurrentMonth: boolean;
  month: number;
  year: number;
  events: GeoJson[];
  selected: boolean;
  dayOfWeek: string;
}

@Component({
  selector: 'app-week',
  templateUrl: './week.component.html',
  styleUrls: ['./week.component.css']
})

export class WeekComponent implements OnInit {
  public days: CalendarDay[] = [];
  private selectedMonth: Number;
  private selectedYear: Number;
  private selectedDay: CalendarDay;
  private viewDate: Date ;
  private today: CalendarDay;
  public currentMonth: Moment;
  private currentWeek: Moment;
  private filteredEvents: GeoJson[];
  private clickedEvent: GeoJson;
  private eventsByDay: { [day: number ] : GeoJson[] } = {};
  private zIndexArray: { [id: number] : Number } = {};

  //constructor statement
  constructor(private _eventService: EventService, private _dateService: DateService, private router: Router, private ngZone: NgZone,
    private _calendarService: CalendarService) {
    router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        // this.ngOnInit();
      }
    });
  }

  ngOnInit() {

    this._calendarService.storeView('week');
    if(this._eventService.getExpandedEvent() == null){
      this.router.navigate( ['', {outlets: {sidebar: ['list']}}]);
    }
    this._calendarService.change.subscribe( function(delta) { this.changeWeek(delta); }.bind(this));
    this._calendarService.selectedDayChange.subscribe( function(day) { this.changeSelectedDay(day); }.bind(this));

    this._eventService.currDate$.subscribe(date => {
      this.ngZone.run( () => {
        if(this.filteredEvents != null){
          this.showCalendar(date);
        }
      });
    });

    this._eventService.weekEvents$.subscribe(weekEventCollection => {
      this.filteredEvents = weekEventCollection.features;
      this.fillEventsByDay();
      this.ngZone.run( () => {
        this.showCalendar(this._calendarService.getViewDate());
        let calendarDays = this._calendarService.days;
        let first = moment([calendarDays[0].year, calendarDays[0].month, calendarDays[0].dayOfMonth]).toDate();
        let last = moment([calendarDays[calendarDays.length-1].year, calendarDays[calendarDays.length-1].month, calendarDays[calendarDays.length-1].dayOfMonth]).toDate();
        this._eventService.initDateHash(first,last);
        if(this._calendarService.isWeekView()){
            document.getElementById("scrollable").scrollTop = 200;
        }
      });
    });

    this._eventService.filteredWeekEvents$.subscribe(weekEventCollection => {
      this.filteredEvents = weekEventCollection.features;
      this.fillEventsByDay();
      this.ngZone.run( () => {
        this.showCalendar(this._eventService.getSelectedDay());
      });
    });

    this._eventService.clickedEvent$.subscribe(clickedEventInfo => {
      if(document.getElementById("week-view-indicator") != null){
        this.clickedEvent = clickedEventInfo;
      }
    });


    if (this._eventService.getSelectedDay() != null) {
      //on startup
      this.selectedMonth = moment(this._eventService.getSelectedDay()).month();
      this.selectedYear = moment(this._eventService.getSelectedDay()).year();
      this._calendarService.setViewDate(this._eventService.getSelectedDay(), true);
      //update view
      this.updateWeekView();
    }
    else{
      //on startup
      this.selectedMonth = moment().month();
      this.selectedYear = moment().year();
      this._calendarService.setViewDate(new Date(), true);
      //update view
      this.updateWeekView();
    }

    if(this._eventService.getExpandedEvent()){
      this.clickedEvent = this._eventService.getExpandedEvent();
    }

    let calendarDays = this._calendarService.days;
    let first = moment([calendarDays[0].year, calendarDays[0].month, calendarDays[0].dayOfMonth]).toDate();
    let last = moment([calendarDays[calendarDays.length-1].year, calendarDays[calendarDays.length-1].month, calendarDays[calendarDays.length-1].dayOfMonth]).toDate();
    this._eventService.initDateHash(first,last);

    document.getElementById("scrollable").scrollTop = 200;
    this._calendarService.isWeekView();
  }

  changeSelectedDay (day : CalendarDay) {
    this.selectedDay = day;
  }

  //update the week view
  updateWeekView(){
    //update month events (subscribed to by ngOnInit)
    this._eventService.updateWeekEvents(this._calendarService.getViewDate());
    //set scroll bar to show view of rogughly 8am-10pm
    document.getElementById("scrollable").scrollTop = 200;
  }

  //display the calendar
  showCalendar(dateInMonth: Moment | Date | string): void {
    if(this._calendarService.isWeekView()){
    //set currentMonth and currentWeek
    this.currentMonth = moment(dateInMonth).startOf('month');
    this.currentWeek = moment(dateInMonth).startOf('week');
    // range of days shown on calendar
    let firstDay: Moment = moment(dateInMonth).startOf('week');
    let lastDay: Moment = moment(dateInMonth).endOf('week');
    if(parseInt(lastDay.format('DD')) > 3 && parseInt(lastDay.format('DD')) < 7){
      this.currentMonth.add(1,'month');
    }
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
        selected: d.isSame(dateInMonth, 'day'),
        dayOfWeek: d.format('ddd')
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
    if(this._eventService.getClickedEvent()){
      this.clickedEvent = this._eventService.getClickedEvent();
    }
  }
  }

  //increment or decrement week
  changeWeek(delta: number): void {
    if(!this._calendarService.isWeekView()){
      return;
    }
    // 1 means advance one week, -1 means go back one week
    let newWeek: Moment = this.currentWeek.clone().add(delta, 'week');
    //update selectedMonth and selectedYear
    this.selectedMonth = newWeek.month();
    this.selectedYear = newWeek.year();
    // if selected day is in month, that is first option
    if (this._eventService.getSelectedDay() && newWeek.isSame(moment(this._eventService.getSelectedDay()), 'week')) {
      this._calendarService.setViewDate(this._eventService.getSelectedDay());
      this._eventService.updateDayEvents(this._eventService.getSelectedDay());
      this.updateWeekView();
    }
    // if current week, make selected day today
    else if (newWeek.isSame(moment(), 'week')) {
      //update view date
      // this.viewDate = new Date();
      this._calendarService.setViewDate(new Date());
      this._eventService.updateDayEvents(new Date());
      //update view
      this.updateWeekView();
    }
    // make selected day the 1st of the week
    else {
      //update view date
      // this.viewDate = newWeek.startOf('week').toDate();
      this._calendarService.setViewDate(newWeek.startOf('week').toDate());
      this._eventService.updateDayEvents(newWeek.startOf('week').toDate());
      //update view
      this.updateWeekView();
    }
      document.getElementById("scrollable").scrollTop = 200;
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

  //highlight selected day
  onSelect(day: CalendarDay): void{
    //update selectedDayChange
    if(this._eventService.getClickedEvent() && moment(this._eventService.getClickedEvent().properties.start_time).date() != day.dayOfMonth
      && this._calendarService.getSelectedDay() != day){
      this.router.navigate( ['', {outlets: {sidebar: ['list']}}]);
    }
    // this.selectedDay = day;
    this._calendarService.setSelectedDay(day);
    //create date for that day
    let date = moment([day.year, day.month, day.dayOfMonth]).toDate();
    //update sidebar to display events for that date
    this._eventService.updateDayEvents(date);
  }

  //open event in sidebar
  openEvent(event: GeoJson): void{
    //update clicked event
    this._eventService.updateExpandedEvent(event);
    this._eventService.updateClickedEvent(event);
    //route to new event detail component
    this.router.navigate(['', {outlets: {sidebar: ['detail', event.id]}}]);
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
    //retrieve current time moment
    var now = moment();
    //calculate top position
    return this.convertTimeToPercent(now)+"%";
  }

  //convert time to top percentage in css
  convertTimeToPercent(time: Moment) {
    var increment = 3.55;
    var p = 11;
    if(time.format("A") == "PM"){
      p += 42.8;
      increment = 3.58;
    }
    p += (parseInt(time.format("H"))%12)*increment;
    p += (parseInt(time.format("mm"))/15)*(increment/4);
    return p;
  }

  // position and size event to match actual start time and duration
  styleEvent(event: GeoJson, events: GeoJson[]) {
    // CALCULATE TOP //
    var start = moment(event.properties.start_time);
    var top = this.convertTimeToPercent(start);
    // CALCULATE HEIGHT //
    var temp = moment(event.properties.end_time);
    var hours = moment.duration(temp.diff(start)).asHours();
    if(hours>24){ hours = (hours%24)+1; }
    var end = start.clone().add(hours,"hours");
    var bottom = this.convertTimeToPercent(end)
    var height = bottom-top;
    if(height<0){ height = 100-top; }
    // CALCULATE WIDTH AND LEFT //
    var overlapped = [];
    var eventIndex = 0;
    //iterate through surrounding events
    for(var j = 0; j < events.length; j++){
        if(events[j] == event){ eventIndex = overlapped.length; }
        //retrieve start and end time for new event
        var s = moment(events[j].properties.start_time);
        var t = moment(events[j].properties.end_time);
        var h = moment.duration(t.diff(s)).asHours();
        if(h>24){ h = (h%24)+1; }
        var e = s.clone().add(h,"hours");
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
    var left = 2+((98/overlapped.length)*eventIndex);
    // CALCULATE WIDTH
    var width = 98-left-(5*(overlapped.length-1-eventIndex));
    // CALCULATE ZINDEX
    var z = eventIndex+1;
    this.zIndexArray[event.id] = z;
    // account for clicked event
    var font = "normal";
    if(this.clickedEvent && this.clickedEvent.id == event.id && this.selectedDay.dayOfMonth == moment(this.clickedEvent.properties.start_time).date()){
      font = "bold";
      z = 100;
    }
    // CREATE STYLE
    var style = {
      'top' : top+"%",
      'height' : height+"%",
      'left' : left+"%",
      'width' : width+"%",
      'zIndex' : z,
      'fontWeight' : font
    }
    return style;
  }

}
