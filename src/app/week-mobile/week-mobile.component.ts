import { Component, OnInit, Output, EventEmitter, NgZone } from '@angular/core';
import { Moment } from 'moment';
import { Router, NavigationEnd } from '@angular/router';
import { ViewService } from '../services/view.service';
import { EventService } from '../services/event.service';
import { DateService } from '../services/date.service';
import { GeoJson } from '../map';
import { CalendarDay } from '../services/event.service';
import * as moment from 'moment';

@Component({
  selector: 'app-week-mobile',
  templateUrl: './week-mobile.component.html',
  styleUrls: ['./week-mobile.component.scss']
})

export class WeekMobileComponent implements OnInit {
  public days: CalendarDay[] = [];
  public currentMonth: Moment;
  private currentWeek: Moment;
  private currentDay: Moment;
  private filteredEvents: GeoJson[];
  private clickedEvent: GeoJson;
  private eventsByDay: { [day: number ] : GeoJson[] } = {};
  private zIndexArray: { [id: number] : Number } = {};
  private scrollPosition: number = 0;

  //constructor statement
  constructor(private _eventService: EventService, private _viewService: ViewService, private _dateService: DateService, private router: Router, private ngZone: NgZone) {}

  // need to convert to mobile view yikes
  ngOnInit() {

    this._viewService.changeToWeek.subscribe( function(delta) { this.changeWeek(delta); }.bind(this));

    this._eventService.currentDate$.subscribe(date => {
      this.ngZone.run( () => { this.showCalendar(date); });
    });

    this._eventService.weekEvents$.subscribe(weekEventCollection => {
      this.filteredEvents = weekEventCollection.features;
      this.fillEventsByDay();
      this.ngZone.run( () => { this.showCalendar(this._eventService.getCurrentDate()); });
      if(this._viewService.isWeekMobileView())
        document.getElementById("scrollable").scrollTop = this.scrollPosition; //figure this out
      if(this._viewService.isWeekMobileView() && this._eventService.getDays())
          this._eventService.setDateFilterFromDays(this._eventService.getDays());
    });

    this._eventService.filteredWeekEvents$.subscribe(weekEventCollection => {
      this.filteredEvents = weekEventCollection.features;
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
    this._viewService.isWeekMobileView();
    if(this._eventService.getExpandedEvent() == null){
      this.router.navigate( ['', {outlets: {sidebar: ['list']}}]);
    }

    //this.scrollPosition = document.getElementById("scrollable").scrollHeight*0.288;
    //document.getElementById("scrollable").scrollTop = this.scrollPosition;
  }

  weekString() {
    return (this.currentDay.startOf('week').format("MMMM D") + " - " + this.currentDay.startOf('week').clone().add(6, 'day').format("MMMM D, YYYY"));
  }

  //display the calendar
  showCalendar(dateInMonth: Moment | Date | string): void {
  //set currentMonth and currentWeek
    this.currentMonth = moment(dateInMonth).startOf('month');
    this.currentWeek = moment(dateInMonth).startOf('week');
    this.currentDay = moment(dateInMonth); 
    if(this._viewService.isWeekMobileView() && dateInMonth != undefined){
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
        this._eventService.setSelectedDay(weekDay);
      }
    }
    this._eventService.setDays(this.days);
    }
  }

  //increment or decrement week
  changeWeek(delta: number): void {
    // 1 means advance one week, -1 means go back one week
    let newWeek: Moment = this.currentWeek.clone().add(delta, 'week');
    // if selected day is in month, that is first option
    let viewDate;
    if (newWeek.isSame(moment(this._eventService.getCurrentDate()), 'week'))
      viewDate = this._eventService.getCurrentDate();
    else if (newWeek.isSame(moment(), 'week'))
      viewDate = new Date();
    else
      viewDate = newWeek.startOf('week').toDate();
    if(this._viewService.isWeekMobileView())
      document.getElementById("scrollable").scrollTop = this.scrollPosition;
    this._eventService.updateDayEvents(viewDate);
    this._eventService.updateWeekEvents(viewDate);
    this._eventService.updateMonthEvents(viewDate);
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

  //highlight selected day // do something with this?
  onSelect(day: CalendarDay): void{
    if(this._eventService.getClickedEvent() && this._eventService.getSelectedDay() != day &&
      moment(this._eventService.getClickedEvent().properties.start_time).date() != day.dayOfMonth){
      this.router.navigate( ['', {outlets: {sidebar: ['list']}}]);
    }
    this._eventService.setSelectedDay(day);
    this._eventService.updateDayEvents(day.date);
  }

  //open event in sidebar
  openEvent(event: GeoJson): void{
    this._eventService.updateClickedEvent(event);
    this.router.navigate(['', {outlets: {sidebar: ['detail', event.id]}}]);
    this._eventService.updateExpandedEvent(event);
  }

  //retrieve and format event title and event time
  eventName(event: GeoJson): string{
    return event.properties.name;
  }
  eventTime(event: GeoJson): string{

    return this._dateService.formatTime(event.properties.start_time) //+ "\n" + this._dateService.formatTime(event.properties.end_time);
  }

  styleEvent(event: GeoJson){
    let color = "#ABFFFF"
    for(let i = 0; i < event.properties.categories.length; i++){
      if (event.properties.categories[i] != null) {
        color = this.getEventColor(event.properties.categories[i]);
        break;
      }
    }
    let style = {
      "background-color" : color + "5F", //"7F" for transparency
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

  // position and size event to match actual start time and duration
  /*
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
      this._eventService.getSelectedDay().dayOfMonth == moment(this.clickedEvent.properties.start_time).date()){
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
  */

}
