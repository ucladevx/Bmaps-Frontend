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
  selector: 'app-three-day',
  templateUrl: './three-day.component.html',
  styleUrls: ['./three-day.component.scss']
})

export class ThreeDayComponent implements OnInit {
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

  ngOnInit() {
    this._viewService.changeToThreeDay.subscribe( function(delta) { this.changeThreeDay(delta); }.bind(this));

    this._eventService.currentDate$.subscribe(date => {
      this.ngZone.run( () => { this.showCalendar(date); });
    });

    this._eventService.threeDayEvents$.subscribe(threeDayEventCollection => {
      this.filteredEvents = threeDayEventCollection.features;
      this.fillEventsByDay();
      this.ngZone.run( () => { this.showCalendar(this._eventService.getCurrentDate()); });
      if(this._viewService.isThreeDayView())
        document.getElementById("scrollable").scrollTop = this.scrollPosition;
      if(this._viewService.isThreeDayView() && this._eventService.getDays())
          this._eventService.setDateFilterFromDays(this._eventService.getDays());
    });

    this._eventService.filteredThreeDayEvents$.subscribe(threeDayEventCollection => {
      this.filteredEvents = threeDayEventCollection.features;
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
    this._viewService.isThreeDayView();
    if(this._eventService.getExpandedEvent() == null){
      this.router.navigate( ['', {outlets: {sidebar: ['list']}}]);
    }

    this.scrollPosition = document.getElementById("scrollable").scrollHeight*0.288;
    document.getElementById("scrollable").scrollTop = this.scrollPosition;

  }

  //display the calendar
  showCalendar(dateInMonth: Moment | Date | string): void {
    //set currentMonth and currentWeek
    this.currentMonth = moment(dateInMonth).startOf('month');
    this.currentWeek = moment(dateInMonth).startOf('week');
    this.currentDay = moment(dateInMonth);

    if(this._viewService.isThreeDayView() && dateInMonth != undefined){
      // range of days shown on calendar
      let firstDay: Moment;
      // first day should be first of group
      
      let numDaysDiff = this.currentDay.startOf('day').diff(moment().startOf('day'), 'days');
      // 0 means first day of group, 1 - second, 2 - third
      let dayOfGroup;
      if (numDaysDiff >= 0) {
        dayOfGroup = (numDaysDiff % 3 == 0) ? 0 : ((numDaysDiff % 3 == 1) ? 1 : 2);
      }
      else {
        numDaysDiff *= -1;
        dayOfGroup = (numDaysDiff % 3 == 0) ? 0 : ((numDaysDiff % 3 == 1) ? 2 : 1);
      }

      firstDay = this.currentDay.clone().add(-1*dayOfGroup, 'days');
      let lastDay: Moment = firstDay.clone().add(3, 'days');

      if(parseInt(lastDay.format('DD')) == 2 && parseInt(lastDay.format('DD')) == 3)
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

  //increment or decrement day
  changeThreeDay(delta: number): void {
    // 1 means advance three days, -1 means go back three days
    let newDay: Moment = this.currentDay.clone().add(delta*3, 'days');
    let selectedDay = moment(this._eventService.getSelectedDay());

    let viewDate;

    // today is always the first day in a group of three, so calculate the groups of three based off this!

    // Days to check if newDay is in today's group of 3
    let tomorrow = moment().add(1, 'days');
    // third day is the day after tomorrow
    let thirdDay = tomorrow.clone().add(1, 'days');

    // To check if newDay is in selected day's group of 3
    let numDaysDiff = selectedDay.startOf('day').diff(moment().startOf('day'), 'days');  // gets # of days diff from selected and today
    // 0 means first day of group, 1 - second, 2 - third
    let dayOfGroup = (numDaysDiff % 3 == 0) ? 0 : ((numDaysDiff % 3 == 1) ? 1 : 2);

    let selectedDayGroupDayTwo;
    let selectedDayGroupDayThree;
    if (dayOfGroup == 0) {
      // selectedDay is first day of group of 3 --> check next 2 days
      selectedDayGroupDayTwo = selectedDay.clone().add(1, 'days');
      selectedDayGroupDayThree = selectedDay.clone().add(2, 'days');
    }
    else if (dayOfGroup == 1) {
      // selectedDay is second day of group --> check prev and next day
      selectedDayGroupDayTwo = selectedDay.clone().add(-1, 'days');
      selectedDayGroupDayThree = selectedDay.clone().add(1, 'days');
    }
    else {
      // selectedDay is third day of group --> check prev 2 days
      selectedDayGroupDayTwo = selectedDay.add(-2, 'days');
      selectedDayGroupDayThree = selectedDay.add(-1, 'days');
    }


    if (newDay.isSame(moment(this._eventService.getCurrentDate()), 'day') || 
        newDay.isSame(selectedDayGroupDayTwo, 'day') || newDay.isSame(selectedDayGroupDayThree, 'day'))
      // newDay same as selected day's group of 3
      viewDate = this._eventService.getCurrentDate();
    // if same group as today
    else if (newDay.isSame(moment(), 'day') || newDay.isSame(tomorrow, 'day') || newDay.isSame(thirdDay, 'day'))
      // set selected date to today
      viewDate = new Date();
    else
      viewDate = newDay.toDate();
    if(this._viewService.isThreeDayView())
      document.getElementById("scrollable").scrollTop = this.scrollPosition;
    this._eventService.updateDayEvents(viewDate);
    this._eventService.updateThreeDayEvents(viewDate);
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

  //highlight selected day
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
    return this._dateService.formatTime(event.properties.start_time) + " - " + this._dateService.formatTime(event.properties.end_time);
  }

  //determine the position of the current time bar
  currentTime() {
    let now = moment();
    return this.convertTimeToPercent(now)+"%";
  }

  //convert time to top percentage in css
  convertTimeToPercent(time: Moment) {
    let increment = 3.55;
    let p = 11;
    if (window.outerHeight <= 768) p = 5;  // mobile view
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

}
